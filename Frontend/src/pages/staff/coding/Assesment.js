import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SinglePageStepper = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState(1);
    const navigate = useNavigate(); // Track the current step
    const [formData, setFormData] = useState({
        assessmentOverview: {
            name: "",
            description: "",
            registrationStart: "",
            registrationEnd: "",
            guidelines: "",
        },
        testConfiguration: {
            questions: "",
            duration: "",
            fullScreenMode: false,
            faceDetection: false,
            deviceRestriction: false,
            noiseDetection: false,
            passPercentage: "",
        },
    });

    const validateStep = () => {
        if (currentStep === 1) {
            const { name, description, registrationStart, registrationEnd, maxRegistrations, guidelines } = formData.assessmentOverview;
            return name && description && registrationStart && registrationEnd && maxRegistrations && guidelines;
        }
        if (currentStep === 2) {
            const { sections, questions, duration, passPercentage } = formData.testConfiguration;
            return sections && questions && duration && passPercentage;
        }
        // if (currentStep === 3) {
        //     const { sectionTitles } = formData.sectionDetails;
        //     return sectionTitles.length > 0; // Ensure at least one section title is provided
        // }
        return true; // Default to true for safety
    };

    
    const handleChange = (e, step) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [step]: {
                ...prevData[step],
                [name]: type === "checkbox" ? checked : value,
            },
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
        // Add your backend API call here
    };

    // Handle form input changes
    const handleInputChange = (e, step) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [step]: {
                ...prevData[step],
                [name]: type === "checkbox" ? checked : value,
            },
        }));
    };

    const handleTabClick = (tabNumber) => {
        setActiveTab(tabNumber);
      };
    
    const handleAddQuestion = () => {
        navigate('/UploadType'); // Navigate to the next part (e.g., a page for adding questions)
      };

    // const nextStep = async () => {
    //     if (validateStep()) {
    //         if (currentStep === 2) {
    //             await saveDataToMongoDB(); // Save data including contestId
    //         }
    //         if (currentStep < 3) setCurrentStep((prev) => prev + 1);
    //     } else {
    //         alert("Please fill in all required fields before proceeding.");
    //     }
    // };
    const nextStep = () => {
        if (currentStep < 2) setCurrentStep((prev) => prev + 1);
      };
    

    // Move to the previous step
    const previousStep = () => {
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    };


    // const generateContestId = () => {
    //     return Math.random().toString(36).substr(2, 9); // Generates a random alphanumeric string
    // };
    
    const handleFinalSubmit = async () => {
        // const contestId = generateContestId(); // Generate contestId
        const payload = {
            // contestId, // Add contestId to the payload
            assessmentOverview: formData.assessmentOverview,
            testConfiguration: formData.testConfiguration,
        };
    
        try {
            const response = await fetch("http://localhost:8000/api/create-assessment/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
    
            if (response.ok && data.assessmentId) {
                console.log("Data saved successfully with Contest ID:", data);
                alert("Form Submitted! Check the console for data.");
                window.location.href = `/${data.assessmentId}/Questions`; // Assuming the URL is something like /questions/{contestId}
                // Optionally store contestId in local state or pass it along
            } else {
                console.error("Failed to save data");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
            {/* Stepper */}
            <div className="flex justify-between items-center w-full max-w-4xl mb-8">
                {["Assessment Overview", "Test Configuration"].map(
                    (step, index) => (
                        <div key={index} className="flex flex-col items-center w-1/3">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${currentStep === index + 1
                                        ? "bg-yellow-500 text-white"
                                        : "bg-gray-300 text-gray-700"
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <p
                                className={`mt-2 text-sm ${currentStep === index + 1
                                        ? "font-bold text-yellow-500"
                                        : "text-gray-500"
                                    }`}
                            >
                                {step}
                            </p>
                        </div>
                    )
                )}
            </div>

            {/* Step Content */}
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                {/* Step 1: Assessment Overview */}
                {currentStep === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Assessment Overview</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Assessment Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assessment Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.assessmentOverview.name}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter the name of the assessment"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.assessmentOverview.description}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    rows="4"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Provide a brief overview of the assessment"
                                    required
                                ></textarea>
                            </div>

                            {/* Registration Start Date & Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Registration Start Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="registrationStart"
                                    value={formData.assessmentOverview.registrationStart}
                                    onChange={(e) => {
                                        const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                        const selectedTime = e.target.value;

                                        // Validation: Check if selected time is in the future
                                        if (selectedTime <= currentTime) {
                                            alert("The selected date and time must be in the future.");
                                            return; // Prevent updating the state with invalid value
                                        }

                                        // Update form data
                                        handleChange(e, "assessmentOverview");
                                    }}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} // Set minimum to current time
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Registration End Date & Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Registration End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="registrationEnd"
                                    value={formData.assessmentOverview.registrationEnd}
                                    onChange={(e) => {
                                        const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                        const selectedTime = e.target.value;
                                        const startTime = formData.assessmentOverview.registrationStart;

                                        // Validation: Check if selected time is in the future and after the start time
                                        if (selectedTime <= currentTime) {
                                            alert("The selected date and time must be in the future.");
                                            return; // Prevent updating the state with invalid value
                                        }

                                        if (startTime && selectedTime <= startTime) {
                                            alert("The end time must be after the start time.");
                                            return; // Prevent updating the state with invalid value
                                        }

                                        // Update form data
                                        handleChange(e, "assessmentOverview");
                                    }}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} // Set minimum to current time
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
</div>

                            {/* Number of Registrations Allowed
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Registrations Allowed</label>
                                <input
                                    type="number"
                                    name="maxRegistrations"
                                    value={formData.assessmentOverview.maxRegistrations}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter the maximum number of registrations"
                                    required
                                />
                            </div> */}

                            {/* Guidelines */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Guidelines and Rules</label>
                                <textarea
                                    name="guidelines"
                                    value={formData.assessmentOverview.guidelines}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    rows="6"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Outline the rules students must follow during the test"
                                    required
                                ></textarea>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 2: Test Configuration */}
                {currentStep === 2 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Number of Sections
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Sections
                                </label>
                                <input
                                    type="number"
                                    name="sections"
                                    value={formData.testConfiguration.sections}
                                    onChange={(e) => handleChange(e, "testConfiguration")}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Specify how many sections the test will have"
                                    required
                                />

                            </div> */}

                            {/* Number of Questions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Questions
                                </label>
                                <input
                                    type="number"
                                    name="questions"
                                    value={formData.testConfiguration.questions}
                                    onChange={(e) => handleChange(e, "testConfiguration")}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter a brief description of the assessment"
                                    required
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration of the Test
                                </label>
                                <input
                                    type="time"
                                    name="duration"
                                    value={formData.testConfiguration.duration}
                                    onChange={(e) => handleChange(e, "testConfiguration")}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                                    required
                                />
                            </div>

                            {/* Guidelines and Rules */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Guidelines and Rules of the Assessment</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: "Full Screen Mode", name: "fullScreenMode" },
                                        { label: "Face Detection", name: "faceDetection" },
                                        { label: "Device Restriction", name: "deviceRestriction" },
                                        { label: "Noise Detection", name: "noiseDetection" },
                                        { label: "Negative Marking", name: "negativeMarking" },
                                    ].map((toggle) => (
                                        <div
                                            key={toggle.name}
                                            className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm"
                                        >
                                            <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name={toggle.name}
                                                    checked={formData[toggle.name]}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer-checked:bg-yellow-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scoring & Result Preferences */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Scoring & Result Preferences</h2>
                                {/* Pass Percentage */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pass Percentage
                                    </label>
                                    <input
                                        type="number"
                                        name="passPercentage"
                                        value={formData.testConfiguration.passPercentage}
                                        onChange={(e) => handleChange(e, "testConfiguration")}
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="Enter the pass percentage"
                                        required
                                    />
                                </div>

                                {/* Negative Marking */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Negative Marking
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="negativeMarkingType"
                                                value="Stay until test ends"
                                                checked={formData.testConfiguration.negativeMarkingType === "Stay until test ends"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Stay until test ends</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="negativeMarkingType"
                                                value="Allow early submission"
                                                checked={formData.testConfiguration.negativeMarkingType === "Allow early submission"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Allow early submission</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Result Visibility */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Result Visibility
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="resultVisibility"
                                                value="Immediate release"
                                                checked={formData.testConfiguration.resultVisibility === "Immediate release"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Immediate release</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="resultVisibility"
                                                value="After test completed"
                                                checked={formData.testConfiguration.resultVisibility === "After test completed"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">After test completed</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

        {/* {currentStep === 3 && (
            
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Structure Setup
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Organize your test with sections or add questions directly for a
            tailored organization.
          </p>
          <div className="flex justify-between">
            <button
              className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
              onClick={() => alert('Add Section Clicked')}
            >
              Add Section
            </button>
            <button
              className="w-48 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-300"
              onClick={handleAddQuestion}
            >
              Add Question
            </button>
          </div>
        </div>
       
      )} */}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between w-full max-w-4xl mt-8">
                {currentStep > 1 && (
                    <button
                        onClick={previousStep}
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow hover:bg-gray-300"
                    >
                        Previous
                    </button>
                )}
                {currentStep < 2 && (
                    <button
                        onClick={nextStep}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700"
                    >
                        Next
                    </button>
                )}
                {currentStep === 2 && (
                    <button
                        onClick={handleFinalSubmit}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
                    >
                        Submit
                    </button>
                )}
            </div>
        </div>
    );
};

export default SinglePageStepper;