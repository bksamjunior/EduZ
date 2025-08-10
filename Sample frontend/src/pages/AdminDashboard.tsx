import { Box, Typography, Paper } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
        {/* Add navigation/sidebar and admin actions here */}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
