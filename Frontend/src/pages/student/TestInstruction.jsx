import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import testImage from "../../assets/instruction.png";
import ProblemDetails from "../../components/staff/coding/ProblemDetails";  // Import ProblemDetails component

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  width: "100%",
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[10],
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  maxWidth: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: theme.spacing(4),
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(4),
}));

const TextContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  paddingLeft: '40%',
  width: '100%',
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(9),
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2), 
  right: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontSize: "1rem",
  fontWeight: "bold",
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const startTest = async (concontestId, studentId) => {
  try {
    const response = await axios.post('http://localhost:8000/api/start_test/', {
      contest_id: concontestId,
      student_id: studentId,
    });
    console.log("Fetched from API:", response.data.message);
  } catch (error) {
    console.error("Error starting test:", error);
  }
};

const TestInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { test } = location.state || {}; // Retrieve test data from state
  const { contestId } = useParams(); // Retrieve contestId from route params

  useEffect(() => {
    console.log("Test data received in TestInstructions:", test);
  }, [test]);


  const handleStartTest = async () => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

  
    try {
      await startTest(contestId, studentId);
      // Pass contest_id and student_id dynamically via 'state'
      navigate(`/contest/${contestId}`, { 
        state: { contest_id: contestId, student_id: studentId }
      });
    } catch (error) {
      console.error("Error starting test:", error);
    }

  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="10vh"
      padding={2}
      bgcolor="background.paper"
      width="75%"
      margin="auto"
    >
      <StyledPaper>
        <HeaderContainer>
          <ImageContainer>
            <img src={testImage} alt="Test Image" style={{ width: '600px', height: 'auto', position: 'absolute' }} />
          </ImageContainer>
        </HeaderContainer>
        <TextContainer mt={10}>
          <Typography variant="h4" gutterBottom color="textPrimary">
            {test?.name || "Test Name"}
          </Typography>
          <Typography variant="subtitle1" gutterBottom color="textSecondary">
            {/* {test?.assessmentOverview?.description || "Test Description"} */}
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Registration Start Date: {test?.starttime ? formatDate(test.starttime) : "N/A"}
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Registration End Date: {test?.endtime ? formatDate(test.endtime) : "N/A"}
          </Typography>
        </TextContainer>

        <SectionContainer>
          {/* Additional sections */}
        </SectionContainer>

        <Box mt={20} width="100%">
          <Typography variant="h5" gutterBottom align="left" color="textPrimary">
            All that you need to know about Assessment
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            {test?.description || "N/A"}
          </Typography>

          {/* Pass the problems to the ProblemDetails component */}
          {test?.problems && (
            <ProblemDetails selectedProblemId={test.problems[0]?.id} problems={test.problems} />
          )}

          <StyledButton onClick={handleStartTest}>
            Start Test
          </StyledButton>
        </Box>

        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            By clicking on "Start Test", you agree to our terms and conditions.
          </Typography>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default TestInstructions;
