import { Box, Typography, Paper, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

interface QuizResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  started_at: string;
  ended_at: string;
}

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = (location.state as any)?.sessionId;
    if (!sessionId) {
      setError('No quiz session found.');
      setLoading(false);
      return;
    }
    async function fetchResult() {
      setLoading(true);
      try {
        const res = await api.get(`/quiz/result/${sessionId}`);
        setResult(res.data.quiz_session);
      } catch (e) {
        setError('Failed to fetch quiz result.');
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [location.state]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><Typography>Loading...</Typography></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!result) return <Alert severity="info">No result found.</Alert>;

  const goodScore = result.score > 70;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350, width: 500, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Quiz completed!</Typography>
        <Typography variant="h6" sx={{ color: goodScore ? 'success.main' : 'error.main', mb: 2 }}>
          Your score is {result.score}%
        </Typography>
        <Typography sx={{ mb: 1 }}>
          Correct Answers: {result.correct_answers} / {result.total_questions}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          Started at: {new Date(result.started_at).toLocaleString()}
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Ended at: {new Date(result.ended_at).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {goodScore ? 'Great job!' : 'Keep practicing!'}
        </Typography>
        <Box mt={3}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/student')}>
            Back to Dashboard
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizResultPage;
