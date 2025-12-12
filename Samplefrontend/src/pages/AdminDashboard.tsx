import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import api from '../api';
import PageContainer from '../components/PageContainer';

interface AdminDashboardStats {
  total_users: number;
  student_count: number;
  teacher_count: number;
  admin_count: number;
  total_questions: number;
  approved_questions: number;
  pending_questions: number;
  easy_questions: number;
  medium_questions: number;
  hard_questions: number;
  total_quiz_sessions: number;
  completed_sessions: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/admin/dashboard');
        setStats(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <Alert severity="info">No system data available</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>

        {/* Users Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          User Statistics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h5">{stats.total_users}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Students
                </Typography>
                <Typography variant="h5">{stats.student_count}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Teachers
                </Typography>
                <Typography variant="h5">{stats.teacher_count}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Admins
                </Typography>
                <Typography variant="h5">{stats.admin_count}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Questions Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Question Statistics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Questions
                </Typography>
                <Typography variant="h5">{stats.total_questions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h5">{stats.approved_questions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h5">{stats.pending_questions}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Question Difficulty Distribution */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question Difficulty Distribution
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography color="textSecondary">Easy</Typography>
                <Typography variant="h6">{stats.easy_questions}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography color="textSecondary">Medium</Typography>
                <Typography variant="h6">{stats.medium_questions}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography color="textSecondary">Hard</Typography>
                <Typography variant="h6">{stats.hard_questions}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Quiz Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Quiz Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Quiz Sessions
                </Typography>
                <Typography variant="h5">{stats.total_quiz_sessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Sessions
                </Typography>
                <Typography variant="h5">{stats.completed_sessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default AdminDashboard;
