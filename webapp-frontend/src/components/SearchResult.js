import React, { useEffect, useState } from 'react';
import { Link, generatePath, useRouteMatch, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function SearchResult({ searchTerms }) {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authenticatedRequest } = useAuth();
    const { params } = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        setError(null);
        setLoading(true);
        authenticatedRequest('GET', '/doctors-offices/', { search: params.searchTerms })
            .then((fetchedOffices) => {
                setSearchResults(fetchedOffices);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error while loading search: " + error);
                setError("Could not load results.");
                setLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerms]);

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
                <div className="flex flex-col lg:w-8/12 md:w-full mx-auto space-y-3">
                    <div className="bg-green-400 rounded p-3 text-center text-l">Search Results for "{params.searchTerms}"</div>
                    <div />
                    {resultList}
                    <div />
                    <div onClick={history.goBack} className="bg-gray-200 rounded p-2 text-center cursor-pointer mt-3">Close</div>
                </div>
            </>
        );
    }
}

function ResultEntry({ label, link }) {
    return (
        <Link to={link}>
            <div className="bg-green-300 rounded p-3">{label}</div>
        </Link>
    );
}