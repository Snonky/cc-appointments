import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { DateTime } from 'luxon';
import AppointmentForm from './AppointmentForm';

export default function AppointmentCalendar({ appointments, currentTime, dayCount, timeSlot, openingHours }) {
    const [selectedSlot, setSelectedSlot] = useState(null);

    function handleAppointmentSubmit(description, insurance) {
        // Send appointment here
        setSelectedSlot(null);
    }


    if (selectedSlot) {
        return (
            <AppointmentForm
                timeSlot={selectedSlot}
                onSubmit={handleAppointmentSubmit}
                onCancel={() => setSelectedSlot(null)}
            />
        );
    } else {
        return (
            <>
                <AppointmentSelector
                    appointments={appointments}
                    currentTime={currentTime}
                    dayCount={dayCount}
                    timeSlot={timeSlot}
                    openingHours={openingHours}
                    onSlotSelect={setSelectedSlot}
                />
            </>
        );
    }
}

export function AppointmentSelector({ appointments, currentTime, dayCount, timeSlot, openingHours, onSlotSelect }) {
    let date = DateTime.fromJSDate(currentTime).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    let nDays = 0;
    const calendarDays = [];
    // Add days (columns) to the calendar until a maximum of 21
    while (calendarDays.length < dayCount && nDays < 21) {
        const weekday = date.weekday - 1;
        const currentHours = openingHours.find(oh => oh.day_of_week === weekday);
        // Only add the day when the office has opening hours on that weekday
        if (currentHours && currentHours.open) {
            const calendarDay = {
                date: date,
                open: currentHours.open,
                close: currentHours.close,
            };
            calendarDays.push(calendarDay);
        }
        date = date.plus({ day: 1 })
        nDays++;
    }

    const calendarHeader = calendarDays.map((calendarDay, i) => {
        const bg = i === 0 ? "bg-red-400" : "bg-gray-300";
        const dayStr = calendarDay.date.weekdayShort;
        return (
            <div key={dayStr + calendarDay.date.toMillis()} className={bg + " text-center"}>{dayStr}</div>
        );
    });

    // Timestamps for the rows of the calender go from 7:00 to 18:00
    let slotTime = DateTime.local(1970, 1, 1, 7);
    const endTime = DateTime.local(1970, 1, 1, 18, timeSlot);
    // Function for finding an appointment at a time slot
    const getAppointment = (slot) => appointments.find(a => slot.toMillis() === a.datetime.getTime());
    const calendarSlots = [];
    while (slotTime < endTime) {
        for (const calendarDay of calendarDays) {
            const slotDateTime = calendarDay.date.set({ hour: slotTime.hour, minute: slotTime.minute });
            const isFree = !getAppointment(slotDateTime);
            const isLocked = slotTime < calendarDay.open || slotTime >= calendarDay.close;
            calendarSlots.push(<TimeSlot
                label={slotTime.toLocaleString(DateTime.TIME_24_SIMPLE)}
                isFree={isFree}
                isLocked={isLocked}
                onSlotSelect={(isFree && !isLocked) ? () => onSlotSelect(slotDateTime) : null}
                key={slotDateTime.toMillis()}
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

function TimeSlot({ label, isFree, isLocked, onSlotSelect }) {
    const bg = isLocked ? "bg-gray-500 text-gray-400"
        : isFree ? "bg-green-200" : "bg-red-100 text-gray-300";
    const cursor = onSlotSelect ? "cursor-pointer hover:bg-green-300" : "";
    return (
        <div onClick={onSlotSelect} className={`${bg} ${cursor} rounded text-center`}>{label}</ div>
    );
}