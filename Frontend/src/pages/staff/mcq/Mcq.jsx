import React, { useState, useEffect } from "react";
import { PlusCircle, Upload, Loader2, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuestionFilters from "../../../components/staff/mcq/QuestionFilters";
import QuestionImportModal from "../../../components/staff/mcq/QuestionImportModal";
import AddQuestionModal from "../../../components/staff/mcq/AddQuestionModal";
import QuestionDetails from "../../../components/staff/mcq/QuestionDetails";


const Dashboard = () => {
  // Utility functions
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
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
    level: "easy",
    tags: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const questionsPerPage = 10;

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

  const handleDelete = async (question_id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/delete_question/${question_id}/`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete question');
      }
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleUpdate = async (question_id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/update_question/${question_id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedQuestion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update question');
      }

      setIsEditing(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
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
      const response = await fetch("http://127.0.0.1:8000/api/mcq-bulk-upload/", {
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
          question: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          answer: "",
          level: "easy",
          tags: ""
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

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <QuestionFilters
              filters={filters}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
              availableTags={availableTags}
            />
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
                    className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md cursor-pointer"
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">
                          {indexOfFirstQuestion + index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-lg font-medium text-gray-900">{question.question}</p>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
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
      <QuestionImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleBulkUpload}
        uploadStatus={uploadStatus}
      />

      <AddQuestionModal
        isOpen={isSingleQuestionModalOpen}
        onClose={() => setIsSingleQuestionModalOpen(false)}
        formData={singleQuestionData}
        onChange={handleSingleQuestionInputChange}
        onSubmit={handleSingleQuestionSubmit}
        uploadStatus={uploadStatus}
      />

      <QuestionDetails
        question={selectedQuestion}
        isEditing={isEditing}
        onClose={() => setSelectedQuestion(null)}
        onEdit={setIsEditing}
        onUpdate={() => handleUpdate(selectedQuestion?.question_id)}
        onDelete={() => handleDelete(selectedQuestion?.question_id)}
        isLoading={isLoading}
        getLevelBadgeColor={getLevelBadgeColor}
        renderTags={renderTags}
        setQuestion={setSelectedQuestion}
      />
    </div>
  );
};

export default Dashboard;