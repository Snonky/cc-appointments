import React from 'react';

export default function ImageList({ imageUrls }) {
    const images = imageUrls.map(url => {
        return <img
            src={url}
            alt="Picture"
            key={url}
        />
    });

    return (
        <div className="flex flex-col justify-center space-y-2">
            {images}
        </div>
    );
}