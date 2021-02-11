const express = require('express');
const { Firestore } = require('@google-cloud/firestore');

const router = express.Router();
const firestore = new Firestore();
const userAppointments = firestore.collection('user-appointments');

router.get('/:id', async (req, res) => {
    if (req.params.id !== req.user.user_id) {
        res.status(404).json({ error: 'Not authorized to get  appointment' });
        return;
    }
    const docRef = userAppointments.doc(req.params.id);
    const document = await docRef.get();
    if (!document.exists) {
        res.status(404).json({ error: 'User appointments not found' });
    } else {
        res.send(document.data());
    }
});

module.exports = router;
