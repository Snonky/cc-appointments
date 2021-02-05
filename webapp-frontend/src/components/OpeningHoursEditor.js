import React, { useState } from 'react';
import { DateTime } from 'luxon';

export default function OpeningHoursEditor({ openingHours, onChange }) {
    const weekDays = [...Array(7).keys()];
    const zeroPad = (num, places) => String(num).padStart(places, '0')

    function handleTimeChange(e, weekday, isOpen) {
        const regex = new RegExp("^[0-9]{0,2}:[0-9]{0,2}$");
        if (!regex.test(e.target.value)) {
            return;
        }
        const [hour, minute] = e.target.value.split(':');
        const changedHour = DateTime.fromObject({ year: 1970, month: 1, day: 1, hour: parseInt(hour) || 0, minute: parseInt(minute) || 0 });
        let newState = [...openingHours];
        const idx = newState.findIndex(oh => oh.dayOfWeek === weekday);
        if (isOpen) {
            newState[idx].open = changedHour.toISO();
        } else {
            newState[idx].close = changedHour.toISO();
        }
        onChange({ openingHours: newState });
    }

    function handleUnfocus(e, weekday, isOpen) {
        const regex = new RegExp("^[0-9]{2}:[0-9]{2}$");
        const unfocusedHours = openingHours.find(oh => oh.dayOfWeek === weekday);
        const unfocusedHour = isOpen ? DateTime.fromISO(unfocusedHours.open) : DateTime.fromISO(unfocusedHours.close);
        if (!regex.test(e.target.value)) {
            e.target.value = `${zeroPad(unfocusedHour.hour, 2)}:${zeroPad(unfocusedHour.minute, 2)}`
        }
    }

    function handleToggleChange(e, weekday) {
        let newState = [...openingHours];
        if (e.target.checked) {
            newState.push({
                dayOfWeek: weekday,
                open: new Date('January 1, 1970 7:30').toISOString(),
                close: new Date('January 1, 1970 17:00').toISOString(),
            });
        } else {
            newState = newState.filter(oh => oh.dayOfWeek !== weekday);
        }
        onChange({ openingHours: newState });
    }

    return (
        weekDays.map(day => {
            const dayOpeningHours = openingHours.find(oh => oh.dayOfWeek === day);
            const open = dayOpeningHours ? DateTime.fromISO(dayOpeningHours.open) : null;
            const close = dayOpeningHours ? DateTime.fromISO(dayOpeningHours.close) : null;
            const dayStr = DateTime.fromObject({ weekday: day + 1 }).weekdayLong;

            const inputs = dayOpeningHours ?
                <div>
                    <input type="text" className="border border-gray-300 mx-2 w-10"
                        defaultValue={zeroPad(open.hour, 2) + ":" + zeroPad(open.minute, 2)}
                        onChange={(e) => handleTimeChange(e, day, true)}
                        onBlur={(e) => handleUnfocus(e, day, true)}
                    />
                    <span>-</span>
                    <input type="text" className="border border-gray-300 mx-2 w-10"
                        defaultValue={zeroPad(close.hour, 2) + ":" + zeroPad(close.minute, 2)}
                        onChange={(e) => handleTimeChange(e, day, false)}
                        onBlur={(e) => handleUnfocus(e, day, false)}
                    />
                </div> : null;

            return (
                <div key={dayStr}>
                    <input type="checkbox" name={dayStr} defaultChecked={dayOpeningHours} onChange={(e) => handleToggleChange(e, day)} />
                    <label htmlFor={dayStr} className="font-semibold ml-1">{dayStr}</label>
                    {inputs}
                </div>
            );
        })
    );
}