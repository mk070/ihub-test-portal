import React, { useState } from 'react';
import { FaChartBar, FaUsers, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import StatsCard from '../../components/staff/StatsCard';
import TestCard from '../../components/staff/TestCard';
import { Dialog, DialogTitle, DialogContent, IconButton ,DialogActions, Button, Typography, Grid, Box } from '@mui/material';
import mcq from '../../assets/mcq.png'
import code from '../../assets/code.png'
import CloseIcon from '@mui/icons-material/Close';

function Dashboard() {
  const stats = [
    { icon: <FaChartBar size={24} />, title: "Test Created", value: "17" },
    { icon: <FaUsers size={24} />, title: "No of Students", value: "140" },
    { icon: <FaClipboardList size={24} />, title: "No of Live test", value: "10" },
    { icon: <FaCheckCircle size={24} />, title: "No of test completed", value: "5" },
  ];

  const tests = [
    {
      title: "Coding Test",
      type: "SNSCE",
      date: "27 Nov 2024",
      category: "Placement",
      stats: {
        Assigned: "120",
        Register: "60",
        Completed: "20"
      },
      status: "live"
    },
    {
      title: "Aptitude Test",
      type: "SNSCT",
      date: "27 Nov 2024",
      category: "Placement",
      stats: {
        Assigned: "120",
        Register: "60",
        Completed: "20"
      },
      status: "pending"
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen   bg-gray-100">
      <div className="bg-gradient-to-r from-[#00296B] to-[#0077B6] mx-3 rounded-b-2xl p-6 mb-8">
        <h2 className="text-3xl text-white mb-8 font-bold">Overall Stats</h2>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test, index) => (
            <TestCard
              key={index}
              {...test}
              onView={() => console.log('View test:', test.title)}
            />
          ))}
        </div>
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
                height:'230px',
                border: '1px solid #E0E0E0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                '&:hover': { backgroundColor: '#F5F5F5' },
              }}
              onClick={() => {
                console.log('Skill Assessment selected');
                handleModalClose();
              }}
            >
              <img
                src={mcq} // Replace with the actual image URL
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
                height:'230px',
                textAlign: 'center',
                border: '1px solid #E0E0E0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                '&:hover': { backgroundColor: '#F5F5F5' },
              }}
              onClick={() => {
                console.log('Code Contest selected');
                handleModalClose();
              }}
            >
              <img
                src={code} // Replace with the actual image URL
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
}

export default Dashboard;
