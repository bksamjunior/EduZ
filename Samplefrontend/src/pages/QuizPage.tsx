import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
}

const QuizPage = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Expect params: { category, itemId, numQuestions }
  useEffect(() => {
    const params = (location.state || {}) as any;
    if (!params.category || !params.itemId || !params.numQuestions) {
      setError('Missing quiz parameters');
      setLoading(false);
      return;
    }
    async function startQuiz() {
      setLoading(true);
      try {
        const res = await api.post('/quiz/start', {
          [params.category + '_id']: params.itemId,
          num_questions: params.numQuestions,
        });
        setQuestions(res.data.questions);
        setSessionId(res.data.quiz_session_id);
      } catch (e: any) {
        setError('Failed to start quiz');
      } finally {
        setLoading(false);
      }
    }
    startQuiz();
  }, [location.state]);

  const handleAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleNext = () => {
    setCurrent((c) => c + 1);
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    try {
      await api.post('/quiz/submit', {
        quiz_session_id: sessionId,
        answers: Object.entries(answers).map(([question_id, selected_option]) => ({
          question_id: Number(question_id),
          selected_option,
        })),
      });
      navigate('/quiz/result', { state: { sessionId } });
    } catch (e) {
      setError('Failed to submit quiz');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!questions.length) return <Alert severity="info">No questions found.</Alert>;

  const q = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350, width: 500 }}>
        <Typography variant="h6" gutterBottom>Question {current + 1} of {questions.length}</Typography>
        <Typography sx={{ mb: 2 }}>{q.question_text}</Typography>
        <RadioGroup
          value={answers[q.id] || ''}
          onChange={e => handleAnswer(q.id, e.target.value)}
        >
          {q.options.map((opt, idx) => (
            <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
          ))}
        </RadioGroup>
        <Box mt={3} display="flex" justifyContent="space-between">
          {!isLast ? (
            <Button variant="contained" color="success" onClick={handleNext} disabled={!answers[q.id]}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit} disabled={!answers[q.id]}>
              Submit Quiz
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizPage;
