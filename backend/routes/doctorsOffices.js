const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const firestore = new Firestore();
const docsOffices = firestore.collection('doctors-offices');
const userAppointments = firestore.collection('user-appointments');

const storage = new Storage();
const bucket = storage.bucket('cc-appointments-images');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

const validateDoctorsOffice = require('../schema/doctorsOffice');
const validateAppointment = require('../schema/appointment');

/**
 * These are the paths that for doctors offices themselves
 */

router.get('/', async (req, res) => {
    const snapshot = await docsOffices.get();
    const results = [];
    snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
    });
    res.send(results);
});

router.get('/:id', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
    } else {
        res.send(docsOfficeDoc.data());
    }
});

router.post('/', async (req, res) => {
    if (!validateDoctorsOffice(req.body)) {
        res.status(422).json({ error: 'Request is not valid' });
        return;
    }

    const addRes = await docsOffices.add(req.body);
    res.send({ id: addRes.id, ...req.body });
});

router.put('/:id', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
        return;
    }
    if (req.user.user_id !== docsOfficeDoc.data().ownerId) {
        res.status(401).json({ error: 'Not authorized to change this doctors office' });
        return;
    }
    if (!validateDoctorsOffice(req.body)) {
        res.status(422).json({ error: 'Request is not valid' });
        return;
    }
    await docsOfficeRef.update(req.body);
    res.send(req.body);
});

router.delete('/:id', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
        return;
    }
    if (req.user.user_id !== docsOfficeDoc.data().ownerId) {
        res.status(401).json({ error: 'Not authorized to delete this doctors office' });
        return;
    }
    await docsOfficeRef.delete();
    res.send({ id: req.params.id });
});

/**
 * These are the paths that handle uploading images to a doctors office (it's
 * avatar or logo and pictures)
 */

router.post('/:id/upload-avatar', multer.single('file'), async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
        return;
    }
    if (req.user.user_id !== docsOfficeDoc.data().ownerId) {
        res.status(401).json({ error: 'Not authorized to upload images to this doctors office' });
        return;
    }
    if (!req.file) {
        res.status(400).send({ error: 'No file uploaded' });
        return;
    }
    const filetypes = /jpeg|jpg|png/;
    if (!filetypes.test(req.file.mimetype)) {
        res.status(422).send({ error: 'Wrong filetype uploaded (only jpg, jpeg or png are supported)' });
        return;
    }

    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream();
    blobStream.on('error', () => {
        res.status(400).json({
            error: 'Error uploading file',
        });
    });
    blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/cc-appointments-images/${blob.name}`;
        await docsOfficeRef.update({
            avatarUrl: publicUrl,
        });
        const newDocument = await docsOfficeRef.get();
        res.send(newDocument.data());
    });
    blobStream.end(req.file.buffer);
});

router.post('/:id/upload-pictures', multer.array('files'), async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors office not found' });
        return;
    }
    if (req.user.user_id !== docsOfficeDoc.data().ownerId) {
        res.status(401).json({ error: 'Not authorized to upload images to this doctors office' });
        return;
    }
    if (req.files.length === 0) {
        res.status(400).send('No files uploaded');
        return;
    }

    const uploads = [];
    const filetypes = /jpeg|jpg|png/;
    /* eslint-disable no-restricted-syntax */
    for (const file of req.files) {
        if (!filetypes.test(file.mimetype)) {
            res.status(422).send({ error: 'Wrong filetype uploaded (only jpg, jpeg or png are supported)' });
            return;
        }
        const fileName = `${uuidv4()}-${file.originalname}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream();
        const upload = new Promise((resolve, reject) => {
            blobStream.on('error', (err) => {
                reject(err);
            });
            blobStream.on('finish', () => {
                docsOfficeRef.update({
                    pictureUrls: Firestore.FieldValue.arrayUnion(`https://storage.googleapis.com/cc-appointments-images/${blob.name}`),
                })
                    .then(resolve);
            });
        });
        uploads.push(upload);
        blobStream.end(file.buffer);
    }

    Promise.all(uploads)
        .then(() => {
            docsOfficeRef.get().then((newDocument) => {
                res.send(newDocument.data());
            });
        })
        .catch((err) => {
            res.status(400).json({
                error: 'Error uploading file',
                message: err,
            });
        });
});

// TODO delete pictures

/**
 * These are the paths that are for appointments of a specific doctors office
 */

router.get('/:id/appointments', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors office not found' });
        return;
    }

    const appointmentsRef = docsOfficeRef.collection('appointments');
    const snapshot = await appointmentsRef.get();
    const results = [];
    snapshot.forEach((doc) => {
        results.push({ id: doc.id, dateTime: doc.data().dateTime });
    });

    res.send(results);
});

router.get('/:id/appointments/:appointmentId', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors office not found' });
        return;
    }
    const appointmentRef = docsOfficeRef.collection('appointments').doc(req.params.appointmentId);
    const appointmentDoc = await appointmentRef.get();
    if (!appointmentDoc.exists) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
    }

    const { ownerId } = docsOfficeDoc.data();
    const { userId } = appointmentDoc.data();
    if (req.user.user_id !== userId && req.user.user_id !== ownerId) {
        res.status(401).json({ error: 'Not authorized to get this appointment' });
        return;
    }

    res.send(appointmentDoc.data());
});

router.post('/:id/appointments', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors office not found' });
        return;
    }
    if (!validateAppointment(req.body)) {
        res.status(422).json({ error: 'Request is not valid' });
        return;
    }
    const appointmentsRef = docsOfficeRef.collection('appointments');
    const snapshot = await appointmentsRef.where('dateTime', '==', req.body.dateTime).get();
    if (!snapshot.empty) {
        res.status(400).json({ error: 'Appointment already booked' });
        return;
    }

    const addRes = await appointmentsRef.add(req.body);
    const userAppointmentRef = userAppointments.doc(req.user.user_id);
    const userAppointmentDoc = await userAppointmentRef.get();
    if (!userAppointmentDoc.exists) {
        await userAppointmentRef.set({ appointments: [] });
    }
    await userAppointmentRef.update({
        appointments: Firestore.FieldValue.arrayUnion({
            appointmentId: addRes.id,
            doctorsOfficeId: req.params.id,
        }),
    });

    res.send({ id: addRes.id, ...req.body });
});

router.delete('/:id/appointments/:appointmentId', async (req, res) => {
    const docsOfficeRef = docsOffices.doc(req.params.id);
    const docsOfficeDoc = await docsOfficeRef.get();
    if (!docsOfficeDoc.exists) {
        res.status(404).json({ error: 'Doctors office not found' });
        return;
    }
    const appointmentRef = docsOfficeRef.collection('appointments').doc(req.params.appointmentId);
    const appointmentDoc = await appointmentRef.get();
    if (!appointmentDoc.exists) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
    }

    const { ownerId } = docsOfficeDoc.data();
    const { userId } = appointmentDoc.data();
    if (req.user.user_id !== userId && req.user.user_id !== ownerId) {
        res.status(401).json({ error: 'Not authorized to delete this appointment' });
        return;
    }

    await appointmentRef.delete();
    const userDocRef = userAppointments.doc(req.user.user_id);
    await userDocRef.update({
        appointments: Firestore.FieldValue.arrayRemove({
            appointmentId: req.params.appointmentId,
            doctorsOfficeId: req.params.id,
        }),
    });

    res.send({ id: req.params.appointmentId });
});

module.exports = router;
