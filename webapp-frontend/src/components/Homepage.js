import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Route, Switch, useHistory, generatePath } from 'react-router-dom';
import SearchResult from './SearchResult';
import DoctorsOffice from './DoctorsOffice';
import DoctorsOfficeEditor from './DoctorsOfficeEditor';

const Homepage = () => {
    const [error, setError] = useState(null);
    const [searchTerms, setSearchTerms] = useState();
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

    function handleSearchBarChange(e) {
        setSearchTerms(e.target.value);
    }

    function handleSearch(e) {
        e.preventDefault();
        if (searchTerms) {
            history.push(generatePath('/search/:searchTerms', { searchTerms: searchTerms }));
        }
    }

    return (
        <>
            <nav className="flex items-center justify-between flex-nowrap bg-gray-100 p-6 mb-3">
                <div className="flex items-center flex-no-shrink text-black mr-6">
                    <span className="font-semibold text-xl tracking-tight">Appointments</span>
                </div>
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    <div className="text-sm flex-grow">
                        <form onSubmit={handleSearch} >
                            <input
                                value={searchTerms}
                                onChange={handleSearchBarChange}
                                type="text"
                                className="bg-gray-300 rounded h-10 w-full px-4"
                                placeholder="Search for medical professionals"
                            />
                        </form>
                    </div>
                </div>
                <div>
                    <span className="inline-block text-sm px-4 py-2 text-black mx-3 mt-4 lg:mt-0">{currentUser.email}</span>
                </div>
                <div>
                    <button onClick={handleLogout} className="inline-block text-sm px-4 py-2 leading-none border rounded text-black border-gray-400 hover:border-black mx-3 mt-4 lg:mt-0">Log out</button>
                </div>
            </nav>
            <Switch>
                <Route
                    exact path={"/"}
                    render={() => <p>Please search for a doctor's office</p>}
                />
                <Route
                    path={"/office/:officeId/edit"}
                    component={DoctorsOfficeEditor}
                />
                <Route
                    path={"/office/:officeId"}
                    component={DoctorsOffice}
                />
                <Route
                    path={"/search/:searchTerms"}
                    component={SearchResult}
                />
            </Switch>
        </>
    );
}

export default Homepage;