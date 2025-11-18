import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', width: '100%', maxWidth: 420, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom color="text.primary">
          Welcome to EduZ Quiz System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Please log in or sign up to continue
        </Typography>
        <Button
          variant="contained"
          color="success"
          sx={{ mr: 2, minWidth: 120 }}
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
        <Button
          variant="outlined"
          color="success"
          sx={{ minWidth: 120 }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </Button>
      </Paper>
    </Box>
  );
};

export default Landing;
