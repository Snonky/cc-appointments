import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function UserAppointmentList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
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
            .then((fetchedUserAppointments) => fetchAppointmentDetails(fetchedUserAppointments.appointments))
            .catch(errorHandler);
    }

    function fetchAppointmentDetails(userAppointments) {
        const appointmentRequests = userAppointments.map(appointment => {
            return authenticatedRequest('GET', generatePath('/doctors-offices/:officeId/appointments/:appointmentId',
                { officeId: appointment.doctorsOfficeId, appointmentId: appointment.appointmentId }));
        });
        const officeIds = [...new Set(userAppointments.map((appointment) => appointment.doctorsOfficeId))];
        const officeRequests = officeIds.map(officeId => {
            return authenticatedRequest('GET', generatePath('/doctors-offices/:officeId',
                { officeId: officeId }));
        });
        Promise.all([Promise.all(appointmentRequests), Promise.all(officeRequests)])
            .then(([fetchedAppointments, fetchedOffices]) => {
                userAppointments.forEach((userAppointment, idx) => {
                    fetchedAppointments[idx].id = userAppointment.appointmentId;
                    fetchedAppointments[idx].doctorsOfficeId = userAppointment.doctorsOfficeId;
                    fetchedAppointments[idx].office = fetchedOffices[officeIds.indexOf(userAppointment.doctorsOfficeId)];
                });
                setAppointments(fetchedAppointments);
                setLoading(false);
            })
            .catch(errorHandler);
    }

    useEffect(() => {
        fetchUserAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleAppointmentCancel(appointment) {
        setCancelling(true);
        authenticatedRequest('DELETE', generatePath('/doctors-offices/:officeId/appointments/:appointmentId',
            { officeId: appointment.doctorsOfficeId, appointmentId: appointment.id }))
            .then(() => {
                const newAppointments = [...appointments].filter(a => a.id !== appointment.id);
                setAppointments(newAppointments);
                setCancelling(false);
            })
            .catch((error) => {
                console.error("Could not cancel appointment: " + error);
                setCancelling(false);
            });
    }

    if (error) {
        return <p>Profile can not be displayed.</p>;
    }
    else if (loading) {
        return <LoadingSpinner />;
    } else {
        return (
            <div className="flex flex-col lg:w-8/12 md:w-full mx-auto space-y-6 mb-40">
                <div id="title" className="flex flex-col justify-center h-20 bg-blue-200 text-center text-2xl rounded border-2 border-gray-400">
                    <p>Your Appointments</p>
                </div>
                {
                    appointments.map((appointment) => {
                        return <AppointmentListEntry
                            appointment={appointment}
                            handleAppointmentCancel={handleAppointmentCancel}
                            cancelling={cancelling}
                            key={appointment.id}
                        />;
                    })
                }
            </div >
        );
    }
}

function AppointmentListEntry({ appointment, handleAppointmentCancel, cancelling }) {
    const dateStr = DateTime.fromISO(appointment.dateTime).toLocaleString({ weekday: 'long', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return (
        <div className="p-3 rounded border-2 border-gray-300 bg-blue-50">
            <div className="flex flex-row justify-between">
                <p className="text-lg font-semibold mb-2">{dateStr}</p>
                <button
                    className="mb-1 -mt-1 bg-red-300 rounded-lg text-gray-800 border-2 border-red-400 p-1"
                    onClick={() => { handleAppointmentCancel(appointment) }}
                    disabled={cancelling}
                >
                    {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>
            </div>
            <hr />
            <div className="flex lg:flex-row flex-col justify-between mt-2 mr-5">
                <div className="max-w-prose">
                    <p className="text-lg font-semibold">Details</p>
                    <p className="ml-1">{appointment.reasonForVisit}</p>
                </div>
                <div className="flex lg:flex-row flex-col lg:space-x-16">
                    <div>
                        <p className="text-lg font-semibold">Insurance</p>
                        <p className="ml-1" >{appointment.typeOfInsurance}</p>
                    </div>
                    <div>
                        <p className="text-lg font-semibold">Doctor's Office</p>
                        <div className="flex lg:flex-row flex-col lg:space-x-16">
                            <div>
                                <Link to={generatePath('/office/:officeId', { officeId: appointment.doctorsOfficeId })}>
                                    <p className="ml-1 underline hover:no-underline">{appointment.office.name}</p>
                                </Link>
                            </div>
                            <div>
                                {appointment.office.address?.split('\n').map((line, idx) => <p className="whitespace-nowrap ml-1" key={idx}>{line}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );

}