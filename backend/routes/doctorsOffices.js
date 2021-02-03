const express = require('express');
var router = express.Router();

const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
const docsOffices = firestore.collection('doctors-offices');

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


// appointments of one doctors office

router.get('/:id/appointments', async (req, res) => {
	const docsRef = docsOffices.doc(req.params.id).collection('appointments');
	const snapshot = await docsRef.get();
	const results = [];
	snapshot.forEach(doc => {
		results.push({ 'id': doc.id, ...doc.data() });
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
	res.send({ 'id': req.params.id });
});

module.exports = router;