import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

export function AppointmentCalendar({ appointments, currentTime, dayCount, timeSlot, openingHours }) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let date = DateTime.fromJSDate(currentTime).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    let i = 0;
    const calendarDays = [];
    while (calendarDays.length < dayCount && i < 21) {
        const weekday = date.weekday - 1;
        const currentHours = openingHours.find(oh => oh.day_of_week === weekday);
        if (currentHours && currentHours.open) {
            const calendarDay = {
                date: date,
                open: currentHours.open,
                close: currentHours.close,
            };
            calendarDays.push(calendarDay);
        }
        date = date.plus({ day: 1 })
        i++;
    }

    const calendarHeader = calendarDays.map((calendarDay, i) => {
        const bg = i === 0 ? "bg-red-400" : "bg-gray-300";
        const dayStr = calendarDay.date.weekdayShort;
        return (
            <div key={dayStr + calendarDay.date.toMillis()} className={bg + " text-center"}>{dayStr}</div>
        );
    });

    let slotTime = DateTime.local(1970, 1, 1, 7);
    const endTime = DateTime.local(1970, 1, 1, 18, timeSlot);
    const getAppointment = (slot) => appointments.find(a => slot.toMillis() === a.datetime.getTime());
    const calendarSlots = [];
    i = 0;
    while (slotTime < endTime) {
        for (const calendarDay of calendarDays) {
            const slotDate = calendarDay.date.set({ hour: slotTime.hour, minute: slotTime.minute });
            calendarSlots.push(<TimeSlot
                label={slotTime.toLocaleString(DateTime.TIME_24_SIMPLE)}
                isFree={!getAppointment(slotDate)}
                isLocked={slotTime < calendarDay.open || slotTime >= calendarDay.close}
                key={slotDate.toMillis()}
            />);
        };
        slotTime = slotTime.plus({ minutes: timeSlot });
    }


    return (
        <>
            <div className={`grid grid-cols-${calendarHeader.length} gap-2`}>
                {calendarHeader}
                {calendarSlots}
            </div>
        </>
    );
}

export function TimeSlot({ label, isFree, isLocked }) {
    const bg = isLocked ? "bg-gray-500 text-gray-400"
        : isFree ? "bg-green-200" : "bg-red-100 text-gray-300";
    return (
        <div className={bg + " rounded text-center"}>{ label }</ div>
    );
}