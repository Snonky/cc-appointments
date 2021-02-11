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

router.get('/', async (req, res) => {
    const snapshot = await docsOffices.get();
    const results = [];
    snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
    });
    res.send(results);
});

router.get('/:id', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id);
    const document = await docRef.get();
    if (!document.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
    } else {
        res.send(document.data());
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
    if (!validateDoctorsOffice(req.body)) {
        res.status(422).json({ error: 'Request is not valid' });
        return;
    }
    const docRef = docsOffices.doc(req.params.id);
    try {
        await docRef.update(req.body);
        res.send(req.body);
    } catch (error) {
        res.status(404).json({ error: 'Doctors Office not found' });
    }
});

router.delete('/:id', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id);
    await docRef.delete();
    res.send({ id: req.params.id });
});

// image upload

router.post('/:id/upload-avatar', multer.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).send({ error: 'No file uploaded' });
        return;
    }
    const filetypes = /jpeg|jpg|png/;
    if (!filetypes.test(req.file.mimetype)) {
        res.status(422).send({ error: 'Wrong filetype uploaded (only jpg, jpeg or png are supported)' });
        return;
    }
    const docRef = docsOffices.doc(req.params.id);
    const document = await docRef.get();
    if (!document.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
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
        await docRef.update({
            avatarUrl: publicUrl,
        });
        const newDocument = await docRef.get();
        res.send(newDocument.data());
    });
    blobStream.end(req.file.buffer);
});

router.post('/:id/upload-pictures', multer.array('files'), async (req, res) => {
    if (req.files.length === 0) {
        res.status(400).send('No files uploaded');
        return;
    }

    const docRef = docsOffices.doc(req.params.id);
    const document = await docRef.get();
    if (!document.exists) {
        res.status(404).json({ error: 'Doctors Office not found' });
        return;
    }
    if (!('pictureUrls' in document)) {
        docRef.set({ pictureUrls: [] });
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
                docRef.update({
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
            docRef.get().then((newDocument) => {
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

// appointments of one doctors office

router.get('/:id/appointments', async (req, res) => {
    const docsRef = docsOffices.doc(req.params.id).collection('appointments');
    const snapshot = await docsRef.get();
    const results = [];
    snapshot.forEach((doc) => {
        results.push({ id: doc.id, dateTime: doc.data().dateTime });
    });
    res.send(results);
});

router.get('/:id/appointments/:appointmentId', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id).collection('appointments').doc(req.params.appointmentId);
    const document = await docRef.get();
    if (!document.exists) {
        res.status(404).json({ error: 'Appointment not found' });
    } else {
        res.send(document.data());
    }
});

router.post('/:id/appointments', async (req, res) => {
    if (!validateAppointment(req.body)) {
        res.status(422).json({ error: 'Request is not valid' });
        return;
    }

    const snapshot = await docsOffices.doc(req.params.id).collection('appointments').where('dateTime', '==', req.body.dateTime).get();
    if (!snapshot.empty) {
        res.status(422).json({ error: 'Appointment already booked' });
        return;
    }

    const addRes = await docsOffices.doc(req.params.id).collection('appointments').add(req.body);
    const docRef = userAppointments.doc(req.user.user_id);
    const document = await docRef.get();
    if (!document.exists) {
        await docRef.set({ appointments: [] });
    }
    await docRef.update({
        appointments: Firestore.FieldValue.arrayUnion({
            appointmentId: addRes.id,
            doctorsOfficeId: req.params.id,
        }),
    });

    res.send({ id: addRes.id, ...req.body });
});

router.delete('/:id/appointments/:appointmentId', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id).collection('appointments').doc(req.params.appointmentId);
    const ownerId = await docsOffices.doc(req.params.id).get().data().ownerId;
    const appointmentUserId = await docRef.get().data().userId;
    if (req.user.user_id !== appointmentUserId || req.user.user_id !== ownerId) {
        res.status(401).json({ error: 'Not authorized to delete this appointment' });
        return;
    }
    await docRef.delete();
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
