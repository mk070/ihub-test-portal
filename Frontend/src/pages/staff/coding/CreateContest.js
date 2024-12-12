// CreateContest.js
import React, { useState } from 'react';
import Questions from './Questions';

const CreateContest = () => {
    const [contestData, setContestData] = useState({
        contestName: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        noEndTime: false,
        organizationType: '',
        organizationName: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setContestData({
            ...contestData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNext = () => {
        // Logic to navigate to Questions
        window.location.href = '/Questions'; // Assuming routing is set up
    };

    return (
        <div className="create-contest max-w-10xl mx-auto p-10 bg-white shadow-md rounded-md">
            <div className="steps flex justify-between mb-6">
                <span className="font-bold text-blue-600">1. Create Contest</span>
                <span className="text-gray-400">2. File Upload</span>
            </div>

            <h2 className="text-3xl font-semibold mb-6">Create Contest</h2>

            <form className="space-y-6">
                <div className="form-group">
                    <label htmlFor="contestName" className="block text-gray-700">Contest Name</label>
                    <input
                        type="text"
                        id="contestName"
                        name="contestName"
                        value={contestData.contestName}
                        onChange={handleChange}
                        placeholder="Enter contest name"
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
                    <label htmlFor="organizationType" className="block text-gray-700">Organization Type</label>
                    <input
                        type="text"
                        id="organizationType"
                        name="organizationType"
                        value={contestData.organizationType}
                        onChange={handleChange}
                        placeholder="Enter organization type"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="organizationName" className="block text-gray-700">Organization Name</label>
                    <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        value={contestData.organizationName}
                        onChange={handleChange}
                        placeholder="Enter organization name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 mt-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Next
                </button>
            </form>
        </div>
    );
};

export default CreateContest;
