const express = require('express');
const { Firestore } = require('@google-cloud/firestore');

const router = express.Router();
const firestore = new Firestore();
const userAppointments = firestore.collection('user-appointments');

router.get('/:id', async (req, res) => {
    if (req.params.id !== req.user.user_id) {
        res.status(401).json({ error: 'Not authorized to get  appointment' });
        return;
    }
    const userAppointmentRef = userAppointments.doc(req.params.id);
    const userAppointmentDoc = await userAppointmentRef.get();
    if (!userAppointmentDoc.exists) {
        res.status(404).json({ error: 'User appointments not found' });
        return;
    }

    res.send(userAppointmentDoc.data());
});

module.exports = router;
