import React, { useRef } from 'react';

export default function AddressEditor({ address, onChange }) {
    const inputLines = [useRef(), useRef(), useRef()];
    const addressLines = address.split('\n');

    function handleInputChange() {
        const newAddress = inputLines.map(input => input.current.value).join('\n');
        onChange({ address: newAddress });
    }

    return inputLines.map((ref, i) => {
        return (
            <input
                type="text"
                onChange={handleInputChange}
                ref={ref}
                key={i}
                value={addressLines[i]}
                maxLength={40}
                className="mb-1 w-full border border-gray-300"
                placeholder={`Address line ${i + 1}`}
            />
        );
    });
}