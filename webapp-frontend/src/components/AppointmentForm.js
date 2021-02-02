import React, { useState } from 'react';

export default function AppointmentForm({ timeSlot, onSubmit, onCancel }) {
	const [patientDescription, setPatientDescription] = useState("");
	const [insuranceType, setInsuranceType] = useState("");

	function handleDescChange(e) {
		setPatientDescription(e.target.value);
	}

	function handleInsuranceChange(e) {
		setInsuranceType(e.target.value);
	}

	return (
		<>
			<div className="rounded bg-blue-200 p-3">
				<form onSubmit={() => onSubmit(patientDescription, insuranceType)}>
					<p className="text-center">Your Appointment</p>
					<p className="text-center text-lg font-semibold mb-5">{timeSlot.toLocaleString({ weekday: 'long', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
					<label htmlFor="desc">Describe why you need to come in</label>
					<textarea name="description" onChange={handleDescChange} className="w-full shadow-inner" maxLength="250" rows="3" />
					<p className={`text-sm ${patientDescription.length === 250 ? 'text-red-500' : 'text-gray-500'}`}>{patientDescription.length}/250</p>
					<select name="insurance" onChange={handleInsuranceChange} className="w-full mt-4" required>
						<option value="" selected disabled hidden>Please set your insurance type</option>
						<option value="public">Public</option>
						<option value="private">Private</option>
					</select>
					<button className="w-full bg-blue-500 text-lg text-white py-2 mt-8" type="submit">Make Appointment</button>
				</form>
				<button onClick={onCancel} className="w-full bg-gray-500 text-lg text-white py-2 mt-3">Back</button>
			</div>
		</>
    );
}