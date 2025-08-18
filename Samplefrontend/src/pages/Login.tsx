import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useUserStore } from '../store/user';
import { useNotify } from '../hooks/useNotify';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const setToken = useUserStore((s) => s.setToken);
  const setRole = useUserStore((s) => s.setRole);
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    setLoading(true);
    try {
  // Send as form data: username=email, password
  const form = new FormData();
  form.append('username', data.email);
  form.append('password', data.password);
  const res = await api.post('/users/login', form);
  setToken(res.data.access_token);
  // Fetch user info and set role
  const userRes = await api.get('/users/me');
  setRole(userRes.data.role);
  // Redirect based on role
  if (userRes.data.role === 'student') navigate('/dashboard/student');
  else if (userRes.data.role === 'teacher') navigate('/dashboard/teacher');
  else if (userRes.data.role === 'admin') navigate('/dashboard/admin');
  notify('Login successful!', { variant: 'success' });
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Login failed');
      notify(err.response?.data?.detail || 'Login failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>Log In</Typography>
        <form onSubmit={handleSubmit(onSubmit)} aria-label="login form">
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            autoComplete="username"
            {...register('email', { required: 'Email is required' })}
            error={!!errors.email}
            helperText={errors.email?.message}
            inputProps={{ 'aria-label': 'email' }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
            inputProps={{ 'aria-label': 'password' }}
          />
          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 3 }} disabled={loading} aria-busy={loading} aria-label="log in">
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
          <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/signup')}>
            Don't have an account? Sign Up
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
