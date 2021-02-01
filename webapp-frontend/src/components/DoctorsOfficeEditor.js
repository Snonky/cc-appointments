import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import AppointmentCalendar from './AppointmentCalendar'
import OpeningHours from './OpeningHours';
import OpeningHoursEditor from './OpeningHoursEditor';

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

export default function DoctorsOfficeEditor() {
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

    function handleHoursChange(openingHours) {
        const newOffice = {};
        Object.assign(newOffice, office);
        newOffice.openingHours = openingHours;
        setOffice(newOffice);
    }

    if (error) {
        return <p>{error}</p>;
    } else if (loading) {
        return <p>Loading...</p>;
    } else {
        return (
            <form>
                <div id="office" className="flex flex-col md:w-8/12 sm:w-full mx-auto space-y-6 mb-40">
                    <div id="title" className="flex flex-col justify-center h-20 bg-blue-200 text-center text-2xl rounded border-2 border-gray-400">
                        <input className="text-center" placeholder="Title your office's page" name="title-input" type="text" value={office.title} maxLength="50" />
                    </div>
                    <div id="content" className="flex flex-row justify-between space-x-2">
                        <div id="content-column" className="flex flex-col space-y-3" style={{ flex: 2}}>
                            <div id="description" className="p-3 rounded border-2 border-gray-300">
                                <textarea name="description-textarea" className="w-full border border-gray-400" placeholder="Enter a description of your office" rows="8" maxLength="2000"/>
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
                        <div id="sidebar-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 1 }}>
                            <div id="avatar" className="p-3 rounded border-2 border-gray-300">
                                <label htmlFor="avatar-upload">Upload a profile picture</label>
                                <input name="avatar-upload" type="file" />
                            </div>
                            <div id="opening-hours" className="p-3 rounded border-2 border-gray-300">
                                <div id="opening-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Opening Hours</p>
                                </div>
                                <OpeningHoursEditor
                                    openingHours={office.openingHours}
                                    onHoursChange={handleHoursChange}
                                />
                            </div>
                            <div id="address" className="p-3 rounded border-2 border-gray-300">
                                <div id="address-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Address</p>
                                </div>
                                <p>HNO Praxis am Altschauerberg</p>
                                <p>Altschauerberg 8</p>
                                <p>12345 Entenhausen</p>
                            </div>
                            <div id="address" className="p-3 rounded border-2 border-gray-300">
                                <label htmlFor="gallery-upload">Upload pictures for a gallery</label>
                                <input name="gallery-upload" type="file" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}