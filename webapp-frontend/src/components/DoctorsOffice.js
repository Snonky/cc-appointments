import React, { useState, useEffect } from 'react';
import { useRouteMatch, generatePath, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'
import AppointmentCalendar from './AppointmentCalendar'
import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';
import OpeningHours from './OpeningHours';

export default function DoctorsOffice() {
    const [office, setOffice] = useState();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { params } = useRouteMatch();
    const { currentUser, authenticatedRequest } = useAuth();

    function errorHandler(error) {
        console.error(error);
        setError("Doctor's office page cannot be displayed.");
        setLoading(false);
    }

    function fetchOffice() {
        setLoading(true);
        setError(null);
        authenticatedRequest('GET', generatePath('/doctors-offices/:officeId', params))
            .then((fetchedOffice) => {
                setOffice(fetchedOffice);
                setLoading(false);
            })
            .catch(errorHandler);
    }

    function fetchAppointments() {
        setError(null);
        authenticatedRequest('GET', generatePath('/doctors-offices/:officeId/appointments', params))
            .then((fetchedAppointments) => {
                setAppointments(fetchedAppointments);
            })
            .catch(errorHandler);
    }

    useEffect(() => {
        fetchOffice();
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return <p>{error}</p>;
    } else if (loading) {
        return <LoadingSpinner />
    } else {
        console.log(office.ownerId)
        console.log(currentUser.uid)
        return (
            <div id="office" className="flex flex-col lg:w-8/12 md:w-full mx-auto space-y-6 mb-40">
                <div id="title" className="relative flex flex-col justify-center h-20 bg-blue-200 text-center text-2xl rounded border-2 border-gray-400">
                    <p>{office.name}</p>
                    {
                        currentUser.uid === office.ownerId ?
                            <Link to={generatePath('/office/:officeId/edit', params)} className="absolute right-5" title="Edit your office's page">
                                <svg
                                    xmlns={"http://www.w3.org/2000/svg"}
                                    aria-hidden={"true"}
                                    focusable={"false"}
                                    width={"1em"}
                                    height={"1em"}
                                    style={{ "-ms-transform": "rotate(360deg)", "-webkit-transform": "rotate(360deg)", "transform": "rotate(360deg)", "preserveAspectRatio": "xMidYMid meet", "viewBox": "0 0 24 24" }}>
                                    <path d={"M8.707 19.707L18 10.414L13.586 6l-9.293 9.293a1.003 1.003 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263zM21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586L19.414 9L21 7.414z"} fill={"#626262"} />
                                </svg>
                            </Link>
                            :
                            null
                    }
                </div>
                <div id="content" className="flex flex-row justify-between space-x-2">
                    <div id="content-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 2 }}>
                        <div id="description" className="p-3 rounded border-2 border-gray-300">
                            {office.profileDescription}
                        </div>
                        <div id="calendar" className="p-3 rounded border-2 border-gray-300">
                            <div id="calender-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                <p>Appointments</p>
                            </div>
                            <AppointmentCalendar
                                appointments={appointments || []}
                                fetchAppointments={fetchAppointments}
                                dayCount={office.dayCount || 5}
                                currentTime={new Date()}
                                openingHours={office.openingHours || []}
                                timeSlot={office.timeSlot || 30}
                                selectable={true}
                            />
                        </div>
                    </div>
                    <div id="sidebar-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 1 }}>
                        <div id="avatar" className="p-3 rounded border-2 border-gray-300 items-center">
                            <ImageList imageUrls={[office.avatarUrl]} />
                        </div>
                        <div id="opening-hours" className="p-3 rounded border-2 border-gray-300">
                            <div id="opening-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                <p>Opening Hours</p>
                            </div>
                            <OpeningHours openingHours={office.openingHours || []} />
                        </div>
                        <div id="address" className="p-3 rounded border-2 border-gray-300">
                            <div id="address-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                <p>Address</p>
                            </div>
                            {office.address?.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
                        </div>
                        <div id="address" className="p-3 rounded border-2 border-gray-300">
                            <ImageList imageUrls={office.pictureUrls || []} />
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}