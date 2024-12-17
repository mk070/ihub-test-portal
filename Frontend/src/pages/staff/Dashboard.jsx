
// Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import StatsCard from '../../components/staff/StatsCard';
import TestCard from '../../components/staff/TestCard';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Typography, Grid, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import mcq from '../../assets/mcq.png';
import code from '../../assets/code.png';
import api from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import Loader from '../../layout/Loader';


const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    created: 0,
    students: 0,
    liveTests: 0,
    completedTests: 0,
  });
  const [tests, setTests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats and tests dynamically
  useEffect(() => {
    // Parallel API calls for contests and student stats
    Promise.all([
      api.get('/api/contests/live?type=all'),
      api.get('/api/student-stats')
    ])
    .then(([contestResponse, studentStatsResponse]) => {
      const contests = contestResponse.data.contests || [];
      setTests(contests);

      const created = contests.length;
      const liveTests = contests.filter((contest) => contest.status === 'Live').length;
      const completedTests = contests.filter((contest) => 
        contest.status === 'Completed' || 
        (contest.testEndDate && new Date(contest.testEndDate) < new Date())
      ).length;

      // Get total students from the new API endpoint
      const totalStudents = studentStatsResponse.data.total_students || 0;

      setStats({ 
        created, 
        students: totalStudents, 
        liveTests, 
        completedTests 
      });
      setIsLoading(false)

    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      // Optional: Add error handling for the user
    });
  }, []);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-[#00296B] to-[#0077B6] mx-3 rounded-b-2xl p-6 mb-8">
        <h2 className="text-3xl text-white mb-8 font-bold">Overall Stats</h2>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard icon={<FaChartBar />} title="Test Created" value={stats.created} />
          <StatsCard icon={<FaUsers />} title="No of Students" value={stats.students} />
          <StatsCard icon={<FaClipboardList />} title="No of Live Test" value={stats.liveTests} />
          <StatsCard icon={<FaCheckCircle />} title="No of Completed Test" value={stats.completedTests} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs and Create Test Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">All</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Complete</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Live</button>
          </div>
          <button
            className="px-6 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#0077B6] transition-colors"
            onClick={handleModalOpen}
          >
            Create Test
          </button>
        </div>

        {/* Test Cards Grid */}
        {isLoading ? (
            <Loader />
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <TestCard
              key={test._id}
              contestId={test.contestId}
              title={test.assessmentName}
              type={test.type || 'General'}
              date={test.startDate ? new Date(test.startDate).toLocaleDateString() : 'N/A'}
              category={test.category || 'General'}
              stats={{
                Assigned: test.assigned || 0,
                Register: test.register || 0,
                Completed: test.complete || 0,
              }}
              status={test.status || 'Upcoming'}
              onView={() => console.log('Viewing test:', test._id)}
            />
          ))}
        </div>
        )}
      </div>

      {/* Modal for Create Test */}
      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '16px',
            position: 'relative',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" align="center" fontWeight="bold">
            Select Test Type
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '230px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#F5F5F5' },
                }}
                onClick={() => {
                  console.log('Skill Assessment selected');
                  navigate('/coding/details');
                  handleModalClose();
                }}
              >
                <img
                  src={mcq}
                  alt="Skill Assessment"
                  style={{ maxWidth: '80px', margin: '0 auto' }}
                />
                <Typography variant="h6" mt={2}>
                  Skill Assessment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Evaluations to test knowledge and skills across different topics
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 3,
                  height: '230px',
                  textAlign: 'center',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#F5F5F5' },
                }}
                onClick={() => {
                  console.log('Code Contest selected');
                  navigate('/coding/details');

                  handleModalClose();
                }}
              >
                <img
                  src={code}
                  alt="Code Contest"
                  style={{ maxWidth: '80px', margin: '0 auto' }}
                />
                <Typography variant="h6" mt={2}>
                  Code Contest
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Challenges to assess programming and problem-solving skills
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              textAlign: 'center',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            You can select a test type to proceed or close the dialog.
          </Typography>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;