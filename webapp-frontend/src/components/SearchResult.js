import React, { useEffect, useState } from 'react';
import { Link, generatePath, useRouteMatch, useHistory } from 'react-router-dom';

const testResults = [{ id: 0 }, { id: 1 }, { id: 2 },];

export default function SearchResult() {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { params } = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        setError(null);
        setLoading(true);
        const searchTerms = params.searchTerms;
        // Replace with API call
        const result = testResults;
        if (result) {
            setLoading(false);
            setSearchResults(result);
        } else {
            setError('No results available');
        }
    }, []);

    if (error) {
        return <p>{error}</p>;
    } else {

        const resultList = loading ? <p>Loading...</p> :
            searchResults.map(office =>
                <ResultEntry
                    key={office.id}
                    label={office.id}
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