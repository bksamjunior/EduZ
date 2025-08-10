import { Box, Typography, Paper, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../api';
import { useNotify } from '../hooks/useNotify';

interface SubjectForm { name: string; level: string; }
interface BranchForm { name: string; subject_id: string; }
interface TopicForm { name: string; level: string; subject_id: string; branch_id?: string; }

const ManageEntitiesPage = () => {
  const notify = useNotify();
  // Subjects
  const [subjects, setSubjects] = useState<any[]>([]);
  // const [loadingSubjects, setLoadingSubjects] = useState(false);
  // Branches
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchLevel, setSelectedBranchLevel] = useState('');
  const [selectedBranchSubject, setSelectedBranchSubject] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [showNewLevel, setShowNewLevel] = useState(false);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [showNewBranch, setShowNewBranch] = useState(false);
  // const [loadingBranches, setLoadingBranches] = useState(false);
  // Topics
  const [selectedLevel, setSelectedLevel] = useState('');

  // Forms
  const { register: regSubject, handleSubmit: handleSubject, reset: resetSubject } = useForm<SubjectForm>();
  const { register: regBranch, handleSubmit: handleBranch, reset: resetBranch } = useForm<BranchForm>();
  const { register: regTopic, handleSubmit: handleTopic, reset: resetTopic, setValue: setTopicValue, watch: watchTopic } = useForm<TopicForm>();

  // Fetch all entities
  useEffect(() => {
  api.get('/questions/subjects').then(res => setSubjects(res.data));
  api.get('/questions/branches').then(res => setBranches(res.data));
  api.get('/questions/topics');
  }, []);

  // Add Subject
  const onAddSubject = async (data: SubjectForm) => {
    try {
      await api.post('/subjects/', data);
      notify('Subject added!', { variant: 'success' });
      resetSubject();
      const res = await api.get('/subjects/');
      setSubjects(res.data);
    } catch (e: any) {
      notify(e.response?.data?.detail || 'Failed to add subject', { variant: 'error' });
    }
  };
  // Add Branch
  const onAddBranch = async (data: BranchForm) => {
    try {
      await api.post('/questions/branches', { ...data, subject_id: Number(data.subject_id) });
      notify('Branch added!', { variant: 'success' });
      resetBranch();
      const res = await api.get('/questions/branches');
      setBranches(res.data);
    } catch (e: any) {
      notify(e.response?.data?.detail || 'Failed to add branch', { variant: 'error' });
    }
  };
  // Add Topic
  const onAddTopic = async (data: TopicForm) => {
    try {
      await api.post('/questions/topics', {
        name: data.name,
        subject_id: Number(data.subject_id),
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        level: data.level
      });
      notify('Topic added!', { variant: 'success' });
      resetTopic();
      setSelectedLevel('');
      // Optionally refetch topics here
    } catch (e: any) {
      notify(e.response?.data?.detail || 'Failed to add topic', { variant: 'error' });
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
      <Paper sx={{ p: 4, mb: 2, width: 400 }}>
        <Typography variant="h6">Add Subject</Typography>
        <form onSubmit={handleSubject(onAddSubject)}>
          <TextField label="Name" fullWidth margin="normal" {...regSubject('name', { required: true })} />
          <TextField label="Level" fullWidth margin="normal" {...regSubject('level', { required: true })} />
          <Button type="submit" variant="contained" color="success" fullWidth>Add Subject</Button>
        </form>
      </Paper>
      <Paper sx={{ p: 4, mb: 2, width: 400 }}>
        <Typography variant="h6">Add Branch</Typography>
        <form onSubmit={handleBranch(onAddBranch)}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Level</InputLabel>
            <Select
              label="Level"
              value={selectedBranchLevel}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewLevel(true);
                  setSelectedBranchLevel('');
                } else {
                  setSelectedBranchLevel(e.target.value);
                  setShowNewLevel(false);
                  setSelectedBranchSubject('');
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
          {showNewLevel && (
            <TextField
              label="New Level"
              fullWidth
              margin="normal"
              value={newLevel}
              onChange={e => setNewLevel(e.target.value)}
              onBlur={() => {
                if (newLevel) {
                  setSelectedBranchLevel(newLevel);
                  setShowNewLevel(false);
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              label="Subject"
              value={selectedBranchSubject}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewSubject(true);
                  setSelectedBranchSubject('');
                } else {
                  setSelectedBranchSubject(e.target.value);
                  setShowNewSubject(false);
                }
              }}
              disabled={!selectedBranchLevel}
              defaultValue=""
            >
              <MenuItem value="" disabled>Select Subject</MenuItem>
              {subjects.filter((s: any) => s.level === selectedBranchLevel).map((s: any) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
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
              onBlur={() => {
                if (newSubject) {
                  // Add new subject to backend and update subjects list
                  api.post('/subjects/', { name: newSubject, level: selectedBranchLevel }).then(res => {
                    setSubjects(prev => [...prev, res.data]);
                    setSelectedBranchSubject(res.data.id);
                    setShowNewSubject(false);
                    setNewSubject('');
                  });
                }
              }}
            />
          )}
          <TextField label="Name" fullWidth margin="normal" {...regBranch('name', { required: true })} />
          <Button type="submit" variant="contained" color="success" fullWidth>Add Branch</Button>
        </form>
      </Paper>
      <Paper sx={{ p: 4, mb: 2, width: 400 }}>
        <Typography variant="h6">Add Topic</Typography>
        <form onSubmit={handleTopic(onAddTopic)}>
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
                  setTopicValue('level', e.target.value);
                  setTopicValue('subject_id', '');
                  setTopicValue('branch_id', '');
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
                  setTopicValue('level', newLevel);
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              label="Subject"
              value={watchTopic('subject_id') || ''}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewSubject(true);
                  setTopicValue('subject_id', '');
                } else {
                  setTopicValue('subject_id', e.target.value);
                  setShowNewSubject(false);
                }
              }}
              disabled={!selectedLevel}
              defaultValue=""
            >
              <MenuItem value="" disabled>Select Subject</MenuItem>
              {subjects.filter((s: any) => s.level === selectedLevel).map((s: any) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
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
              onBlur={() => {
                if (newSubject) {
                  api.post('/subjects/', { name: newSubject, level: selectedLevel }).then(res => {
                    setSubjects(prev => [...prev, res.data]);
                    setTopicValue('subject_id', res.data.id);
                    setShowNewSubject(false);
                    setNewSubject('');
                  });
                }
              }}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Branch (optional)</InputLabel>
            <Select
              label="Branch (optional)"
              value={watchTopic('branch_id') || ''}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowNewBranch(true);
                  setTopicValue('branch_id', '');
                } else {
                  setTopicValue('branch_id', e.target.value);
                  setShowNewBranch(false);
                }
              }}
              defaultValue=""
              disabled={!watchTopic('subject_id')}
            >
              <MenuItem value="">None</MenuItem>
              {branches
                .filter((b: any) => {
                  const subj = subjects.find((s: any) => s.id === Number(watchTopic('subject_id')));
                  return subj && b.subject_id === subj.id;
                })
                .map((b: any) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
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
              onBlur={() => {
                if (newBranch) {
                  api.post('/questions/branches', { name: newBranch, subject_id: Number(watchTopic('subject_id')) }).then(res => {
                    setBranches(prev => [...prev, res.data]);
                    setTopicValue('branch_id', res.data.id);
                    setShowNewBranch(false);
                    setNewBranch('');
                  });
                }
              }}
            />
          )}
          <TextField label="Name" fullWidth margin="normal" {...regTopic('name', { required: true })} />
          <Button type="submit" variant="contained" color="success" fullWidth>Add Topic</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ManageEntitiesPage;
