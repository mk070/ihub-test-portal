import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Mcq_createQuestion = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [questionType, setQuestionType] = useState("MCQ");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [mark, setMark] = useState(0);
  const [negativeMark, setNegativeMark] = useState(0);
  const [randomizeOrder, setRandomizeOrder] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const navigate = useNavigate();

  // Fetch existing questions for the contest
  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please start the contest again.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/mcq/questions/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const questions = response.data.questions || [];
        setQuestionList(questions);

        if (questions.length > 0) {
          setCurrentQuestionIndex(0);
          loadQuestionIntoForm(questions[0]);
        } else {
          resetFormForNewQuestion();
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to fetch questions. Please try again.");
      }
    };

    fetchQuestions();
  }, []);


  const handleFinish = async () => {
    const token = localStorage.getItem("contestToken");
    if (!token) {
      alert("Unauthorized access. Please start the contest again.");
      return;
    }
  
    // Collect all question data, not just question IDs
    const questionData = questionList.map((q) => ({
      question_id: q.question_id,
      questionType: q.questionType,  // Include question type
      question: q.question,
      options: q.options,             // List of options for the question
      correctAnswer: q.correctAnswer,  // Correct answer for the question
      mark: q.mark,                    // Marks for the question
      negativeMark: q.negativeMark,   // Negative marks for the question
      randomizeOrder: q.randomizeOrder, // Whether the order should be randomized
    }));
  
    try {
      // Send the entire question data to the backend
      const response = await axios.post(
        "http://localhost:8000/api/mcq/finish-contest/",
        { questions: questionData },  // Send the full question data here
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      alert("Contest finished successfully!");
      navigate("/QuestionsDashboard"); // Navigate to another page after finishing
    } catch (error) {
      console.error("Error finishing contest:", error.response?.data || error.message);
      alert("Failed to finish contest. Please try again.");
    }
  };
  
  
  

  // Load question into form for editing
  const loadQuestionIntoForm = (questionData) => {
    setIsNewQuestion(false);
    setQuestionType(questionData.questionType || "MCQ");
    setQuestion(questionData.question || "");
    setOptions(questionData.options || ["", ""]);
    setCorrectAnswer(questionData.correctAnswer || "");
    setMark(questionData.mark || 0);
    setNegativeMark(questionData.negativeMark || 0);
    setRandomizeOrder(questionData.randomizeOrder || false);
  };

  const resetFormForNewQuestion = () => {
    setIsNewQuestion(true);
    setQuestionType("MCQ");
    setQuestion("");
    setOptions(["", ""]);
    setCorrectAnswer("");
    setMark(0);
    setNegativeMark(0);
    setRandomizeOrder(false);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleAddOption = () => setOptions([...options, ""]);
  const handleDeleteOption = (index) =>
    setOptions(options.filter((_, i) => i !== index));

  const handleSaveQuestion = async () => {
    const token = localStorage.getItem("contestToken");
    if (!token) {
      alert("Unauthorized access.");
      return;
    }
  
    const newQuestion = {
      questionType,
      question,
      options: questionType === "MCQ" ? options : [],
      correctAnswer,
      mark,
      negativeMark,
      randomizeOrder: questionType === "MCQ" ? randomizeOrder : false,
    };
  
    try {
      if (isNewQuestion) {
        const response = await axios.post(
          "http://localhost:8000/api/mcq/save-questions/",
          { questions: [newQuestion] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        setQuestionList((prevQuestions) => [
          ...prevQuestions,
          { ...newQuestion, question_id: response.data.questions[0].question_id },
        ]);
        setCurrentQuestionIndex(questionList.length);
        alert("New question saved successfully!");
      } else {
        const questionId = questionList[currentQuestionIndex].question_id;
        await axios.put(
          "http://localhost:8000/api/assessment/questions/update",
          { ...newQuestion, question_id: questionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        const updatedList = [...questionList];
        updatedList[currentQuestionIndex] = {
          ...updatedList[currentQuestionIndex],
          ...newQuestion,
        };
        setQuestionList(updatedList);
        alert("Question updated successfully!");
      }
    } catch (error) {
      console.error("Error saving question:", error.response?.data || error.message);
      alert("Failed to save the question. Please try again.");
    }
  };
  
  
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      loadQuestionIntoForm(questionList[prevIndex]);
    }
  };

  

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionList.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      loadQuestionIntoForm(questionList[nextIndex]);
    } else {
      resetFormForNewQuestion();
      setCurrentQuestionIndex(questionList.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-2">
          Create Questions
        </h2>
        {/* <p className="text-gray-600 text-lg">Contest ID: {contestId}</p> */}
      </header>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="col-span-1 bg-gray-50 p-6 rounded-lg shadow flex flex-col">
          <h3 className="font-semibold text-indigo-700 mb-4">Question List</h3>
          <ul className="space-y-4 flex-grow">
            {questionList.map((q, index) => (
              <li
                key={index}
                className="p-3 bg-indigo-100 rounded-lg shadow flex items-center justify-between"
              >
                <div className="text-indigo-800">
                  <span className="block font-medium">
                    {q.question.slice(0, 20)}...
                  </span>
                  <span className="text-sm text-gray-600 italic">
                    {q.questionType}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Finish Button */}
          <button
          onClick={handleFinish} 
          className="bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 mt-auto">
            Finish
          </button>
        </aside>

        {/* Main Form */}
        <main className="col-span-3 bg-gray-50 p-6 rounded-lg shadow">
          {/* Question Type */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="questionType"
                className="block text-lg font-medium text-gray-700 mb-2 flex justify-start"
              >
                Question Type
              </label>
              <select
                id="questionType"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full border rounded-lg p-2 text-gray-700"
              >
                <option value="MCQ">Multiple Choice Question</option>
                <option value="FillInTheBlanks">Fill in the Blanks</option>
              </select>
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-6">
            <label
              htmlFor="question"
              className="block text-lg font-medium text-gray-700 mb-2  flex justify-start"
            >
              Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border rounded-lg p-4 text-gray-700"
              placeholder="Enter your question here"
            />
          </div>

          {/* Options Section for MCQ */}
          {questionType === "MCQ" && (
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2  flex justify-start" >
                Choices
              </label>
              {options.map((option, index) => (
                <div className="flex items-center mb-2" key={index}>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-grow border rounded-lg p-2 text-gray-700"
                  />
                  <button
                    onClick={() => handleDeleteOption(index)}
                    className="ml-2 text-red-500 font-semibold"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="bg-indigo-700 text-white py-1 px-3 rounded-lg mt-2 hover:bg-indigo-800  flex justify-start"
              >
                Add Choice
              </button>
            </div>
          )}

          {/* Correct Answer */}
          <div className="mb-6">
            <label
              htmlFor="correctAnswer"
              className="block text-lg font-medium text-gray-700 mb-2  flex justify-start"
            >
              Correct Answer
            </label>
            {questionType === "MCQ" ? (
              <select
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full border rounded-lg p-2 text-gray-700"
              >
                <option value="">Select the correct option</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {String.fromCharCode(65 + index)}. {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full border rounded-lg p-2 text-gray-700"
                placeholder="Enter the correct answer"
              />
            )}
          </div>

          {/* Additional Settings */}
          {questionType === "MCQ" && (
            <div className="flex items-center mb-6">
              <label className="text-lg font-medium text-gray-700 mr-2">
                Randomize Order
              </label>
              <input
                type="checkbox"
                checked={randomizeOrder}
                onChange={() => setRandomizeOrder(!randomizeOrder)}
                className="w-5 h-5"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 mr-4">
              <label
                htmlFor="negativeMark"f
                className="block text-lg font-medium text-gray-700 mb-1 flex justify-start "
              >
                Negative Mark
              </label>
              <input
                type="number"
                id="negativeMark"
                value={negativeMark}
                onChange={(e) => setNegativeMark(Number(e.target.value))}
                className="w-24 border rounded-lg p-2 text-gray-700 text-center flex justify-start"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="mark"
                className="block text-lg font-medium text-gray-700 mb-2 flex justify-start"
              >
                Marks
              </label>
              <input
                type="number"
                id="mark"
                value={mark}
                onChange={(e) => setMark(Number(e.target.value))}
                className="w-24 border rounded-lg p-2 text-gray-700 text-center flex justify-start"
                placeholder="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousQuestion}
              className="bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-800"
              disabled={currentQuestionIndex <= 0}
            >
              Previous
            </button>
            <button
              onClick={handleSaveQuestion}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleNextQuestion}
              className="bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-800"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Mcq_createQuestion;