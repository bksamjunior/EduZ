
import { Box, Typography, Paper } from '@mui/material';

const StudentDashboard = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>Student Dashboard</Typography>
        {/* Add more student info or stats here if needed */}
      </Paper>
    </Box>
  );
};

export default StudentDashboard;
