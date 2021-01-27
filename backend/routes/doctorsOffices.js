const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

const express = require('express');
var router = express.Router();

router.get('/', async (req, res) => {
	const docsRef = firestore.collection('doctors-office');
	const snapshot = await docsRef.get();
	const results = [];
	snapshot.forEach(doc => {
		results.push({ 'id': doc.id, ...doc.data() });
	});
	res.send(results);
});

router.get('/:id', async (req, res) => {
	const docRef = firestore.collection('doctors-office').doc(req.params.id);
	const document = await docRef.get();
	if (!document.exists) {
		res.status(404).json({ error: 'Doctors Office not found' })
	} else {
		res.send(document.data());
	}
});

router.post('/', async (req, res) => {
	const addRes = await firestore.collection('doctors-office').add(req.body);
	res.send({ 'id': addRes.id, ...req.body });
});

router.put('/:id', async (req, res) => {
	const docRef = firestore.collection('doctors-office').doc(req.params.id);
	const updateRes = await docRef.update(req.body);
	res.send(req.body);
});

router.delete('/:id', async (req, res) => {
	const docRef = firestore.collection('doctors-office').doc(req.params.id);
	const deleteRes = await docRef.delete();
	res.send({ 'id': req.params.id });
});

module.exports = router;