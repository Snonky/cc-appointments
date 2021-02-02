import React, { useRef } from 'react';

export default function AddressEditor({ address, onChange }) {
    const inputLines = [useRef(), useRef(), useRef()];

    function handleInputChange() {
        const newAddress = inputLines.map(input => input.current.value);
        onChange({ address: newAddress });
    }

    return inputLines.map((ref, i) => {
        return (
            <input
                type="text"
                onChange={handleInputChange}
                ref={ref}
                key={i}
                value={address[i]}
                maxLength={40}
                className="mb-1 w-full border border-gray-300"
                placeholder={`Address line ${i + 1}`}
            />
        );
    });
}