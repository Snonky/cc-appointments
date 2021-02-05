import React from 'react';

export default function AppointentCalendarEditor({ timeSlot, dayCount, onChange }) {

    function handleTimeSlotChange(e) {
        const newTimeSlot = parseInt(e.target.value) || 15;
        if (newTimeSlot % 15 === 0 && newTimeSlot > 0) {
            onChange({ timeSlot: newTimeSlot });
        }
    }

    function handleDayCountChange(e) {
        const newDayCount = parseInt(e.target.value) || 5;
        if (newDayCount > 0) {
            onChange({ dayCount: newDayCount });
        }
    }

    return (
        <div className="flex justify-around">
            <div>
                <label htmlFor="time-slot">Slot length:</label>
                <input
                    name="time-slot"
                    type="number"
                    value={timeSlot || 30}
                    min={15}
                    max={240}
                    step={15}
                    onChange={handleTimeSlotChange}
                    className="w-12 ml-2 border border-gray-300"
                />
            </div>
            <div>
                <label htmlFor="day-count">Days:</label>
                <input
                    name="day-count"
                    type="number"
                    value={dayCount || 5}
                    min={1}
                    max={12}
                    onChange={handleDayCountChange}
                    className="w-12 ml-2 border border-gray-300"
                />
            </div>
        </div>
    );
}