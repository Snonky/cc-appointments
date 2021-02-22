import React from 'react';

export default function ErrorMessage({ message }) {
    return (
        <div
            className="flex flex-col justify-center text-center text-gray-600 text-md mx-auto my-1 p-3 rounded border border-gray-300 bg-red-400"
        >
            <p>{message}</p>
        </div>
    );
}