const express = require('express');
var router = express.Router();

const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
const userAppointments = firestore.collection('user-appointments');

const validateUserAppointment = require('../schema/userAppointment');


router.get('/:id', async (req, res) => {
	const docRef = userAppointments.doc(req.params.id);
	const document = await docRef.get();
	if (!document.exists) {
		res.status(404).json({ error: 'User appointments not found' });
	} else {
		res.send(document.data());
	}
});

router.post('/:id', async (req, res) => {
	const docRef = userAppointments.doc(req.params.id);
	const document = await docRef.get();
	if (!document.exists) {
		await docRef.set({ 'appointments': [] });
	}
	if (validateUserAppointment(req.body)) {
		const addRes = await docRef.update({
			appointments: Firestore.FieldValue.arrayUnion(req.body)
		});
		const newDocument = await docRef.get();
		res.send(newDocument.data());
	} else {
		res.status(422).json({ error: 'Request is not valid' });
	}
});

router.delete('/:id', async (req, res) => {
	const docRef = userAppointments.doc(req.params.id);
	const document = await docRef.get();
	if (!document.exists) {
		res.status(404).json({ error: 'User has no appointments' });
	} else {
		if (validateUserAppointment(req.body)) {
			const addRes = await docRef.update({
				appointments: Firestore.FieldValue.arrayRemove(req.body)
			});
			const newDocument = await docRef.get();
			res.send(newDocument.data());
		} else {
			res.status(422).json({ error: 'Request is not valid' });
		}
	}
});

module.exports = router;