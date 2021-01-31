import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import AppointmentCalendar from './AppointmentCalendar'

const testAppointments = [
    {
        id: 0,
        datetime: new Date('January 31, 2021 9:30:00'),
    },
    {
        id: 1,
        datetime: new Date('January 31, 2021 12:00:00'),
    },
    {
        id: 2,
        datetime: new Date('January 31, 2021 14:30:00'),
    },
];

const testOpeningHours = [...Array(7).keys()].map((day) => {
    return {
        day_of_week: day,
        open: new Date('January 1, 1970 8:00:00'),
        close: new Date('January 1, 1970 16:30:00'),
    };
});

const testSearchResults = [
    { id: 0, appointments: testAppointments, openingHours: testOpeningHours },
    { id: 1, appointments: testAppointments, openingHours: testOpeningHours },
    { id: 2, appointments: testAppointments, openingHours: testOpeningHours },
    { id: 3, appointments: testAppointments, openingHours: testOpeningHours },
];

export default function DoctorsOffice() {
    const [office, setOffice] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { params } = useRouteMatch();

    useEffect(() => {
        setLoading(true);
        setError(null);
        const officeId = params.officeId;
        // Replace with API call here
        const fetchedOffice = testSearchResults[officeId];
        if (fetchedOffice) {
            setLoading(false);
            setOffice(fetchedOffice);
        } else {
            setError("Doctor's office page cannot be displayed.");
        }
    }, []);

    if (error) {
        return <p>{error}</p>;
    } else if (loading) {
        return <p>Loading...</p>;
    } else {
        return (
            /*
            <>
                <p>{office.id}</p>

            </>
            */
            <div id="office" className="flex flex-col md:w-8/12 sm:w-full mx-auto space-y-6">
                <div id="title" className="flex flex-col justify-center h-20 bg-blue-100 text-center text-2xl rounded border-2 border-gray-400">
                    <p>HNO Praxis am Altschauerberg</p>
                </div>
                <div id="content" className="flex flex-row justify-between space-x-2">
                    <div id="content-column" className="flex flex-col w-8/12 space-y-3">
                        <div id="description" className="p-3 rounded border-2 border-gray-300">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                        </div>

                        <div id="calendar" className="p-3 rounded border-2 border-gray-300">
                            <div id="calender-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                <p>Appointments</p>
                            </div>
                            <AppointmentCalendar
                                appointments={office.appointments}
                                dayCount={5}
                                currentTime={new Date()}
                                openingHours={office.openingHours}
                                timeSlot={30}
                            />
                        </div>
                    </div>
                    <div id="sidebar-column" className="flex flex-col flex-grow space-y-3">
                        <div id="avatar" className="p-3 rounded border-2 border-gray-300">
                            <p className="text-lg">Profile Picture</p>
                        </div>
                        <div id="address" className="p-3 rounded border-2 border-gray-300">
                            <p className="text-lg">Address:</p>
                            <p>HNO Praxis am Altschauerberg</p>
                            <p>Altschauerberg 8</p>
                            <p>12345 Entenhausen</p>
                        </div>
                        <div id="address" className="p-3 rounded border-2 border-gray-300">
                            <p className="text-lg">Picture Gallery</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}