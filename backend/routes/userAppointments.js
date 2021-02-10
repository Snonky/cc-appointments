const express = require('express');
var router = express.Router();

const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
const userAppointments = firestore.collection('user-appointments');

router.get('/:id', async (req, res) => {
	const docRef = userAppointments.doc(req.params.id);
	const document = await docRef.get();
	if (!document.exists) {
		res.status(404).json({ error: 'User appointments not found' });
	} else {
		res.send(document.data());
	}
});

module.exports = router;