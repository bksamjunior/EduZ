import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, Button, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api';

const validPromotions: Record<string, string[]> = {
  student: ['teacher'],
  teacher: ['admin'],
};

const PromoteUserPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoting, setPromoting] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (e) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handlePromote = async (userId: string, newRole: string) => {
    setPromoting(userId);
    setSuccess('');
    setError('');
    try {
      await api.post(`/users/${userId}/promote`, { new_role: newRole });
      setSuccess('User promoted successfully!');
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Promotion failed');
    } finally {
      setPromoting(null);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 600 }}>
        <Typography variant="h5" gutterBottom>Promote Users</Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Current Role</TableCell>
                <TableCell>Promote To</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => {
                const promotions = validPromotions[user.role] || [];
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={user.promotionTarget || ''}
                        onChange={e => setUsers(users => users.map(u => u.id === user.id ? { ...u, promotionTarget: e.target.value } : u))}
                        displayEmpty
                        disabled={promotions.length === 0}
                      >
                        <MenuItem value="" disabled>Select role</MenuItem>
                        {promotions.map(role => (
                          <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={!user.promotionTarget || promoting === user.id}
                        onClick={() => handlePromote(user.id, user.promotionTarget)}
                      >
                        Promote
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PromoteUserPage;
