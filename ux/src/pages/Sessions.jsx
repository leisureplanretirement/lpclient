import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteSession, fetchSession, fetchSessionList, updateSession } from '../api';
import { useImpersonation } from '../ImpersonationContext';

const Sessions = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { isImpersonating } = useImpersonation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadSessions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const sessionList = await fetchSessionList(token);
        setSessions(sessionList);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [isAuthenticated, getAccessTokenSilently]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSessionName = (session) => {
    if (session.locked && session.name) {
      return session.name;
    }
    return session.lastMessage || 'Untitled Session';
  };

  const handleLoad = async (sessionId) => {
    try {
      const token = await getAccessTokenSilently();
      const sessionData = await fetchSession(sessionId, token);

      // Navigate to main chat with session data
      navigate('/', {
        state: {
          sessionId: sessionData.sessionId,
          queryId: sessionData.lastSuccessfulQueryId
        }
      });
    } catch (e) {
      alert('Failed to load session: ' + e.message);
    }
  };

  const handleRename = async (session) => {
    const currentName = getSessionName(session);
    const newName = prompt('Enter new session name:', currentName);
    if (newName === null || newName.trim() === '') return;

    try {
      const token = await getAccessTokenSilently();
      await updateSession(session.sessionId, newName.trim(), token);
      setSessions(sessions.map(s =>
        s.sessionId === session.sessionId
          ? { ...s, name: newName.trim(), locked: true }
          : s
      ));
    } catch (e) {
      alert('Failed to rename session: ' + e.message);
    }
  };

  const handleDelete = async (session) => {
    const sessionName = getSessionName(session);
    if (!confirm(`Are you sure you want to delete "${sessionName}"?`)) return;

    try {
      const token = await getAccessTokenSilently();
      await deleteSession(session.sessionId, token);
      setSessions(sessions.filter(s => s.sessionId !== session.sessionId));
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(session.sessionId);
        return next;
      });
    } catch (e) {
      alert('Failed to delete session: ' + e.message);
    }
  };

  const handleToggleSelect = (sessionId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === sessions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sessions.map(s => s.sessionId)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.size} session(s)?`)) return;

    setDeleting(true);
    try {
      const token = await getAccessTokenSilently();
      const errors = [];
      for (const sessionId of selected) {
        try {
          await deleteSession(sessionId, token);
        } catch (e) {
          errors.push(sessionId);
        }
      }
      setSessions(prev => prev.filter(s => !selected.has(s.sessionId) || errors.includes(s.sessionId)));
      setSelected(new Set(errors));
      if (errors.length > 0) {
        alert(`Failed to delete ${errors.length} session(s).`);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Sessions
        </Typography>
        <Typography>
          Please login to view your sessions.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Sessions
        </Typography>
        <Typography color="error">
          Error loading sessions: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Sessions
      </Typography>
      {sessions.length === 0 ? (
        <Typography>
          No sessions found.
        </Typography>
      ) : (
        <>
        {selected.size > 0 && (
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {selected.size} selected
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={deleting}
              onClick={handleDeleteSelected}
            >
              {deleting ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </Box>
        )}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="sessions table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={sessions.length > 0 && selected.size === sessions.length}
                    indeterminate={selected.size > 0 && selected.size < sessions.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell><strong>Session Name</strong></TableCell>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Session ID</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow
                  key={session.sessionId}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: selected.has(session.sessionId) ? 'action.selected' : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.has(session.sessionId)}
                      onChange={() => handleToggleSelect(session.sessionId)}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {getSessionName(session)}
                  </TableCell>
                  <TableCell>{formatTimestamp(session.timestamp)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{session.sessionId?.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleLoad(session.sessionId)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isImpersonating}
                        onClick={() => handleRename(session)}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(session)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </>
      )}
    </Box>
  );
};

export default Sessions;
