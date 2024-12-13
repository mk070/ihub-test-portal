import React, { useState, useEffect } from "react";
import { PlusCircle, Upload, Loader2, Search, ChevronRight, Filter, X } from "lucide-react";

// Utility functions remain the same
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
    <div className="flex flex-wrap gap-2">
      {tagArray.map((tag, index) => (
        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
          {tag.trim()}
        </span>
      ))}
    </div>
  );
};

const Dashboard = () => {
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleQuestionModalOpen, setIsSingleQuestionModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ level: [], tags: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [singleQuestionData, setSingleQuestionData] = useState({
    question: "", option1: "", option2: "", option3: "", option4: "",
    answer: "", level: "easy", tags: ""
  });

  const questionsPerPage = 10;

  // Fetch questions and set available tags
  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const tags = new Set();
    questions.forEach(question => {
      if (question.tags) {
        const questionTags = typeof question.tags === 'string' 
          ? question.tags.split(',').map(tag => tag.trim())
          : question.tags;
        questionTags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  }, [questions]);

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

  // Form handling
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
        setTimeout(() => setIsSingleQuestionModalOpen(false), 1500);
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
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadStatus("Error: Unable to upload file.");
    }
  };

  // Filter and search logic
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.options.some(option => option.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = filters.level.length === 0 || filters.level.includes(question.level);
    
    const questionTags = typeof question.tags === 'string' 
      ? question.tags.split(',').map(tag => tag.trim())
      : question.tags || [];
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => questionTags.includes(tag));

    return matchesSearch && matchesLevel && matchesTags;
  });

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ level: [], tags: [] });
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                {(filters.level.length > 0 || filters.tags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Difficulty Level Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Difficulty Level</h4>
                  <div className="space-y-2">
                    {['easy', 'medium', 'hard'].map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.level.includes(level)}
                          onChange={() => toggleFilter('level', level)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={() => toggleFilter('tags', tag)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

{/* Main Content */}
<div className="flex-1">
  {/* Header with Search and Actions */}
  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
    <div className="relative flex-1 max-w-lg">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search questions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div className="flex gap-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
      >
        <Upload className="w-5 h-5 mr-2" />
        Import Question
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

  {/* Questions List */}
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
    <div className="space-y-4">
      {currentQuestions.map((question, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 relative ${
            selectedQuestion === index ? 'scale-100' : 'hover:shadow-md'
          }`}
        >
          <div
            className="p-6 cursor-pointer"
            onClick={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">
                {indexOfFirstQuestion + index + 1}
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-lg font-medium text-gray-900">{question.question}</p>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      selectedQuestion === index ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      getLevelBadgeColor(question.level)
                    }`}
                  >
                    {question.level || 'Not specified'}
                  </span>
                  {renderTags(question.tags)}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content (Slide-in from the right) */}
          <div
            className={`absolute top-0 right-0 w-96 bg-white border border-gray-200 rounded-l-xl overflow-hidden transition-all duration-500 ease-in-out ${
              selectedQuestion === index ? 'max-h-[500px] translate-x-0' : 'max-h-0 translate-x-full'
            }`}
          >
            <div className="p-6 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {filteredQuestions.length > questionsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

        </div>
      </div>

      {/* Modals */}
      {/* Import Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Import Question
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
          </div>
        </div>
      )}

{/* Single Question Modal */}
{isSingleQuestionModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Add New Question</h2>
        <button
          onClick={() => setIsSingleQuestionModalOpen(false)}
          className="text-gray-500 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSingleQuestionSubmit} className="space-y-6">
        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            name="question"
            value={singleQuestionData.question}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            rows={4}
            required
          />
        </div>

        {/* Options Input */}
        {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
          <div key={optionKey}>
            <label className="block text-sm font-medium text-black mb-2">
              Option {index + 1} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name={optionKey}
              value={singleQuestionData[optionKey]}
              onChange={handleSingleQuestionInputChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
              required
            />
          </div>
        ))}

        {/* Correct Answer Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Correct Answer <span className="text-red-500">*</span>
          </label>
          <select
            name="answer"
            value={singleQuestionData.answer}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
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

        {/* Difficulty Level Select */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <select
            name="level"
            value={singleQuestionData.level}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={singleQuestionData.tags}
            onChange={handleSingleQuestionInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
            placeholder="e.g., math, algebra, geometry"
          />
          <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div
            className={`p-4 rounded-lg text-sm font-medium text-center shadow-sm ${
              uploadStatus.startsWith("Success")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {uploadStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setIsSingleQuestionModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-300"
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