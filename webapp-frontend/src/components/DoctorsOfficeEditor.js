import React, { useState, useEffect } from 'react';
import { useRouteMatch, useHistory, generatePath } from 'react-router-dom';
import AddressEditor from './AddressEditor';
import AppointmentCalendar from './AppointmentCalendar'
import AppointentCalendarEditor from './AppointmentCalendarEditor';
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


const testAddress = ["Praxis fuer Phantastoloie", "An der Ecke 1337", "12345 Ecksteinhausen"];
const testTitle = "HNO Praxis am Altschauerberg";
const testDesc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis finibus rutrum leo ac maximus. Phasellus tempus ipsum vel lobortis iaculis. Cras ornare, augue finibus bibendum elementum, neque justo molestie turpis, et gravida velit nisl sed dui. Proin elit nisl, hendrerit sed varius quis, faucibus et mauris. Curabitur ut enim ultrices, ultricies lectus id, feugiat nisl. Fusce tellus tortor, vehicula vel est eu, lobortis tempus quam. Nulla rhoncus facilisis lorem. Donec pretium velit mi, in tempus est lacinia ornare. In at ultricies massa. ";

const testSearchResults = [
    { id: 0, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
    { id: 1, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
    { id: 2, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
    { id: 3, appointments: testAppointments, openingHours: testOpeningHours, address: testAddress, title: testTitle, timeSlot: 30, dayCount: 5, description: testDesc },
];

export default function DoctorsOfficeEditor() {
    const [office, setOffice] = useState();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { params } = useRouteMatch();
    const history = useHistory();

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

    function handleChange(value) {
        const newOffice = {};
        Object.assign(newOffice, office);
        Object.assign(newOffice, value);
        setOffice(newOffice);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        // Send update to API here
        setSaving(false);
        history.push(generatePath('/office/:officeId', { officeId: office.id }));
    }

    if (error) {
        return <p>{error}</p>;
    } else if (loading) {
        return <p>Loading...</p>;
    } else {
        return (
            <form onSubmit={handleSubmit}>
                <div id="office" className="flex flex-col lg:w-8/12 md:w-full mx-auto space-y-6 mb-40">
                    <button className="w-full bg-green-400 text-lg text-white py-2"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <div id="title" className="flex flex-col justify-center h-20 bg-blue-200 text-center text-2xl rounded border-2 border-gray-400">
                        <input className="text-center" placeholder="Title your office's page" name="title-input" type="text"
                            maxLength="50"
                            value={office.title}
                            onChange={(e) => handleChange({ title: e.target.value })}
                        />
                    </div>
                    <div id="content" className="flex flex-row justify-between space-x-2">
                        <div id="content-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 2 }}>
                            <div id="description" className="p-3 rounded border-2 border-gray-300">
                                <textarea name="description-textarea" className="w-full border border-gray-400"
                                    placeholder="Enter a description of your office"
                                    rows="8"
                                    maxLength="2000"
                                    value={office.description}
                                    onChange={(e) => handleChange({ description: e.target.value })}
                                />
                            </div>

                            <div id="calendar" className="p-3 rounded border-2 border-gray-300">
                                <div id="calender-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Appointment Calendar Settings</p>
                                </div>
                                <AppointentCalendarEditor
                                    dayCount={office.dayCount}
                                    timeSlot={office.timeSlot}
                                    onChange={handleChange}
                                />
                                <div id="calender-preview-title" className="rounded border-2 border-gray-300 my-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Calendar Preview</p>
                                </div>
                                <AppointmentCalendar
                                    appointments={office.appointments}
                                    dayCount={office.dayCount}
                                    currentTime={new Date()}
                                    openingHours={office.openingHours}
                                    timeSlot={office.timeSlot}
                                    selectable={false}
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
                                    onChange={handleChange}
                                />
                            </div>
                            <div id="address" className="p-3 rounded border-2 border-gray-300">
                                <div id="address-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Address</p>
                                </div>
                                <AddressEditor
                                    address={office.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div id="address" className="p-3 rounded border-2 border-gray-300">
                                <label htmlFor="gallery-upload">Upload pictures for a gallery</label>
                                <input name="gallery-upload" type="file" />
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-green-400 text-lg text-white py-2"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        );
    }
}