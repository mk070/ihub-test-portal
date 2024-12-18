import React, { useEffect, useState } from "react";
import axios from "axios";

const Mcq_Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalQuestions: 0,
    totalSections: 0,
    totalDuration: "00:00:00",
    maximumMark: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Questions from MongoDB via Backend
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      const response = await axios.get("http://localhost:8000/api/mcq/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedQuestions = response.data.questions || [];
      setQuestions(fetchedQuestions);
      setDashboardStats((prev) => ({
        ...prev,
        totalQuestions: fetchedQuestions.length,
      }));
    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error.message);
      alert("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Finish Contest Functionality
  const handleFinish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/finish-contest",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Contest finished successfully! Question IDs have been saved.");
      } else {
        alert("Failed to finish the contest. Please try again.");
      }
    } catch (error) {
      console.error("Error finishing contest:", error.response?.data || error.message);
      alert("Failed to finish the contest. Please try again.");
    }
  };

  // Load Data on Component Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock API response for dashboard stats (replace with actual API if needed)
        const statsResponse = {
          data: {
            totalSections: 3,
            totalDuration: "01:30:00",
            maximumMark: 50,
          },
        };

        setDashboardStats((prev) => ({
          ...prev,
          totalSections: statsResponse.data.totalSections,
          totalDuration: statsResponse.data.totalDuration,
          maximumMark: statsResponse.data.maximumMark,
        }));

        // Fetch questions from backend
        await fetchQuestions();
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="max-w-5xl w-full">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 mt-8">
          {[
            {
              label: "Total Questions",
              value: dashboardStats.totalQuestions,
              icon: "❓",
            },
            {
              label: "Total Sections",
              value: dashboardStats.totalSections,
              icon: "📂",
            },
            {
              label: "Total Duration",
              value: dashboardStats.totalDuration,
              icon: "⏱️",
            },
            {
              label: "Maximum Mark",
              value: dashboardStats.maximumMark,
              icon: "📝",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg border-l-4 border-yellow-400"
            >
              <div className="text-yellow-500 text-4xl">{item.icon}</div>
              <div className="text-right">
                <h3 className="text-gray-500 text-sm font-medium">
                  {item.label}
                </h3>
                <p className="text-xl font-semibold text-gray-800">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Questions List */}
        {!isLoading && questions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Loaded Questions
            </h3>
            <ul className="space-y-4">
              {questions.map((question, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 border border-gray-300"
                >
                  <div className="flex flex-col">
                    <h4 className="text-gray-800 font-medium">{`Question ${index + 1}`}</h4>
                    <p className="text-gray-600">{question.question}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {question.correctAnswer
                        ? `Answer: ${question.correctAnswer}`
                        : "No Answer Provided"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center mt-16">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-yellow-500" />
            <p className="text-gray-600 mt-4">Loading questions...</p>
          </div>
        )}

        {/* No Questions Fallback */}
        {!isLoading && questions.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-600">No questions available in the database.</p>
          </div>
        )}

        {/* Finish Button */}
        {!isLoading && questions.length > 0 && (
          <div className="flex justify-end mt-10">
            <button
              onClick={handleFinish}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mcq_Dashboard;
