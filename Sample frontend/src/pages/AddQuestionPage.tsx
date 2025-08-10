import { Box, Typography, Paper, TextField, Button, MenuItem, Select, FormControl, InputLabel, Alert, IconButton } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../api';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface QuestionForm {
  question_text: string;
  options: { value: string }[];
  correct_option: string;
  topic_id: string;
  branch_id?: string;
  systems?: string;
}

const AddQuestionPage = () => {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<QuestionForm & { subject_id?: string }>({
    defaultValues: {
      options: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [showNewLevel, setShowNewLevel] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newBranch, setNewBranch] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [showNewSystem, setShowNewSystem] = useState(false);
  const [newSystem, setNewSystem] = useState('');

  const [systems, setSystems] = useState<string[]>([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, branchesRes, topicsRes, systemsRes] = await Promise.all([
          api.get('/questions/subjects'),
          api.get('/questions/branches'),
          api.get('/questions/topics'),
          api.get('/questions/systems'),
        ]);
        setSubjects(subjectsRes.data);
        setBranches(branchesRes.data);
        setTopics(topicsRes.data);
        setSystems(systemsRes.data);
      } catch (e) {
        setApiError('Failed to load subjects/branches/topics/systems');
      }
    }
    fetchData();
  }, []);

  const onSubmit = async (data: QuestionForm) => {
    setApiError('');
    setSuccess(false);
    try {
      await api.post('/questions/', {
        question_text: data.question_text,
        options: data.options.map(o => o.value),
        correct_option: data.correct_option,
        topic_id: data.topic_id,
        branch_id: data.branch_id || undefined,
        systems: selectedSystem || data.systems || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Failed to add question');
    }
  };

  const options = watch('options');

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 400, width: 600 }}>
        <Typography variant="h5" gutterBottom>Add a Question</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Question Text"
            fullWidth
            margin="normal"
            {...register('question_text', { required: 'Question text is required' })}
            error={!!errors.question_text}
            helperText={errors.question_text?.message}
          />
          <Typography sx={{ mt: 2, mb: 1 }}>Options</Typography>
          {fields.map((field, idx) => (
            <Box key={field.id} display="flex" alignItems="center" mb={1}>
              <TextField
                label={`Option ${idx + 1}`}
                fullWidth
                {...register(`options.${idx}.value` as const, { required: 'Option is required' })}
                error={!!errors.options?.[idx]?.value}
                helperText={errors.options?.[idx]?.value?.message}
              />
              {fields.length > 4 && (
                <IconButton onClick={() => remove(idx)} color="error" aria-label="Remove option">
                  <RemoveIcon />
                </IconButton>
              )}
              {idx === fields.length - 1 && fields.length < 8 && (
                <IconButton onClick={() => append({ value: '' })} color="primary" aria-label="Add option">
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <FormControl fullWidth margin="normal">
            <InputLabel>Correct Option</InputLabel>
            <Select
              label="Correct Option"
              {...register('correct_option', { required: 'Select the correct option' })}
              value={watch('correct_option') || ''}
              onChange={e => setValue('correct_option', e.target.value)}
              error={!!errors.correct_option}
            >
              {options.map((opt, idx) => (
                <MenuItem key={idx} value={opt.value}>{opt.value || `Option ${idx + 1}`}</MenuItem>
              ))}
            </Select>
            {errors.correct_option && <Typography color="error" variant="caption">{errors.correct_option.message}</Typography>}
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Level</InputLabel>
            <Select
              label="Level"
              value={selectedLevel}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewLevel(true);
                  setSelectedLevel('');
                } else {
                  setSelectedLevel(e.target.value);
                  setShowNewLevel(false);
                  setValue('subject_id', '');
                  setValue('topic_id', '');
                  setValue('branch_id', '');
                }
              }}
              required
            >
              <MenuItem value="" disabled>Select Level</MenuItem>
              {[...new Set(subjects.map((s: any) => s.level))].map((level: string) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
              <MenuItem value="__add_new__">+ Add new level</MenuItem>
            </Select>
          </FormControl>
          {/* Show available levels */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Available Levels: {Array.from(new Set(subjects.map((s: any) => s.level))).join(', ') || 'None'}</Typography>
          </Box>
          {showNewLevel && (
            <TextField
              label="New Level"
              fullWidth
              margin="normal"
              value={newLevel}
              onChange={e => setNewLevel(e.target.value)}
              onBlur={() => {
                if (newLevel) {
                  setSelectedLevel(newLevel);
                  setShowNewLevel(false);
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              label="Subject"
              value={watch('subject_id') || ''}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewSubject(true);
                  setValue('subject_id', '');
                } else {
                  setValue('subject_id', e.target.value);
                  setShowNewSubject(false);
                }
              }}
              disabled={!selectedLevel}
            >
              <MenuItem value="" disabled>Select Subject</MenuItem>
              {subjects.filter((subject: any) => subject.level === selectedLevel).map((subject: any) => (
                <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
              ))}
              <MenuItem value="__add_new__">+ Add new subject</MenuItem>
            </Select>
          </FormControl>
          {showNewSubject && (
            <TextField
              label="New Subject"
              fullWidth
              margin="normal"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onBlur={async () => {
                if (newSubject) {
                  // Check if subject exists (case-insensitive, same level)
                  const existing = subjects.find(s => s.name.trim().toLowerCase() === newSubject.trim().toLowerCase() && s.level === selectedLevel);
                  if (existing) {
                    setValue('subject_id', existing.id);
                  } else {
                    const res = await api.post('/questions/subjects', { name: newSubject, level: selectedLevel });
                    setSubjects((prev) => [...prev, res.data]);
                    setValue('subject_id', res.data.id);
                  }
                  setShowNewSubject(false);
                  setNewSubject('');
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Topic</InputLabel>
            <Select
              label="Topic"
              value={watch('topic_id') || ''}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewTopic(true);
                  setValue('topic_id', '');
                } else {
                  setValue('topic_id', e.target.value);
                  setShowNewTopic(false);
                }
              }}
              error={!!errors.topic_id}
              disabled={!selectedLevel || !watch('subject_id')}
            >
              {topics.filter((topic: any) => topic.subject_id === Number(watch('subject_id'))).map((topic: any) => (
                <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>
              ))}
              <MenuItem value="__add_new__">+ Add new topic</MenuItem>
            </Select>
            {errors.topic_id && <Typography color="error" variant="caption">{errors.topic_id.message}</Typography>}
          </FormControl>
          {showNewTopic && (
            <TextField
              label="New Topic"
              fullWidth
              margin="normal"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onBlur={async () => {
                if (newTopic) {
                  // Check if topic exists (case-insensitive, same subject)
                  const existing = topics.find(t => t.name.trim().toLowerCase() === newTopic.trim().toLowerCase() && t.subject_id === Number(watch('subject_id')));
                  if (existing) {
                    setValue('topic_id', existing.id);
                  } else {
                    const res = await api.post('/questions/topics', { name: newTopic, subject_id: Number(watch('subject_id')), level: selectedLevel });
                    setTopics((prev) => [...prev, res.data]);
                    setValue('topic_id', res.data.id);
                  }
                  setShowNewTopic(false);
                  setNewTopic('');
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Branch (optional)</InputLabel>
            <Select
              label="Branch (optional)"
              value={watch('branch_id') || ''}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewBranch(true);
                  setValue('branch_id', '');
                } else {
                  setValue('branch_id', e.target.value);
                  setShowNewBranch(false);
                }
              }}
              disabled={!selectedLevel || !watch('subject_id')}
            >
              <MenuItem value="">None</MenuItem>
              {branches.filter((branch: any) => branch.subject_id === Number(watch('subject_id'))).map((branch: any) => (
                <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
              ))}
              <MenuItem value="__add_new__">+ Add new branch</MenuItem>
            </Select>
          </FormControl>
          {showNewBranch && (
            <TextField
              label="New Branch"
              fullWidth
              margin="normal"
              value={newBranch}
              onChange={e => setNewBranch(e.target.value)}
              onBlur={async () => {
                if (newBranch) {
                  // Check if branch exists (case-insensitive, same subject)
                  const existing = branches.find(b => b.name.trim().toLowerCase() === newBranch.trim().toLowerCase() && b.subject_id === Number(watch('subject_id')));
                  if (existing) {
                    setValue('branch_id', existing.id);
                  } else {
                    const res = await api.post('/questions/branches', { name: newBranch, subject_id: Number(watch('subject_id')) });
                    setBranches((prev) => [...prev, res.data]);
                    setValue('branch_id', res.data.id);
                  }
                  setShowNewBranch(false);
                  setNewBranch('');
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="systems-label">Systems (optional)</InputLabel>
            <Select
              labelId="systems-label"
              label="Systems (optional)"
              value={selectedSystem}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewSystem(true);
                  setSelectedSystem('');
                } else {
                  setSelectedSystem(e.target.value);
                  setShowNewSystem(false);
                }
              }}
              renderValue={selected => {
                if (!selected) {
                  return <span style={{ color: '#888' }}>Systems (optional)</span>;
                }
                return selected;
              }}
              displayEmpty
            >
              <MenuItem value="">None</MenuItem>
              {systems.map((system: string) => (
                <MenuItem key={system} value={system}>{system}</MenuItem>
              ))}
              <MenuItem value="__add_new__">+ Add new system</MenuItem>
            </Select>
          </FormControl>
          {showNewSystem && (
            <TextField
              label="New System"
              fullWidth
              margin="normal"
              value={newSystem}
              onChange={e => setNewSystem(e.target.value)}
              onBlur={() => {
                if (newSystem) {
                  setSelectedSystem(newSystem);
                  setShowNewSystem(false);
                  setNewSystem('');
                }
              }}
            />
          )}
          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Question added successfully!</Alert>}
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 3 }}>
            Add Question
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AddQuestionPage;
