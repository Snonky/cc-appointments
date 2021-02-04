import React, { useState, useEffect } from 'react';
import { useRouteMatch, generatePath } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'
import AppointmentCalendar from './AppointmentCalendar'
import OpeningHours from './OpeningHours';

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

const testAddress = ["Praxis fuer Phantastoloie", "An der Ecke 1337", "12345 Ecksteinhausen"];
const testTitle = "HNO Praxis am Altschauerberg";
const testDesc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis finibus rutrum leo ac maximus. Phasellus tempus ipsum vel lobortis iaculis. Cras ornare, augue finibus bibendum elementum, neque justo molestie turpis, et gravida velit nisl sed dui. Proin elit nisl, hendrerit sed varius quis, faucibus et mauris. Curabitur ut enim ultrices, ultricies lectus id, feugiat nisl. Fusce tellus tortor, vehicula vel est eu, lobortis tempus quam. Nulla rhoncus facilisis lorem. Donec pretium velit mi, in tempus est lacinia ornare. In at ultricies massa. ";

const testSearchResults = [
    { id: 0, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
    { id: 1, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
    { id: 2, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
    { id: 3, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
];

export default function DoctorsOffice() {
    const [office, setOffice] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { params } = useRouteMatch();
    const { authenticatedRequest } = useAuth();

    useEffect(() => {
        setLoading(true);
        setError(null);
        const officeId = params.officeId;
        authenticatedRequest('GET', generatePath('/doctors-office/:officeId', params))
            .then((fetchedOffice) => {
                setOffice(fetchedOffice);
                setLoading(false);
            })
            .catch((error) => {
                setError("Doctor's office page cannot be displayed.");
                setLoading(false);
            });
    }, []);

    if (error) {
        return <p>{error}</p>;
    } else if (loading) {
        return <p>Loading...</p>;
    } else {
        return (
            <div id="office" className="flex flex-col lg:w-8/12 md:w-full mx-auto space-y-6 mb-40">
                <div id="title" className="flex flex-col justify-center h-20 bg-blue-200 text-center text-2xl rounded border-2 border-gray-400">
                    <p>{office.title}</p>
                </div>
                <div id="content" className="flex flex-row justify-between space-x-2">
                    <div id="content-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 2 }}>
                        <div id="description" className="p-3 rounded border-2 border-gray-300">
                            {office.description}
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
                                selectable={true}
                            />
                        </div>
                    </div>
                    <div id="sidebar-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 1 }}>
                        <div id="avatar" className="p-3 rounded border-2 border-gray-300">
                            <p className="text-lg">Profile Picture</p>
                        </div>
                        <div id="opening-hours" className="p-3 rounded border-2 border-gray-300">
                            <div id="opening-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                <p>Opening Hours</p>
                            </div>
                            <OpeningHours openingHours={office.openingHours} />
                        </div>
                        <div id="address" className="p-3 rounded border-2 border-gray-300">
                            <div id="address-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                <p>Address</p>
                            </div>
                            {office.address.map(line => <p>{line}</p>)}
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