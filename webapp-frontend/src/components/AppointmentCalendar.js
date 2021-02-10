import React, { useState } from 'react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import AppointmentForm from './AppointmentForm';
import { useAuth } from '../contexts/AuthContext';
import { useRouteMatch, generatePath } from 'react-router-dom';

export default function AppointmentCalendar({ appointments, fetchAppointments, currentTime, dayCount, timeSlot, openingHours, selectable }) {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser, authenticatedRequest } = useAuth();
    const { params } = useRouteMatch();

    function handleAppointmentSubmit(e, description, insurance) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const newAppointment = {
            userId: currentUser.uid,
            dateTime: selectedSlot.toISO(),
            typeOfInsurance: insurance,
            reasonForVisit: description,

        }
        authenticatedRequest('POST', generatePath('/doctors-offices/:officeId/appointments', params), newAppointment)
            .then(() => {
                fetchAppointments();
                setSelectedSlot(null);
                setLoading(false);
            })
            .catch(error => {
                setError("Could not make appointment.");
                setLoading(false);
            });
    }


    if (selectedSlot) {
        return (
            <>
                {error}
                <AppointmentForm
                    timeSlot={selectedSlot}
                    onSubmit={handleAppointmentSubmit}
                    onCancel={() => setSelectedSlot(null)}
                    loading={loading}
                />
            </>
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
                    selectable={selectable}
                />
            </>
        );
    }
}

export function AppointmentSelector({ appointments, currentTime, dayCount, timeSlot, openingHours, onSlotSelect, selectable }) {
    let date = DateTime.fromJSDate(currentTime).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const today = date;
    let nDays = 0;
    const calendarDays = [];
    // Add days (columns) to the calendar until a maximum of 21
    while (calendarDays.length < dayCount && nDays < 21) {
        const weekday = date.weekday - 1;
        const currentHours = openingHours.find(oh => oh.dayOfWeek === weekday);
        // Only add the day when the office has opening hours on that weekday
        if (currentHours && currentHours.open) {
            const calendarDay = {
                date: date,
                open: DateTime.fromISO(currentHours.open),
                close: DateTime.fromISO(currentHours.close),
            };
            calendarDays.push(calendarDay);
        }
        date = date.plus({ day: 1 })
        nDays++;
    }

    const calendarHeader = calendarDays.map((calendarDay, i) => {
        const bg = calendarDay.date === today ? "bg-red-400" : "bg-gray-300";
        const dayStr = calendarDay.date.weekdayShort;
        return (
            <div key={dayStr + calendarDay.date.toMillis()} className={bg + " text-center"}>{dayStr}</div>
        );
    });

    // Timestamps for the rows of the calender go from 7:00 to 18:00
    let slotTime = DateTime.local(1970, 1, 1, 7);
    const endTime = DateTime.local(1970, 1, 1, 18).plus({ minutes: timeSlot });
    // Function for finding an appointment at a time slot
    const getAppointment = (slot) => appointments.find(a => slot.toMillis() === DateTime.fromISO(a.dateTime).toMillis());
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
                onSlotSelect={(isFree && !isLocked && selectable) ? () => onSlotSelect(slotDateTime) : null}
                key={slotDateTime.toMillis()}
            />);
        };
        slotTime = slotTime.plus({ minutes: timeSlot });
    }

    // List all possible grid-col classes of the calendar so webpack recognizes them at buildtime
    const gridClasses = {
        'grid': true,
        'gap-2': true,
        'grid-cols-1': false,
        'grid-cols-2': false,
        'grid-cols-3': false,
        'grid-cols-4': false,
        'grid-cols-5': false,
        'grid-cols-6': false,
        'grid-cols-7': false,
        'grid-cols-8': false,
        'grid-cols-9': false,
        'grid-cols-10': false,
        'grid-cols-11': false,
        'grid-cols-12': false,
    };

    gridClasses[`grid-cols-${calendarHeader.length}`] = true;

    return (
        <>
            <div className={classNames(gridClasses)}>
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