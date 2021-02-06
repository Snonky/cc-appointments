import React, { useState, useEffect } from 'react';
import { useRouteMatch, useHistory, generatePath } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'
import AddressEditor from './AddressEditor';
import AppointmentCalendar from './AppointmentCalendar'
import AppointentCalendarEditor from './AppointmentCalendarEditor';
import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';
import OpeningHoursEditor from './OpeningHoursEditor';

export default function DoctorsOfficeEditor() {
    const [office, setOffice] = useState();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [unsavedOfficeProps, setUnsavedOfficeProps] = useState(new Set().add("name"));
    const [avatarImageFile, setAvatarImageFile] = useState(null);
    const [unsavedAvatarImageFile, setUnsavedAvatarImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [unsavedGalleryImageFiles, setUnsavedGalleryImageFiles] = useState([]);
    const { params } = useRouteMatch();
    const history = useHistory();
    const { authenticatedRequest } = useAuth();

    function errorHandler(error) {
        console.error(error);
        setError("Doctor's office page cannot be displayed.");
        setLoading(false);
    }

    useEffect(() => {
        setLoading(true);
        setError(null);
        authenticatedRequest('GET', generatePath('/doctors-offices/:officeId', params))
            .then((fetchedOffice) => {
                setOffice(fetchedOffice);
                setLoading(false);
            })
            .catch(errorHandler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChange(value) {
        const newOffice = {};
        const newUnsavedProps = new Set(unsavedOfficeProps);
        Object.assign(newOffice, office);
        Object.assign(newOffice, value);
        Object.keys(value).forEach(prop => newUnsavedProps.add(prop));
        setUnsavedOfficeProps(newUnsavedProps);
        setOffice(newOffice);
    }

    function handleAvatarChange(e) {
        if (e.target.files.length > 0) {
            setAvatarImageFile(e.target.files[0]);
            setUnsavedAvatarImageFile(e.target.files[0]);
        } else {
            setAvatarImageFile(null);
            setUnsavedAvatarImageFile(null);
        }
    }

    function handleGalleryChange(e) {
        if (e.target.files.length > 0) {
            setGalleryImageFiles([...e.target.files]);
            setUnsavedGalleryImageFiles([...e.target.files]);
        } else {
            setGalleryImageFiles([]);
            setUnsavedGalleryImageFiles([]);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const unsavedOffice = {};
        // Copy all changed properties from the office to the request body
        unsavedOfficeProps.forEach(prop => unsavedOffice[prop] = office[prop]);
        const uploads = [];
        const officeUpload = authenticatedRequest('PUT', generatePath('/doctors-offices/:officeId', params), unsavedOffice)
            .then(() => {
                setUnsavedOfficeProps(new Set().add("name"));
            });
        uploads.push(officeUpload);

        if (unsavedAvatarImageFile !== null) {
            const body = new FormData();
            body.append("file", unsavedAvatarImageFile);
            const avatarUpload = authenticatedRequest('POST', generatePath('/doctors-offices/:officeId/upload-avatar', params), body)
                .then(() => {
                    setUnsavedAvatarImageFile(null);
                });
            uploads.push(avatarUpload);
        } else {
            uploads.push(Promise.resolve(0));
        }

        if (unsavedGalleryImageFiles.length > 0) {
            const body = new FormData();
            unsavedGalleryImageFiles.forEach(file => {
                body.append("files", file);
            });
            const galleryUpload = authenticatedRequest('POST', generatePath('/doctors-offices/:officeId/upload-pictures', params), body)
                .then(() => {
                    setUnsavedGalleryImageFiles([]);
                });
            uploads.push(galleryUpload);
        } else {
            uploads.push(Promise.resolve(0));
        }

        Promise.allSettled(uploads)
            .then(([officeResult, avatarResult, galleryResult]) => {
                const errors = [];
                if (officeResult.status === "rejected") {
                    errors.push("The office's configuration could not be saved.");
                }
                if (avatarResult.status === "rejected") {
                    errors.push("The profile picture could not be saved.");
                }
                if (galleryResult.status === "rejected") {
                    errors.push("The gallery pictures could not be saved.");
                }
                if (errors.length > 0) {
                    setError(errors.map((e, idx) => <p key={idx}>{e}</p>));
                    setSaving(false);
                } else {
                    history.push(generatePath('/office/:officeId', params));
                }
            });
    }

    if (loading) {
        return <LoadingSpinner />;
    } else {
        return (
            <form onSubmit={handleSubmit}>
                <div id="office" className="flex flex-col lg:w-8/12 md:w-full mx-auto space-y-6 mb-40">
                    {error}
                    <button className="w-full bg-green-400 text-lg text-white py-2"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <div id="title" className="flex flex-col justify-center h-20 bg-blue-200 text-center text-2xl rounded border-2 border-gray-400">
                        <input className="text-center" placeholder="Title your office's page" name="title-input" type="text"
                            maxLength="50"
                            value={office.name}
                            onChange={(e) => handleChange({ name: e.target.value })}
                        />
                    </div>
                    <div id="content" className="flex flex-row justify-between space-x-2">
                        <div id="content-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 2 }}>
                            <div id="description" className="p-3 rounded border-2 border-gray-300">
                                <textarea name="description-textarea" className="w-full border border-gray-400"
                                    placeholder="Enter a description of your office"
                                    rows="8"
                                    maxLength="2000"
                                    value={office.profileDescription}
                                    onChange={(e) => handleChange({ profileDescription: e.target.value })}
                                />
                            </div>

                            <div id="calendar" className="p-3 rounded border-2 border-gray-300">
                                <div id="calender-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Appointment Calendar Settings</p>
                                </div>
                                <AppointentCalendarEditor
                                    dayCount={office.dayCount}
                                    timeSlot={office.timeSlot}
                                    onChange={handleChange}
                                />
                                <div id="calender-preview-title" className="rounded border-2 border-gray-300 my-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Calendar Preview</p>
                                </div>
                                <AppointmentCalendar
                                    appointments={[]}
                                    dayCount={office.dayCount}
                                    currentTime={new Date()}
                                    openingHours={office.openingHours}
                                    timeSlot={office.timeSlot}
                                    selectable={false}
                                />
                            </div>
                        </div>
                        <div id="sidebar-column" className="flex flex-col space-y-3 min-w-0 overflow-hidden" style={{ flex: 1 }}>
                            <div id="avatar" className="p-3 rounded border-2 border-gray-300">
                                <label htmlFor="avatar-upload">Upload a new profile picture</label>
                                <input
                                    name="avatar-upload"
                                    type="file"
                                    accept='image/jpeg,image/png'
                                    onChange={handleAvatarChange}
                                />
                                <ImageList imageUrls={avatarImageFile ? [URL.createObjectURL(avatarImageFile)] : [office.avatarUrl]} />
                            </div>
                            <div id="opening-hours" className="p-3 rounded border-2 border-gray-300">
                                <div id="opening-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Opening Hours</p>
                                </div>
                                <OpeningHoursEditor
                                    openingHours={office.openingHours}
                                    onChange={handleChange}
                                />
                            </div>
                            <div id="address" className="p-3 rounded border-2 border-gray-300">
                                <div id="address-title" className="rounded border-2 border-gray-300 mb-3 text-center text-lg font-semibold bg-blue-200">
                                    <p>Address</p>
                                </div>
                                <AddressEditor
                                    address={office.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div id="address" className="p-3 rounded border-2 border-gray-300">
                                <label htmlFor="gallery-upload">Upload pictures for a gallery</label>
                                <input
                                    name="gallery-upload"
                                    type="file"
                                    multiple accept='image/jpeg,image/png'
                                    onChange={handleGalleryChange}
                                />
                                <ImageList imageUrls={galleryImageFiles.map(URL.createObjectURL).concat(office.pictureUrls)} />
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-green-400 text-lg text-white py-2"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        );
    }
}