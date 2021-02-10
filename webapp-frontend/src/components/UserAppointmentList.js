import React, { useEffect, useState } from 'react';
import { generatePath } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserAppointmentList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, authenticatedRequest } = useAuth();

    function errorHandler(error) {
        console.error(error);
        setError("Doctor's office page cannot be displayed.");
        setLoading(false);
    }

    function fetchUserAppointments() {
        setError(null);
        setLoading(true);
        authenticatedRequest('GET', generatePath('/user-appointments/:userId', { userId: currentUser.uid }))
            .then((fetchedAppointments) => {
                console.log(fetchedAppointments.appointments);
                fetchAppointmentDetails(fetchedAppointments.appointments);
            })
            .catch(errorHandler);
    }

    function fetchAppointmentDetails(userAppointments) {
        const fetches = userAppointments.map(appointment => {
            return authenticatedRequest('GET', generatePath('/doctors-offices/:officeId/appointments/:appointmentId',
                { officeId: appointment.doctorsOfficeId, appointmentId: appointment.appointmentId }));
        });
        Promise.all(fetches).then((fetchedAppointments) => {
            setAppointments(fetchedAppointments);
            setLoading(false);
        })
            .catch(errorHandler);
    }

    useEffect(() => {
        fetchUserAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return <p>Profile can not be displayed.</p>;
    }
    else if (loading) {
        return <p>Loading...</p>;
    } else {
        return (
            <div>
                {
                    appointments.map((appointment) => {
                        return <p>{appointment.reasonForVisit}</p>;
                    })
                }
            </div>
        );
    }
}