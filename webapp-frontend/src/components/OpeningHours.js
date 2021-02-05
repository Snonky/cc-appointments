import React from 'react';
import { DateTime } from 'luxon';

export default function OpeningHours({ openingHours }) {

    return (
        [...openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(oh => {
            if (oh.open && oh.close) {
                const open = DateTime.fromISO(oh.open).toLocaleString(DateTime.TIME_24_SIMPLE);
                const close = DateTime.fromISO(oh.close).toLocaleString(DateTime.TIME_24_SIMPLE);
                const dayStr = DateTime.fromObject({ weekday: (oh.dayOfWeek + 1) }).weekdayLong;
                return (
                    <div key={dayStr}>
                        <p className="font-semibold">{dayStr}</p>
                        <p className="ml-2">{`${open} - ${close}`}</p>
                    </div>
                );
            } else {
                return (<></>);
            }
        })
    );
}