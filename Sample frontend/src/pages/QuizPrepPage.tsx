import { Box, Typography, Paper, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const QuizPrepPage = () => {
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [category, setCategory] = useState('');
  const [itemId, setItemId] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLevels() {
      setLoading(true);
      try {
        const res = await api.get('/questions/subjects');
        const uniqueLevels = Array.from(new Set(res.data.map((s: any) => s.level)));
        setLevels(uniqueLevels as string[]);
      } catch (e) {
        setError('Failed to load levels');
      } finally {
        setLoading(false);
      }
    }
    fetchLevels();
  }, []);

  useEffect(() => {
    if (!level) {
      setSubjects([]);
      setTopics([]);
      setBranches([]);
      return;
    }
    async function fetchData() {
      setLoading(true);
      try {
        const [subjectsRes, topicsRes, branchesRes] = await Promise.all([
          api.get(`/questions/subjects/by_level/${level}`),
          api.get(`/questions/topics/by_level/${level}`),
          api.get(`/questions/branches/by_level/${level}`),
        ]);
        setSubjects(subjectsRes.data);
        setTopics(topicsRes.data);
        setBranches(branchesRes.data);
      } catch (e: any) {
        setError('Failed to load quiz categories');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [level]);

  const handleLevelChange = (e: any) => {
    setLevel(e.target.value);
    setCategory('');
    setItemId('');
  };

  const handleCategoryChange = (e: any) => {
    setCategory(e.target.value);
    setItemId('');
  };

  const handleStartQuiz = () => {
    if (!level || !category || !itemId || !numQuestions) return;
    navigate('/quiz', {
      state: {
        level,
        category,
        itemId,
        numQuestions,
      },
    });
  };

  let items: { id: string; name: string }[] = [];
  if (category === 'subject') items = subjects as { id: string; name: string }[];
  if (category === 'topic') items = topics as { id: string; name: string }[];
  if (category === 'branch') items = branches as { id: string; name: string }[];

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>Quiz Preparation</Typography>
        {loading ? <CircularProgress /> : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Level</InputLabel>
              <Select value={level} label="Select Level" onChange={handleLevelChange}>
                {levels.map(lvl => (
                  <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {level && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Category</InputLabel>
                <Select value={category} label="Select Category" onChange={handleCategoryChange}>
                  <MenuItem value="subject">Subject</MenuItem>
                  <MenuItem value="topic">Topic</MenuItem>
                  <MenuItem value="branch">Branch</MenuItem>
                </Select>
              </FormControl>
            )}
            {level && category && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select {category.charAt(0).toUpperCase() + category.slice(1)}</InputLabel>
                <Select value={itemId} label={`Select ${category}`} onChange={e => setItemId(e.target.value)}>
                  {items.map((item: any) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink>Number of Questions</InputLabel>
              <Select
                value={numQuestions}
                label="Number of Questions"
                onChange={e => setNumQuestions(Number(e.target.value))}
                displayEmpty
                renderValue={selected => selected ? selected : 'Number of Questions'}
              >
                {[3, 5, 10, 15].map(n => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
                <MenuItem value={-1}>
                  <em>Custom...</em>
                </MenuItem>
              </Select>
              {numQuestions === -1 && (
                <input
                  type="number"
                  min={1}
                  style={{ marginTop: 8, width: '100%', padding: 8, fontSize: 16 }}
                  placeholder="Enter number of questions"
                  onChange={e => setNumQuestions(Number(e.target.value))}
                />
              )}
            </FormControl>
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} disabled={!itemId} onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default QuizPrepPage;
