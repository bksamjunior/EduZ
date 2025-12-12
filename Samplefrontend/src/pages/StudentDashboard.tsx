import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import api from '../api';
import PageContainer from '../components/PageContainer';

interface QuizHistoryItem {
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  difficulty: string;
  completed_at: string;
}

interface StudentDashboardStats {
  user_id: number;
  total_quizzes: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_attempts: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  quiz_history: QuizHistoryItem[];
}

const StudentDashboard = () => {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quiz/student/dashboard');
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
        <Alert severity="info">No quiz data available yet</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Student Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Quizzes
                </Typography>
                <Typography variant="h5">{stats.total_quizzes}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Score
                </Typography>
                <Typography variant="h5">{stats.average_score.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Highest Score
                </Typography>
                <Typography variant="h5">{stats.highest_score.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Lowest Score
                </Typography>
                <Typography variant="h5">{stats.lowest_score.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Difficulty Distribution */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Difficulty Distribution
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

        {/* Quiz History Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quiz History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Quiz ID</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Correct Answers</TableCell>
                  <TableCell>Total Questions</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.quiz_history.map((quiz) => (
                  <TableRow key={quiz.quiz_id}>
                    <TableCell>{quiz.quiz_id}</TableCell>
                    <TableCell>{quiz.score.toFixed(2)}</TableCell>
                    <TableCell>{quiz.correct_answers}</TableCell>
                    <TableCell>{quiz.total_questions}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor:
                            quiz.difficulty === 'easy'
                              ? 'success.light'
                              : quiz.difficulty === 'medium'
                              ? 'warning.light'
                              : 'error.light',
                          borderRadius: 0.5,
                          display: 'inline-block',
                        }}
                      >
                        {quiz.difficulty}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(quiz.completed_at).toLocaleDateString()}</TableCell>
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

export default StudentDashboard;
