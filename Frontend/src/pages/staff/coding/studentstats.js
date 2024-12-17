import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { BookOpen, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useParams } from 'react-router-dom';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const EnhancedStudentDashboard = () => {
  const { regno } = useParams(); // Extract regno from route parameters
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student data from the backend
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!regno) {
          console.error("Registration number is missing");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `http://127.0.0.1:8000/staff/studentstats/${regno}/`
        );

        if (response.status === 200) {
          setStudentData(response.data);
        } else {
          console.error(`Error fetching student data: ${response.status}`);
          setStudentData(null);
        }
      } catch (error) {
        console.error("Error fetching student data:", error.message);
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [regno]);

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  // Handle missing or invalid student data
  if (!studentData || !studentData.performance) {
    return (
      <div className="text-center text-xl text-red-500">
        Error: Unable to load student data. Please check the registration number.
      </div>
    );
  }

  const { student, performance, assessments } = studentData;
  const { total_tests = 0, completed_tests = 0, in_progress_tests = 0, average_score = 0 } = performance;

  // Doughnut chart data for test completion
  const completionData = {
    labels: ["Completed", "In Progress", "Remaining"],
    datasets: [
      {
        data: [
          completed_tests,
          in_progress_tests,
          total_tests - (completed_tests + in_progress_tests),
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Completed (green)
          "rgba(234, 179, 8, 0.8)", // In Progress (yellow)
          "rgba(229, 231, 235, 0.8)", // Remaining (gray)
        ],
        borderWidth: 0,
      },
    ],
  };

  // StatCard component to display key statistics
  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Student Overview */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {student.name}'s Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {student.dept} Department, {student.collegename}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={BookOpen}
          label="Total Tests"
          value={total_tests}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Tests"
          value={completed_tests}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={in_progress_tests}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={Trophy}
          label="Average Score"
          value={`${average_score}%`}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Completion Status */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Completion Status
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>
              {Math.round((completed_tests / total_tests) * 100)}% Complete
            </span>
          </div>
        </div>
        <div className="h-[240px]">
          <Doughnut
            data={completionData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>

      {/* Assessments Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Assessments</h2>
        {assessments.length === 0 ? (
          <div className="mt-4 text-gray-500">
            No assessments available at the moment.
          </div>
        ) : (
          assessments.map((assessment, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 mb-4"
            >
              <h3 className="text-md font-semibold text-gray-800">
                {assessment.assessmentName}
              </h3>
              <div className="text-sm text-gray-500">
                <p>
                  Start Date:{" "}
                  {new Date(assessment.startDate).toLocaleDateString()}
                </p>
                {assessment.endDate && (
                  <p>
                    End Date:{" "}
                    {new Date(assessment.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <h4 className="font-medium text-gray-700">Guidelines:</h4>
                <ul className="list-disc ml-6">
                  {assessment.guidelines.map((guideline, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700">Problems:</h4>
                {assessment.problems.map((problem, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    <p>
                      {problem.title} ({problem.level})
                    </p>
                    <p>{problem.problem_statement}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;
