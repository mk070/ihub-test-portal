import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const QuestionPreview = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    // Fetch selected questions from sessionStorage
    const storedQuestions = sessionStorage.getItem("selectedQuestions");
    if (storedQuestions) {
      try {
        setSelectedQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error("Failed to parse stored questions:", error);
      }
    }
  }, []);
  

  const handleAddQuestion = () => {
    alert("Add Question functionality not implemented yet.");
  };

  const handleRemoveQuestion = (id) => {
    const updatedQuestions = selectedQuestions.filter((q) => q.id !== id);
    setSelectedQuestions(updatedQuestions);
    sessionStorage.setItem("selectedQuestions", JSON.stringify(updatedQuestions));
  };

  const handlePublish = () => {
    alert("Publish functionality triggered.");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Selected Questions Preview
      </Typography>
      {selectedQuestions.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedQuestions.map((question, index) => (
                <TableRow key={index}>
                  <TableCell>{question.title}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleAddQuestion(question.id)}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography align="center" mt={4}>
          No questions selected.
        </Typography>
      )}
      <Box mt={4} display="flex" justifyContent="center">
        <Button variant="contained" color="primary" onClick={handlePublish}>
          Publish
        </Button>
      </Box>
    </Box>
  );
  
};

export default QuestionPreview;
