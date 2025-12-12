import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import api from '../api';
import PageContainer from '../components/PageContainer';

interface QuestionSummary {
  question_id: number;
  question_text: string;
  difficulty: string;
  approved: boolean;
  usage_count: number;
  created_at: string;
}

interface TeacherDashboardStats {
  user_id: number;
  total_questions: number;
  approved_count: number;
  pending_count: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  average_difficulty: number;
  total_student_usage: number;
  questions: QuestionSummary[];
}

const TeacherDashboard = () => {
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/questions/teacher/dashboard');
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
        <Alert severity="info">No questions created yet</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Teacher Dashboard
        </Typography>

        {/* Stats Cards */}
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
                <Typography variant="h5">{stats.approved_count}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Review
                </Typography>
                <Typography variant="h5">{stats.pending_count}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Student Usage
                </Typography>
                <Typography variant="h5">{stats.total_student_usage}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Difficulty Distribution */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question Difficulty Distribution
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography color="textSecondary">Easy</Typography>
                <Typography variant="h6">{stats.easy_count}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography color="textSecondary">Medium</Typography>
                <Typography variant="h6">{stats.medium_count}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography color="textSecondary">Hard</Typography>
                <Typography variant="h6">{stats.hard_count}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Questions Created Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Questions Created
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Question ID</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>Question Text</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Student Usage</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.questions.map((q) => (
                  <TableRow key={q.question_id}>
                    <TableCell>{q.question_id}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.question_text.substring(0, 50)}...
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor:
                            q.difficulty === 'easy'
                              ? 'success.light'
                              : q.difficulty === 'medium'
                              ? 'warning.light'
                              : 'error.light',
                          borderRadius: 0.5,
                          display: 'inline-block',
                        }}
                      >
                        {q.difficulty}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: q.approved ? 'success.light' : 'warning.light',
                          borderRadius: 0.5,
                          display: 'inline-block',
                        }}
                      >
                        {q.approved ? 'Approved' : 'Pending'}
                      </Typography>
                    </TableCell>
                    <TableCell>{q.usage_count}</TableCell>
                    <TableCell>{new Date(q.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default TeacherDashboard;
