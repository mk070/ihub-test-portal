import React, { useState, useEffect } from "react";
import { PlusCircle, Upload, Loader2 } from "lucide-react";

const Dashboard = () => {
  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleQuestionModalOpen, setIsSingleQuestionModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [singleQuestionData, setSingleQuestionData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
    level: "easy",
    tags: ""
  });

  // Question display states
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/fetch-all-questions/');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setSingleQuestionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSingleQuestionSubmit = async (e) => {
    e.preventDefault();
    const { question, option1, option2, option3, option4, answer, level } = singleQuestionData;
    
    if (!question || !option1 || !option2 || !option3 || !option4 || !answer || !level) {
      setUploadStatus("Error: Please fill in all required fields");
      return;
    }

    const options = [option1, option2, option3, option4];
    if (!options.includes(answer)) {
      setUploadStatus("Error: Answer must be one of the options");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-single-question/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleQuestionData)
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus(`Success: Question uploaded successfully! ID: ${data.question_id}`);
        setSingleQuestionData({
          question: "", option1: "", option2: "", option3: "", option4: "",
          answer: "", level: "easy", tags: ""
        });
        fetchQuestions();
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading question:", err);
      setUploadStatus("Error: Unable to upload question.");
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadStatus("Error: Only CSV files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("Error: File size exceeds 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/bulk-upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus("Success: " + data.message);
        fetchQuestions();
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadStatus("Error: Unable to upload file.");
    }
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      easy: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      hard: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[level?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const renderTags = (tags) => {
    if (!tags) return null;
    const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tagArray.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
            {tag.trim()}
          </span>
        ))}
      </div>
    );
  };

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Question Bank</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <Upload className="w-5 h-5 mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={() => setIsSingleQuestionModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <strong className="font-medium">Error: </strong>
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {currentQuestions.map((question, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {indexOfFirstQuestion + index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900 mb-4">{question.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-4 rounded-lg ${
                            option === question.answer
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className="font-medium text-gray-700">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className={option === question.answer ? 'text-green-800' : 'text-gray-600'}>
                            {' '}{option}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(question.level)}`}>
                        {question.level || 'Not specified'}
                      </span>
                      {renderTags(question.tags)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {questions.length > questionsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bulk Upload Questions
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file containing multiple questions. Maximum file size: 5MB
            </p>
            <input
              type="file"
              onChange={handleBulkUpload}
              accept=".csv"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-md ${
                uploadStatus.startsWith("Success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {uploadStatus}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Question Modal */}
      {isSingleQuestionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Add New Question
            </h2>
            <form onSubmit={handleSingleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <textarea
                  name="question"
                  value={singleQuestionData.question}
                  onChange={handleSingleQuestionInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                <div key={optionKey}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option {index + 1} *
                  </label>
                  <input
                    type="text"
                    name={optionKey}
                    value={singleQuestionData[optionKey]}
                    onChange={handleSingleQuestionInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer *
                </label>
                <select
                  name="answer"
                  value={singleQuestionData.answer}
                  onChange={handleSingleQuestionInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Correct Answer</option>
                  {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                    singleQuestionData[optionKey] && (
                      <option key={optionKey} value={singleQuestionData[optionKey]}>
                        Option {index + 1}: {singleQuestionData[optionKey]}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level *
                </label>
                <select
                  name="level"
                  value={singleQuestionData.level}
                  onChange={handleSingleQuestionInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={singleQuestionData.tags}
                  onChange={handleSingleQuestionInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., math, algebra, geometry"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate tags with commas
                </p>
              </div>

              {uploadStatus && (
                <div className={`p-3 rounded-md ${
                  uploadStatus.startsWith("Success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSingleQuestionModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;