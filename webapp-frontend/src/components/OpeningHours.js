import React from 'react';
import { DateTime } from 'luxon';

export default function OpeningHours({ openingHours }) {

    return (
        openingHours.map(oh => {
            const open = DateTime.fromJSDate(oh.open).toLocaleString(DateTime.TIME_24_SIMPLE);
            const close = DateTime.fromJSDate(oh.close).toLocaleString(DateTime.TIME_24_SIMPLE);
            const dayStr = DateTime.fromObject({ weekday: (oh.day_of_week + 1) }).weekdayLong;
            return (
                <div key={ dayStr }>
                    <p className="font-semibold">{dayStr}</p>
                    <p className="ml-2">{`${open} - ${close}`}</p>
                </div>
            );
        })
    );
}