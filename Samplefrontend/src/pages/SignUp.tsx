import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

const passwordNote =
  'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.';

const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: SignUpForm) => {
    setApiError('');
    setSuccess(false);
    try {
  await api.post('/users/register', { ...data, role: 'student' });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>Sign Up</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            {...register('email', { required: 'Email is required' })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
                message: 'Password does not meet complexity requirements',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message || passwordNote}
          />
          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Registration successful! Redirecting...</Alert>}
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 3 }}>
            Sign Up
          </Button>
          <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/login')}>
            Already have an account? Log In
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SignUp;
