import { AppBar, Toolbar, Typography, Button} from '@mui/material';
import { useUserStore } from '../store/user';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const { role, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" color="default" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>EduZ</Typography>
        {role === 'student' && (
          <>
            <Button color="inherit" onClick={() => navigate('/dashboard/student')}>Dashboard</Button>
            <Button color="inherit" onClick={() => navigate('/quizprep')}>Take a Quiz</Button>
          </>
        )}
        {role === 'teacher' && (
          <>
            <Button color="inherit" onClick={() => navigate('/dashboard/teacher')}>Dashboard</Button>
            <Button color="inherit" onClick={() => navigate('/quizprep')}>Take a Quiz</Button>
            <Button color="inherit" onClick={() => navigate('/questions/add')}>Add Question</Button>
          </>
        )}
        {role === 'admin' && (
          <>
            <Button color="inherit" onClick={() => navigate('/dashboard/admin')}>Dashboard</Button>
            <Button color="inherit" onClick={() => navigate('/questions/add')}>Add Question</Button>
            <Button color="inherit" onClick={() => navigate('/admin/promote')}>Promote Users</Button>
          </>
        )}
        {role && (
          <Button 
            color="error" 
            variant="contained" 
            sx={{ fontWeight: 700, boxShadow: 'none' }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
