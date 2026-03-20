import { useAuth0 } from '@auth0/auth0-react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  CircularProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchSubAgentContext, fetchSubAgentResponse } from '../api';

const TASKS = ['A', 'B', 'C', 'D', 'E', 'Z'];

const TASK_TOOLTIPS = {
  A: 'Make tool call. Always runs. Returns result without analysis.',
  B: 'Analyze previous tool call without waiting for Task A.',
  C: 'Decide if an extra tool call is needed, or if Task B\'s answer suffices.',
  D: 'Analyze results of Task A.',
  E: 'Validate tool request made in Task A. First query only.',
  Z: 'Validate query is sufficient and on-topic. Runs initially and repeats until query is adequate.',
};

const CALL_ID_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9A6324', '#800000', '#aaffc3', '#808000',
  '#000075', '#a9a9a9',
];

// Each context item may be an array of messages or an object containing messages.
// Normalize to always get an array of message entries.
const getMessages = (context) => {
  if (Array.isArray(context)) return context;
  if (context && typeof context === 'object') {
    // Look for an array property that contains the messages
    const arrayProp = Object.values(context).find(v => Array.isArray(v));
    if (arrayProp) return arrayProp;
  }
  return [];
};

const getIdColorMap = (taskData, getId) => {
  const map = {};
  let colorIdx = 0;
  TASKS.forEach(task => {
    const contexts = taskData[task];
    if (!contexts) return;
    contexts.forEach(context => {
      const messages = getMessages(context);
      messages.forEach(entry => {
        const id = getId(entry);
        if (id && !(id in map)) {
          map[id] = CALL_ID_COLORS[colorIdx % CALL_ID_COLORS.length];
          colorIdx++;
        }
      });
    });
  });
  return map;
};

const Admin = () => {
  const theme = useTheme();
  const { getAccessTokenSilently } = useAuth0();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const queryId = searchParams.get('queryId');
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState({});
  const [taskResponses, setTaskResponses] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllTasks = async () => {
      if (!sessionId || !queryId) {
        setError('Missing sessionId or queryId');
        setLoading(false);
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        const [contextResults, responseResults] = await Promise.all([
          Promise.all(
            TASKS.map(task =>
              fetchSubAgentContext(sessionId, queryId, task, token)
                .then(data => ({ task, data }))
                .catch(() => ({ task, data: null }))
            )
          ),
          Promise.all(
            TASKS.map(task =>
              fetchSubAgentResponse(sessionId, queryId, task, token)
                .then(data => ({ task, data }))
                .catch(() => ({ task, data: null }))
            )
          ),
        ]);
        const dataMap = {};
        contextResults.forEach(({ task, data }) => {
          dataMap[task] = data;
        });
        const responseMap = {};
        responseResults.forEach(({ task, data }) => {
          responseMap[task] = data;
        });
        setTaskData(dataMap);
        setTaskResponses(responseMap);
      } catch (e) {
        setError(e.message);
        console.error('Failed to load sub-agent contexts:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAllTasks();
  }, [sessionId, queryId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const callIdColors = getIdColorMap(taskData, e => e.Contents?.[0]?.CallId);
  const messageIdColors = getIdColorMap(taskData, e => e.MessageId);

  return (
    <Box sx={{ p: 3, overflow: 'auto', height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h5">Admin</Typography>
        <Link href="/SubAgentInteractions.html" target="_blank" rel="noopener noreferrer" color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
          <InfoOutlinedIcon fontSize="small" />
          <Typography variant="body2">What is this all about?</Typography>
        </Link>
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Session: {sessionId} | Query: {queryId}
      </Typography>
      {TASKS.map(task => {
        const contexts = taskData[task];
        const responses = taskResponses[task];
        const hasContexts = contexts && contexts.length > 0;
        const hasResponses = responses && responses.length > 0;
        if (!hasContexts && !hasResponses) return null;
        return (
          <Box key={task}>
            {hasContexts && contexts.map((context, ctxIdx) => {
              const messages = getMessages(context);
              if (!messages || messages.length === 0) return null;
              const tableLabel = `Task ${task} - ${String(ctxIdx + 1).padStart(2, '0')}`;
              return (
                <Box key={`${task}-ctx-${ctxIdx}`} sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    title={TASK_TOOLTIPS[task]}
                    sx={{ mb: 1, color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: 'secondary.dark' } }}
                    onClick={() => {
                      const w = window.open('', '_blank');
                      if (w) {
                        w.document.write('<pre>' + JSON.stringify(context, null, 2).replace(/</g, '&lt;') + '</pre>');
                        w.document.close();
                      }
                    }}
                  >
                    {tableLabel}
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>$type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Contents</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>CallId</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Tool Result</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>MessageId</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {messages.map((entry, idx) => {
                          const text = entry.Contents?.[0]?.Text || '';
                          const truncated = text.length > 40 ? text.substring(0, 40) + '...' : text;
                          const rawResult = entry.Contents?.[0]?.Result;
                          const result = rawResult ? (typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult)) : '';
                          const resultTruncated = result.length > 40 ? result.substring(0, 40) + '...' : result;
                          return (
                            <TableRow key={idx}>
                              <TableCell
                                sx={{ color: 'secondary.main', cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: 'secondary.dark' } }}
                                onClick={() => {
                                  const w = window.open('', '_blank');
                                  if (w) {
                                    const json = JSON.stringify(entry.Contents, null, 2).replace(/</g, '&lt;').replace(/\\n/g, '\n').replace(/"([^"]*)"/g, '<span style="color:blue">"$1"</span>');
                                    w.document.write('<pre style="color:red">' + json + '</pre>');
                                    w.document.close();
                                  }
                                }}
                              >
                                {entry.Role}
                              </TableCell>
                              <TableCell>{entry.Contents?.[0]?.['$type'] || ''}</TableCell>
                              <TableCell>{truncated}</TableCell>
                              <TableCell sx={{ color: callIdColors[entry.Contents?.[0]?.CallId] || 'inherit', fontWeight: entry.Contents?.[0]?.CallId ? 'bold' : 'normal' }}>
                                {entry.Contents?.[0]?.CallId || ''}
                              </TableCell>
                              <TableCell>{resultTruncated}</TableCell>
                              <TableCell sx={{ color: messageIdColors[entry.MessageId] || 'inherit', fontWeight: entry.MessageId ? 'bold' : 'normal' }}>
                                {entry.MessageId}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}
            {hasResponses && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Task {task} Responses
                </Typography>
                {responses.map((response, rIdx) => (
                  <Paper key={rIdx} sx={{ p: 1.5, mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                      }}
                      onClick={() => {
                        const w = window.open('', '_blank');
                        if (w) {
                          w.document.write('<pre>' + response.replace(/</g, '&lt;') + '</pre>');
                          w.document.close();
                        }
                      }}
                    >
                      {response.length > 100 ? '...' + response.substring(response.length - 100) : response}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default Admin;
