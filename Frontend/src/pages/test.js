import React, { useState } from 'react';


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

    const [step, setStep] = useState(1);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setContestData({
            ...contestData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNext = () => {
        setStep(2);
    };

    return (
        <div className="create-contest max-w-10xl mx-auto p-10 bg-white shadow-md rounded-md">
            <div className="steps flex justify-between mb-6">
                <span className={`step ${step === 1 ? 'font-bold text-blue-600' : 'text-gray-400'}`}>1. Create Contest</span>
                <span className={`step ${step === 2 ? 'font-bold text-blue-600' : 'text-gray-400'}`}>2. File Upload</span>
            </div>

            {step === 1 && (
                <>
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
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="text-3xl font-semibold mb-6">Our Services</h2>
                    <p className="mb-8 text-gray-600">Please select which service you are interested in.</p>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-8">
                            <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                                <span className="text-4xl text-blue-600 mb-4">+</span>
                                <h3 className="text-lg font-semibold mb-2">Create Questions</h3>
                                <p className="text-gray-600 text-center">From here you can add questions of multiple types like MCQs, subjective (text or paragraph).</p>
                            </div>
                            <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                                <span className="text-4xl text-green-600 mb-4">&uarr;</span>
                                <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
                                <p className="text-gray-600 text-center">From here you can easily add multiple questions by uploading a CSV sheet!</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                                <span className="text-4xl text-yellow-600 mb-4">&#128218;</span>
                                <h3 className="text-lg font-semibold mb-2">Question Library</h3>
                                <p className="text-gray-600 text-center">From here you can add questions of multiple types like MCQs, subjective (text or paragraph).</p>
                            </div>
                            <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                                <span className="text-4xl text-purple-600 mb-4">&uarr;</span>
                                <h3 className="text-lg font-semibold mb-2">AI Question Generator</h3>
                                <p className="text-gray-600 text-center">From here you can easily add multiple questions by uploading a CSV sheet!</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateContest;
