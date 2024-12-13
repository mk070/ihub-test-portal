import React, { useState } from 'react';

const CreateContest = () => {
    const [contestData, setContestData] = useState({
        assessmentName: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        noEndTime: false,
        guidelines: [''],
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setContestData({
            ...contestData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Usage in the frontend when you receive the contestId


    const handleNext = () => {
        // Check if the startDate and startTime are set
        if (!contestData.startDate || !contestData.startTime) {
            alert('Start date and time must be provided.');
            return;
        }

        // Ensure the endDate and endTime are properly set
        let startDateTime = `${contestData.startDate}T${contestData.startTime}:00`; // Adding seconds
        let endDateTime = `${contestData.endDate}T${contestData.endTime}:00`; // Adding seconds

        // Handle the case where no end time is set
        if (contestData.noEndTime) {
            endDateTime = null; // Or handle it according to your needs
        }

        // Now proceed to call your API with the correctly formatted date-time
        const contestPayload = {
            assessmentName: contestData.assessmentName,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            guidelines: contestData.guidelines,
            // add other fields
        };

        // Perform the API call here
    };

    const handleSubmit = async (event) => {
        event.preventDefault();  // Prevent default form submission

        const formData = {
            assessmentName: contestData.assessmentName,  // assessmentName instead of contestName
            startDate: contestData.startDate, // Should match backend
            startTime: contestData.startTime, // Should match backend
            endDate: contestData.endDate,
            endTime: contestData.endTime,
            guidelines: contestData.guidelines,  // Sending guidelines data
        };

        // Validate input data before sending it to backend
        if (!contestData.assessmentName || !contestData.startDate || !contestData.startTime) {
            alert('Assessment name, start date, and start time must be provided.');
            return;
        }

        // Ensure the endDate and endTime are properly set
        let startDateTime = `${contestData.startDate}T${contestData.startTime}:00`; // Adding seconds
        let endDateTime = `${contestData.endDate}T${contestData.endTime}:00`; // Adding seconds

        // Handle the case where no end time is set
        if (contestData.noEndTime) {
            endDateTime = null; // Or handle it according to your needs
        }

        // Prepare the payload
        const contestPayload = {
            assessmentName: contestData.assessmentName, // assessmentName in payload
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            guidelines: contestData.guidelines, // guidelines data
        };

        // Perform the API call to create the contest
        try {
            const response = await fetch('http://localhost:8000/api/create-assessment/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contestPayload),
            });

            const data = await response.json();

            if (response.ok && data.contestId) {
                // Redirect to the questions page with the contestId
                window.location.href = `/${data.contestId}/Questions`; // Assuming the URL is something like /questions/{contestId}
            } else {
                alert('Error creating contest: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="create-contest max-w-10xl mx-auto p-10 bg-white shadow-md rounded-md">
            <div className="steps flex justify-between mb-6">
                <span className="font-bold text-blue-600">1. Create Contest</span>
                <span className="text-gray-400">2. File Upload</span>
            </div>

            <h2 className="text-3xl font-semibold mb-6">Create Contest</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                    <label htmlFor="assessmentName" className="block text-gray-700">Assessment Name</label>
                    <input
                        type="text"
                        id="assessmentName"
                        name="assessmentName"
                        value={contestData.assessmentName}
                        onChange={handleChange}
                        placeholder="Enter assessment name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="startDate" className="block text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={contestData.startDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="startTime" className="block text-gray-700">Start Time</label>
                        <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={contestData.startTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endDate" className="block text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={contestData.endDate}
                            onChange={handleChange}
                            disabled={contestData.noEndTime}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endTime" className="block text-gray-700">End Time</label>
                        <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={contestData.endTime}
                            onChange={handleChange}
                            disabled={contestData.noEndTime}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="noEndTime"
                            checked={contestData.noEndTime}
                            onChange={handleChange}
                            className="form-checkbox text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">No End Time</span>
                    </label>
                </div>

                <div className="form-group">
                    <label htmlFor="guidelines" className="block text-gray-700">Guidelines</label>
                    {contestData.guidelines.map((guideline, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                value={guideline}
                                onChange={(e) => {
                                    const newGuidelines = [...contestData.guidelines];
                                    newGuidelines[index] = e.target.value;
                                    setContestData({ ...contestData, guidelines: newGuidelines });
                                }}
                                placeholder={`Guideline ${index + 1}`}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setContestData({ ...contestData, guidelines: [...contestData.guidelines, ''] })}
                        className="mt-2 text-blue-600"
                    >
                        Add Another Guideline
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create Contest
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateContest;
