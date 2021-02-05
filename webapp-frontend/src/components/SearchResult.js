import React, { useEffect, useState } from 'react';
import { Link, generatePath, useRouteMatch, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function SearchResult() {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authenticatedRequest } = useAuth();
    const { params } = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        setError(null);
        setLoading(true);
        authenticatedRequest('GET', '/doctors-offices/')
            .then((fetchedOffices) => {
                setSearchResults(fetchedOffices);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error while loading search: " + error);
                setError("Could not load results.");
                setLoading(false);
            });
    }, []);

    if (error) {
        return <p id="error-msg">{error}</p>;
    } else if (loading) {
        return <LoadingSpinner />
    } else {

        const resultList = loading ? <p>Loading...</p> :
            searchResults.map(office =>
                <ResultEntry
                    key={office.id}
                    label={office.name}
                    link={generatePath('/office/:officeId', { officeId: office.id })}
                />
            );
        return (
            <>
                <div className="flex flex-col">
                    <div className="bg-green-400 rounded p-3 mx-5 my-1 text-center text-l">Search Results for "{params.searchTerms}"</div>
                    {resultList}
                    <div onClick={history.goBack} className="bg-gray-200 rounded p-2 mx-5 my-1 text-center cursor-pointer">Close</div>
                </div>
            </>
        );
    }
}

function ResultEntry({ label, link }) {
    return (
        <Link to={link}>
            <div className="bg-green-300 rounded p-3 mx-5 my-1 ">{label}</div>
        </Link>
    );
}