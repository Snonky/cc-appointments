import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useRouteMatch, generatePath, useLocation } from 'react-router-dom';
import { AppointmentCalendar } from './AppointmentCalendar';
import SearchResultList from './SearchResultList';

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

const testSearchResults = [
    { id: 0, appointments: testAppointments, openingHours: testOpeningHours },
    { id: 1, appointments: testAppointments, openingHours: testOpeningHours },
    { id: 2, appointments: testAppointments, openingHours: testOpeningHours },
    { id: 3, appointments: testAppointments, openingHours: testOpeningHours },
];

function useUrlState() {
    const { params, path } = useRouteMatch();

    const history = useHistory();

    const setParams = (newParams) => {
        Object.assign(params, newParams);
        history.push(generatePath(path, params));
    };

    return [params, setParams];
}

function useQueryParams() {
    return new URLSearchParams(useLocation().search);
}

const Homepage = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [office, setOffice] = useState();
    const searchBarRef = useRef();
    const [searchTerms, setSearchTerms] = useState(useQueryParams().get('search') || undefined);
    const [searchResults, setSearchResults] = useState(testSearchResults);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const { currentUser, logout } = useAuth();
    const history = useHistory();
    const [{ officeId }, setOfficeId] = useUrlState();
    const { path, params } = useRouteMatch();

    useEffect(() => {
        if (officeId) {
            handleOfficeSelect(testSearchResults[officeId]);
        } else {
            handleOfficeSelect(null);
        }
    }, [officeId]);


    async function handleLogout() {
        setError(null);
        try {
            await logout();
            history.push("/login");
        } catch {
            setError("Failed to log out");
        }
    }

    function handleSearchBarChange(e) {
        setSearchTerms(e.target.value);
    }

    function handleSearch(e) {
        e.preventDefault();
        history.push({
            pathname: generatePath(path, params),
            search: searchTerms ? `?search=${searchTerms}` : undefined,
        });
        // Populate search results here
        setShowSearchResults(true);
    }

    function handleOfficeSelect(office) {
        // Load office by id here
        setOffice(office);
        setShowSearchResults(false);
    }

    let content = null;
    if (showSearchResults) {
        content = <SearchResultList
            results={searchResults}
            handleClose={() => setShowSearchResults(false)}
        />;
    } else if (office) {
        content = <AppointmentCalendar
            appointments={office.appointments}
            dayCount={8}
            currentTime={new Date()}
            openingHours={office.openingHours}
            timeSlot={30}
        />;
    } else {
        content = <p>Please search for a doctor's office</p>;
    }

    return (
        <>
            <nav className="flex items-center justify-between flex-wrap bg-gray-100 p-6">
                <div className="flex items-center flex-no-shrink text-black mr-6">
                    <span className="font-semibold text-xl tracking-tight">Appointments</span>
                </div>
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    <div className="text-sm lg:flex-grow">
                        <form onSubmit={handleSearch} >
                            <input
                                ref={searchBarRef}
                                value={searchTerms}
                                onChange={handleSearchBarChange}
                                type="text"
                                className="bg-gray-300 rounded h-10 w-full px-4"
                                placeholder="Search for medical professionals"
                            />
                        </form>
                    </div>
                    <div>
                        <span className="inline-block text-sm px-4 py-2 text-black mx-3 mt-4 lg:mt-0">{currentUser.email}</span>
                    </div>
                    <div>
                        <button onClick={handleLogout} className="inline-block text-sm px-4 py-2 leading-none border rounded text-black border-gray-400 hover:border-black mx-3 mt-4 lg:mt-0">Log out</button>
                    </div>
                </div>
            </nav>
            {content}
        </>
    );
}

export default Homepage;