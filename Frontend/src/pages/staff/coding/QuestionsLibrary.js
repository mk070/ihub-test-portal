// QuestionLibrary.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
} from "@mui/material";
import axios from "axios";

const QuestionLibrary = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:8000/manualProblems/");
        setQuestions(response.data.problems);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionSelect = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    console.log("Selected Questions:", selectedQuestions);
    // Add your submit logic here
    alert("Questions submitted successfully!");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Question Library
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedQuestions.length > 0 &&
                    selectedQuestions.length < questions.length
                  }
                  checked={
                    questions.length > 0 &&
                    selectedQuestions.length === questions.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedQuestions(questions.map((q) => q.id));
                    } else {
                      setSelectedQuestions([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => handleQuestionSelect(question.id)}
                  />
                </TableCell>
                <TableCell>{question.title}</TableCell>
                <TableCell>{question.problem_statement}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={selectedQuestions.length === 0}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default QuestionLibrary;