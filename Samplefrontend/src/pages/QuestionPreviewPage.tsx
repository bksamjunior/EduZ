import { Box, Typography, Paper, Button, List, ListItem, ListItemText } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

interface QuestionPreview {
  question_text: string;
  options: { value: string }[] | null;
  correct_option: string;
  topic_id: string;
  branch_id?: string;
  systems?: string;
  level?: string;
  difficulty: number;
}

const QuestionPreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions: QuestionPreview[] = (location.state as any)?.questions || [];

  if (!questions.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
        <Paper elevation={3} sx={{ p: 6 }}>
          <Typography variant="h6" color="error">
            No questions to preview. Please go back and add a question.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/add-question')} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  const handleConfirm = () => {
    // Clear draft when confirmed
    sessionStorage.removeItem('add_questions_draft');
    navigate(-1);
  };

  const handleBack = () => {
    try {
      // Save draft before going back
      sessionStorage.setItem('add_questions_draft', JSON.stringify(questions));
    } catch {}
    navigate(-1);{/* state: { questions } */}
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 400, width: 600 }}>
        <Typography variant="h5" gutterBottom>Preview Questions</Typography>
        <List>
          {questions.map((q, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={`${idx + 1}. ${q.question_text || 'No question text'}`}
                secondary={
                  <>
                    Options: {q.options?.map(o => o.value).join(', ') || 'No options provided'} <br />
                    Correct Option: {q.correct_option || 'Not specified'} <br />
                    Level: {q.level || 'Not specified'} <br />
                    Difficulty: {q.difficulty ? ['Easy', 'Slightly Hard', 'Medium', 'Hard', 'Very Hard'][q.difficulty - 1] : 'Not specified'}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleBack}>Back</Button>
          <Button variant="contained" color="success" onClick={handleConfirm}>Confirm</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionPreviewPage;
