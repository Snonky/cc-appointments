import React, { useEffect, useState } from 'react';

export function DoctorsOffice() {
    const [office, setOffice] = useState(null);

    useEffect(() => {
        const office = {
            address: "Groove Street 1, 12345 Wiesbaden",
            appointments: [
                { id: 1 }, { id: 6 }, { id: 12 }, { id: 15 }, { id: 22 }, { id: 23 }, { id: 27 }, { id: 29 }, { id: 34 }, { id: 38 }, { id: 30 }
            ],
        };
        setOffice(office);

    }, []);

    const appointments = office ? [...Array(40).keys()].map(appointment => {
        return (
            <TimeSlot
                key={appointment}
                label={appointment}
                isFree={!office.appointments.find(a => a.id === appointment)}
            />
        );
    }) : null;

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
        return (
            <div key={day} className="bg-gray-300 text-center">{day}</div>
        );
    });

    return (
        <>
            <div className="grid grid-cols-5 gap-4">
                {daysOfWeek}
                {appointments ? appointments : null}
            </div>
        </>
    );
}

export function TimeSlot({ label, isFree }) {
    const bg = isFree ? "bg-green-200" : "bg-red-100 text-gray-300";
    const className = bg + " rounded text-center";
    return (
        <div className={className}>{ label }</ div>
    );
}