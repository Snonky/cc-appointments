import React from 'react';
import { Link, generatePath, useLocation } from 'react-router-dom';

export default function SearchResultList({ results, handleClose }) {
    const resultList = results.map(office =>
        <Result
            key={office.id}
            label={office.id}
            link={generatePath('/office/:officeId', { officeId: office.id })}
        />
    );
    return (
        <>
            <div className="flex flex-col">
                <div className="bg-green-400 rounded p-3 mx-5 my-1 text-center text-l">Search Results</div>
                {resultList}
                <div onClick={handleClose} className="bg-gray-200 rounded p-2 mx-5 my-1 text-center cursor-pointer">Close</div>
            </div>
        </>
    );
}

function Result({ label, link, officeSelector }) {
    return (
        <Link to={link}>
            <div className="bg-green-300 rounded p-3 mx-5 my-1 ">{label}</div>
        </Link>
    );
}