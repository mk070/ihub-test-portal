import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Typography, Box, Paper, Switch, Grid, FormControlLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import testImage from "../../assets/instruction.png"; // Update the path to your image

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

const LeftSection = styled(Box)(({ theme }) => ({
  width: '45%',
  marginTop: theme.spacing(18),
}));

const RightSection = styled(Box)(({ theme }) => ({
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}));

const FeatureContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  width: '100%',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(2),
}));

const FlipButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
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

const startTest = async (contestid, studentId) => {
  try {
    const response = await axios.post('http://localhost:8000/api/start_test/', {
      contest_id: contestid,
      student_id: studentId,
    });
    console.log(response.data.message);
  } catch (error) {
    console.error("Error starting test:", error);
  }
};

const TestInstructions = () => {
  const navigate = useNavigate();
  const { testId } = useParams(); // Get test ID from route params

  const handleStartTest = async () => {
    const studentId = localStorage.getItem("studentId"); // Retrieve student ID
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    await startTest(testId, studentId); // Log test as started
    navigate(`/contest/${testId}`); // Navigate to the contest page
  };

  const features = [
    { name: "Face Detection", checked: false },
    { name: "Full Screen Mode", checked: true },
    { name: "Noise Detection", checked: true },
    { name: "Mobile Access Restriction", checked: true },
  ];

  const [flipped, setFlipped] = useState(Array(features.length).fill(false));

  const handleFlip = (index) => {
    setFlipped((prevFlipped) => {
      const newFlipped = [...prevFlipped];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
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
      width="100%"
    >
      <StyledPaper>
        <HeaderContainer>
          <ImageContainer>
            <img src={testImage} alt="Test Image" style={{ width: '600px', height: 'auto', position: 'absolute' }} />
          </ImageContainer>
        </HeaderContainer>
        <TextContainer>
          <Typography variant="h4" gutterBottom color="textPrimary">
            Logical Reasoning
          </Typography>
          <Typography variant="subtitle1" gutterBottom color="textSecondary">
            Placement Test I
          </Typography> 
          <Typography variant="body1" paragraph color="textSecondary">
            Registration Start Date: 23 AUG 2023 Time: 7 PM
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Registration End Date: 23 AUG 2023 Time: 7 PM
          </Typography>
        </TextContainer>

        <SectionContainer>
          <LeftSection>
            <Typography variant="body2" paragraph color="textSecondary">
              Duration of the Test
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Number of Questions
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Negative Marking Rules
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Passing Criteria
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Number of Sections
            </Typography>
          </LeftSection>
          <RightSection>
  <FeatureContainer>
    <Grid container spacing={2}>
      {features.map((feature, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding={1.5}
            borderRadius="26px"
            boxShadow="0px 2px 4px rgba(0, 0, 0, 0.1)"
          >
            <Typography variant="body1">{feature.name}</Typography>
            <Switch checked={feature.checked} />
          </Box>
        </Grid>
      ))}
    </Grid>
  </FeatureContainer>
</RightSection>

        </SectionContainer>

        <Box mt={4} width="100%">
          <Typography variant="h5" gutterBottom align="left" color="textPrimary">
            All that you need to know about Assessment
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Number of Questions: The quiz consists of 30 questions carrying 1 mark each.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Duration: Participants have a total of 45 minutes to complete the quiz.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Device: Use a device with a stable internet connection that is comfortable for you to work on.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Submission: After completing each question, participants should click the "Submit" button.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Collaboration: Participants are not allowed to collaborate with other participants during the quiz.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Fair Play: Any participant caught engaging in unfair practices, including plagiarism or using unauthorized resources during the quiz, will be disqualified.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Disqualification: Participants must adhere to the rules, and any violation may result in disqualification from the quiz.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Instructions: Read and follow all instructions carefully. If you have any questions or need clarification, contact the department.
          </Typography>
          <Typography variant="body1" paragraph color="textSecondary">
            Identification: Participants may be required to provide identification before or during the quiz. Ensure you have a valid ID ready if needed.
          </Typography>
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