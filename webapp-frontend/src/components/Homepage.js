import React, { useState, } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { AppointmentCalendar } from './AppointmentCalendar';

const Homepage = () => {
    const [error, setError] = useState(null);
    const { currentUser, logout } = useAuth();
    const history = useHistory();

    async function handleLogout() {
        setError(null);

        try {
            await logout();
            history.push("/login");
        } catch {
            setError("Failed to log out");
        }
    }

    const testAppointments = [
        {
            id: 0,
            datetime: new Date('January 30, 2021 9:30:00'),
        },
        {
            id: 1,
            datetime: new Date('January 30, 2021 12:00:00'),
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

    return (
        <>
            <nav className="flex items-center justify-between flex-wrap bg-teal p-6">
                <div className="flex items-center flex-no-shrink text-black mr-6">
                    <span className="font-semibold text-xl tracking-tight">Appointments</span>
                </div>
                <div className="block lg:hidden">
                    <button className="flex items-center px-3 py-2 border rounded text-teal-lighter border-teal-light hover:text-white hover:border-white">
                        <svg className="h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
                    </button>
                </div>
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    <div className="text-sm lg:flex-grow">
                        <input type="text" className="bg-gray-300 rounded h-10 w-full px-4" placeholder="Search for medical professionals" />
                    </div>
                    <div>
                        <span className="inline-block text-sm px-4 py-2 text-black mx-3 mt-4 lg:mt-0">{currentUser.email}</span>
                    </div>
                    <div>
                        <button onClick={handleLogout} className="inline-block text-sm px-4 py-2 leading-none border rounded text-black border-gray-400 hover:border-black mx-3 mt-4 lg:mt-0">Log out</button>
                    </div>
                </div>
            </nav>
            <div className="w-1/2 p-7">
                <AppointmentCalendar
                    appointments={testAppointments}
                    dayCount={8}
                    currentTime={new Date()}
                    openingHours={testOpeningHours}
                    timeSlot={30}
                />
            </div>
        </>
    );
}

export default Homepage;