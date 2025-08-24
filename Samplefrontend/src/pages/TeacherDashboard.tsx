import { Box, Typography, Paper } from '@mui/material';

const TeacherDashboard = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>Teacher Dashboard</Typography>
        {/* Add more teacher info or stats here if needed */}
      </Paper>
    </Box>
  );
};

export default TeacherDashboard;
