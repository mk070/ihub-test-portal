// QuestionsLibrary.js
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
} from "@mui/material";
import axios from "axios";

const QuestionsLibrary = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:8000/manualProblems/");
        setQuestions(response.data.problems);
        setFilteredQuestions(response.data.problems);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((question) =>
        question.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by difficulty
    if (difficulty) {
      filtered = filtered.filter((question) => question.level === difficulty);
    }

    setFilteredQuestions(filtered);
  }, [searchQuery, difficulty, questions]);

  const handleSelectQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (id) => {
    const questionDetails = questions.find((q) => q.id === id);
    setSelectedQuestionDetails(questionDetails);
    setDrawerOpen(true);
  };

  const handleDeleteQuestion = (id) => {
    setSelectedQuestions((prev) => prev.filter((qid) => qid !== id));
  };

  const handlePublish = async () => {
    try {
      const selectedQuestionsData = questions.filter((q) =>
        selectedQuestions.includes(q.id)
      );

      await axios.post("http://localhost:8000/publishQuestions/", {
        questions: selectedQuestionsData,
      });

      alert("Questions published successfully!");
    } catch (error) {
      console.error("Failed to publish questions:", error);
      alert("Failed to publish questions. Please try again.");
    }
  };

  if (loading) {
    return <Typography align="center">Loading questions...</Typography>;
  }

  if (error) {
    return <Typography align="center" color="error">{error}</Typography>;
  }

  return (
    <Box p={4} display="flex">
      {/* Main Question Library */}
      <Box flex={2} pr={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Question Library
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, marginRight: "1rem" }}
          />

          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel id="difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="difficulty-label"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {filteredQuestions.length === 0 ? (
          <Typography align="center">No questions available in the library.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => handleSelectQuestion(question.id)}
                      />
                    </TableCell>
                    <TableCell>{question.title}</TableCell>
                    <TableCell>{question.problem_statement}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewDetails(question.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Selected Questions Drawer */}
      <Box flex={1} pl={2}>
        <Typography variant="h5" gutterBottom>
          Selected Questions
        </Typography>

        {selectedQuestions.length === 0 ? (
          <Typography align="center">No questions selected.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedQuestions.map((id) => {
                  const question = questions.find((q) => q.id === id);
                  return (
                    <TableRow key={id} hover>
                      <TableCell>{question?.title}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleDeleteQuestion(id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePublish}
            disabled={selectedQuestions.length === 0}
          >
            Publish Selected Questions
          </Button>
        </Box>
      </Box>

      {/* Drawer for Viewing Details */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box p={4} width={400}>
          {selectedQuestionDetails ? (
            <>
              <Typography variant="h5" gutterBottom>
                {selectedQuestionDetails.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedQuestionDetails.problem_statement}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Difficulty: {selectedQuestionDetails.level}
              </Typography>
            </>
          ) : (
            <Typography>No question details available.</Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default QuestionsLibrary;
