const express = require('express');
var router = express.Router();

const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
const docsOffices = firestore.collection('doctors-offices');

const { v4: uuidv4 } = require('uuid');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('cc-appointments-images');

const Multer = require('multer');
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
    snapshot.forEach(doc => {
        results.push({ 'id': doc.id, ...doc.data() });
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
    if (validateDoctorsOffice(req.body)) {
        const addRes = await docsOffices.add(req.body);
        res.send({ 'id': addRes.id, ...req.body });
    } else {
        res.status(422).json({ error: 'Request is not valid' });
    }
});

router.put('/:id', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id);
    if (validateDoctorsOffice(req.body)) {
        try {
            const updateRes = await docRef.update(req.body);
            res.send(req.body);
        } catch (error) {
            res.status(404).json({ error: 'Doctors Office not found' })
        }
    } else {
        res.status(422).json({ error: 'Request is not valid' });
    }
});

router.delete('/:id', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id);
    const deleteRes = await docRef.delete();
    res.send({ 'id': req.params.id });
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
    blobStream.on('error', err => {
        // res.status(400).json({
        // 	error: 'Error uploading file',
        // 	message: err
        // });
        // return;
        console.error(err);
    });
    blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/cc-appointments-images/${blob.name}`;
        const addRes = await docRef.update({
            avatarUrl: publicUrl
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
    if (!'pictureUrls' in document) {
        docRef.set({ 'pictureUrls': [] });
    }


    const uploads = [];
    for (const file of req.files) {
        const filetypes = /jpeg|jpg|png/;
        if (!filetypes.test(file.mimetype)) {
            res.status(422).send({ error: 'Wrong filetype uploaded (only jpg, jpeg or png are supported)' });
            return;
        }
        const fileName = `${uuidv4()}-${file.originalname}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream();
        const upload = new Promise((resolve, reject) => {
            blobStream.on('error', err => {
                reject(err);
            });
            blobStream.on('finish', () => {
                docRef.update({
                    pictureUrls: Firestore.FieldValue.arrayUnion(`https://storage.googleapis.com/cc-appointments-images/${blob.name}`)
                })
                    .then(resolve);
            });
        });
        uploads.push(upload);
        blobStream.end(file.buffer);
    }

    Promise.all(uploads)
        .then(() => {
            docRef.get().then(newDocument => {
                res.send(newDocument.data());
            })
        })
        .catch(err => {
            res.status(400).json({
                error: 'Error uploading file',
                message: err
            });
        });
});

// TODO delete pictures


// appointments of one doctors office

router.get('/:id/appointments', async (req, res) => {
    const docsRef = docsOffices.doc(req.params.id).collection('appointments');
    const snapshot = await docsRef.get();
    const results = [];
    snapshot.forEach(doc => {
        results.push({ 'id': doc.id, 'dateTime': doc.data().dateTime });
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
    if (validateAppointment(req.body)) {
        const addRes = await docsOffices.doc(req.params.id).collection('appointments').add(req.body);
        res.send({ 'id': addRes.id, ...req.body });
    } else {
        res.status(422).json({ error: 'Request is not valid' });
    }
});

router.put('/:id/appointments/:appointmentId', async (req, res) => {
    if (validateAppointment(req.body)) {
        const docRef = docsOffices.doc(req.params.id).collection('appointments').doc(req.params.appointmentId);
        const updateRes = await docRef.update(req.body);
        res.send(req.body);
    } else {
        res.status(422).json({ error: 'Request is not valid' });
    }
});

router.delete('/:id/appointments/:appointmentId', async (req, res) => {
    const docRef = docsOffices.doc(req.params.id).collection('appointments').doc(req.params.appointmentId);
    const deleteRes = await docRef.delete();
    res.send({ 'id': req.params.appointmentId });
});

module.exports = router;