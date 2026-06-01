import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailIcon from '@mui/icons-material/Email';
import NotesIcon from '@mui/icons-material/Notes';
import { Alert, Box, Button, Collapse, Link, Paper, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { useShowIds } from '../ShowIdsContext';

// Component to display error message with expandable details
const ErrorMessage = ({ text, details }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Typography sx={{ color: 'error.main' }}>{text}</Typography>
      {details && (
        <>
          <Link
            component="button"
            variant="body2"
            onClick={() => setShowDetails(!showDetails)}
            sx={{ mt: 1, display: 'block' }}
          >
            {showDetails ? 'Hide details' : 'More details'}
          </Link>
          <Collapse in={showDetails}>
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 300,
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {details}
            </Box>
          </Collapse>
        </>
      )}
    </>
  );
};
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const normalizeLatexDelimiters = (text) => {
  // Convert \[...\] and \(...\) to $$/$$ delimiters, protecting any $ inside
  let result = text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$${inner.replace(/\\?\$/g, '＄')}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner.replace(/\\?\$/g, '＄')}$`);
  // Protect currency amounts outside math (e.g. $303,464 or \$479) from being parsed as delimiters
  result = result.replace(/\\?\$(?=[\d,])/g, '＄');
  return result;
};

// Renders charts, table thumbnails, and summary appended to an assistant message.
const MessageArtifacts = ({ artifacts, queryId, sessionId, onOpenFlowsTable, onOpenAnnualTable, onEditField }) => {
  const theme = useTheme();
  const [inputsOpen, setInputsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!artifacts) return null;
  const { images, tables, summaryHtml } = artifacts;
  const hasInputs = tables && tables.length > 0;
  if (!images?.length && !summaryHtml && !hasInputs) return null;

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
      {/* Thumbnail row — always shown when there are inputs; chart/table/summary thumbnails only when their data loaded */}
      {(hasInputs || images?.length > 0 || summaryHtml) && (
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, mb: summaryHtml ? 2 : 0 }}>
          {/* Inputs & Assumptions thumbnail card */}
          {hasInputs && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Inputs &amp; Assumptions</Typography>
              <Box
                onClick={() => setInputsOpen(o => !o)}
                sx={{
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  border: `1px solid ${inputsOpen ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 1,
                  bgcolor: inputsOpen ? 'action.selected' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected', borderColor: 'primary.main' },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 28, color: inputsOpen ? 'primary.main' : 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: inputsOpen ? 'primary.main' : 'text.secondary', fontSize: '0.7rem' }}>
                  {inputsOpen ? 'Hide' : 'Show'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Chart thumbnails */}
          {images.map((img, idx) => img.chartThumbnail && (
            <Box key={`chart-${idx}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{img.alt}</Typography>
              <Box
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                onClick={() => {
                  const blob = new Blob([img.html], { type: 'text/html' });
                  window.open(URL.createObjectURL(blob), '_blank');
                }}
              >
                <img src={img.chartThumbnail} alt={img.alt} style={{ width: 90, height: 'auto', display: 'block', borderRadius: 4 }} />
              </Box>
            </Box>
          ))}

          {/* Annual Details table thumbnail only */}
          {images.filter(img => img.tableType === 'annual' && img.tableThumbnail).map((img, idx) => (
            <Box key={`annual-${idx}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{img.tableLabel}</Typography>
              <Box
                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                onClick={() => onOpenAnnualTable?.(queryId)}
              >
                <img
                  src={img.tableThumbnail}
                  alt={img.tableLabel}
                  style={{ width: 90, height: 'auto', display: 'block', border: `1px solid ${theme.palette.divider}`, borderRadius: 4 }}
                />
              </Box>
            </Box>
          ))}

          {/* Summary thumbnail card */}
          {summaryHtml && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Summary</Typography>
              <Box
                onClick={() => setSummaryOpen(o => !o)}
                sx={{
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  border: `1px solid ${summaryOpen ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 1,
                  bgcolor: summaryOpen ? 'action.selected' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected', borderColor: 'primary.main' },
                }}
              >
                <NotesIcon sx={{ fontSize: 28, color: summaryOpen ? 'primary.main' : 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: summaryOpen ? 'primary.main' : 'text.secondary', fontSize: '0.7rem' }}>
                  {summaryOpen ? 'Hide' : 'Show'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Support thumbnail card — rightmost */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Support</Typography>
            <Box
              component="a"
              href={`mailto:leisureplansupport@gmail.com?body=${encodeURIComponent(`Please include these IDs, SessionID: ${sessionId ?? ''}, QueryID: ${queryId ?? ''}.`)}`}
              sx={{
                width: 90,
                height: 90,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                cursor: 'pointer',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'action.hover',
                textDecoration: 'none',
                '&:hover': { bgcolor: 'action.selected', borderColor: 'primary.main' },
              }}
            >
              <EmailIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Email Us
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Inputs & Assumptions expanded panel */}
      {hasInputs && inputsOpen && (() => {
        // Group tables by rowGroup
        const grouped = tables.reduce((acc, table) => {
          const g = table.rowGroup ?? 0;
          if (!acc[g]) acc[g] = [];
          acc[g].push(table);
          return acc;
        }, {});

        const renderTable = (table, key) => (
          <Paper key={key} elevation={1} sx={{ p: 1.5, overflow: 'auto' }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>{table.title}</Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  {table.headers.map((h, i) => (
                    <th key={i} style={{ borderBottom: `2px solid ${theme.palette.secondary.main}`, padding: '3px 6px', textAlign: 'left', backgroundColor: theme.palette.action.hover, fontWeight: 600 }}>{h}</th>
                  ))}
                  <th style={{ borderBottom: `2px solid ${theme.palette.secondary.main}`, backgroundColor: theme.palette.action.hover, width: 24 }} />
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '3px 6px', textAlign: j === 0 ? 'left' : 'right' }}>{cell}</td>
                    ))}
                    <td style={{ padding: '0 2px', textAlign: 'center', width: 24 }}>
                      <EditOutlinedIcon
                        onClick={() => onEditField?.(row[0], row[1])}
                        sx={{ fontSize: '0.85rem', color: 'text.disabled', verticalAlign: 'middle', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        );

        return (
          <Box sx={{ mt: 2, display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(grouped).map(([g, groupTables]) => (
              <Box key={g} sx={{ display: 'inline-flex', gap: 1 }}>
                {groupTables.map((t, i) => renderTable(t, `${g}-${i}`))}
              </Box>
            ))}
          </Box>
        );
      })()}

      {/* Summary expanded panel */}
      {summaryHtml && summaryOpen && (() => {
        return (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Summary</Typography>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <pre style={{ margin: 0, whiteSpace: 'pre', fontFamily: 'monospace', fontSize: '0.6875rem' }}>{summaryHtml}</pre>
            </Paper>
          </Box>
        );
      })()}
    </Box>
  );
};

const ChatWindow = ({ messages, onSend, loading, onQueryIdClick, selectedQueryId, shouldScrollToBottom, onScrollComplete, sessionId, isAuthenticated, isImpersonating, lowBalance, loadedQueryHistory, prefillText, onPrefillConsumed, onOpenFlowsTable, onOpenAnnualTable, onEditField, isAdmin, onAdminClick }) => {
  const theme = useTheme();
  const { showIds } = useShowIds();
  const [inputValue, setInputValue] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedInput, setSavedInput] = useState('');
  const topRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  // Reset history when a new chat session starts (sessionId goes to null)
  useEffect(() => {
    if (sessionId === null) {
      setQueryHistory([]);
      setHistoryIndex(-1);
      setSavedInput('');
    }
  }, [sessionId]);

  // Seed history when a session is loaded from the Sessions page
  useEffect(() => {
    if (loadedQueryHistory && loadedQueryHistory.length > 0) {
      setQueryHistory(loadedQueryHistory);
      setHistoryIndex(-1);
      setSavedInput('');
    }
  }, [loadedQueryHistory]);

  // Prefill input from pencil-icon click and focus the chat box
  useEffect(() => {
    if (prefillText) {
      setInputValue(prev => prev.trim() ? `${prev}. ${prefillText}` : prefillText);
      setHistoryIndex(-1);
      setSavedInput('');
      inputRef.current?.focus();
      onPrefillConsumed && onPrefillConsumed();
    }
  }, [prefillText]);

  // Scroll to bottom when NEW messages are added
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      // New message was added, scroll to bottom
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Scroll to bottom when explicitly requested (e.g., when assistant response is updated)
  useEffect(() => {
    if (shouldScrollToBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      onScrollComplete && onScrollComplete();
    }
  }, [shouldScrollToBottom, onScrollComplete]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQueryHistory(prev => [...prev, inputValue]);
      setHistoryIndex(-1);
      setSavedInput('');
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    // Only intercept when there are no newlines (don't interfere with multiline editing)
    if (e.key === 'ArrowUp' && !inputValue.includes('\n')) {
      if (queryHistory.length === 0) return;
      e.preventDefault();
      if (historyIndex === -1) {
        setSavedInput(inputValue);
        const newIndex = queryHistory.length - 1;
        setHistoryIndex(newIndex);
        setInputValue(queryHistory[newIndex]);
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(queryHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && historyIndex !== -1) {
      e.preventDefault();
      if (historyIndex < queryHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(queryHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInputValue(savedInput);
      }
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {isImpersonating && (
        <Alert severity="warning" sx={{ borderRadius: 0, flexShrink: 0 }}>
          Impersonation active — read-only view. Sending messages is disabled.
        </Alert>
      )}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {showIds && sessionId && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              p: 1,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: theme.palette.text.secondary,
            }}
          >
            Chat Session ID: {sessionId}
          </Typography>
        )}
        {!messages.some(m => m.sender === 'user') && (
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                To start, enter your question below.
              </Typography>
              <Typography variant="body1" gutterBottom>
                For examples see{' '}
                <Link href="/help/SampleQueries.html" target="_blank" rel="noopener noreferrer">
                  here
                </Link>
                .
              </Typography>
              <Typography variant="body1">
                For questions, or support issues, click{' '}
                <Link href="mailto:leisureplansupport@gmail.com">
                  here
                </Link>
                .
              </Typography>
            </Paper>
          </Box>
        )}
        {messages.map((msg, idx) => (
          <Paper
            key={idx}
            data-message-idx={idx}
            elevation={1}
            sx={{
              p: 2,
              maxWidth: msg.sender === 'user' ? '80%' : '100%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user'
                ? (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : '#e3f2fd')
                : theme.palette.background.default,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              {msg.sender === 'user' ? 'You' : 'Assistant'}
            </Typography>
            {msg.sender === 'agent' ? (
              <>
                {msg.errorDetails ? (
                  <ErrorMessage text={msg.text} details={msg.errorDetails} />
                ) : (
                  <Box sx={{
                    '& table': {
                      borderCollapse: 'collapse',
                      width: 'auto',
                      marginTop: 1,
                      marginBottom: 1,
                      fontSize: '0.75rem'
                    },
                    '& th, & td': {
                      border: `1px solid ${theme.palette.divider}`,
                      padding: '4px 6px',
                      textAlign: 'left'
                    },
                    '& th': {
                      backgroundColor: theme.palette.action.hover,
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    },
                    '& td': {
                      fontSize: '0.75rem'
                    },
                    '& tr:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{normalizeLatexDelimiters(msg.text)}</ReactMarkdown>
                  </Box>
                )}
                {showIds && msg.queryId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontStyle: 'italic',
                        fontSize: '0.8rem',
                        color: selectedQueryId === msg.queryId ? theme.palette.secondary.main : theme.palette.text.primary,
                        backgroundColor: selectedQueryId === msg.queryId ? theme.palette.action.selected : theme.palette.action.hover,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        '&:hover': {
                          backgroundColor: theme.palette.action.selected,
                          color: theme.palette.secondary.main,
                        }
                      }}
                      onClick={() => onQueryIdClick && onQueryIdClick(msg.queryId)}
                    >
                      Query ID: {msg.queryId}
                    </Typography>
                    {isAdmin && onAdminClick && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: theme.palette.secondary.main,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': { color: theme.palette.secondary.dark },
                        }}
                        onClick={() => onAdminClick(sessionId, msg.queryId)}
                      >
                        Admin
                      </Typography>
                    )}
                  </Box>
                )}
                <MessageArtifacts
                  artifacts={msg.artifacts}
                  queryId={msg.queryId}
                  sessionId={sessionId}
                  onOpenFlowsTable={onOpenFlowsTable}
                  onOpenAnnualTable={onOpenAnnualTable}
                  onEditField={onEditField}
                />
              </>
            ) : (
              <Typography component="div" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {msg.text}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      <Box sx={{
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        flexShrink: 0,
        minHeight: 80
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={isAuthenticated ? "Type your question..." : "Please login."}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !isAuthenticated || isImpersonating || lowBalance}
            multiline
            maxRows={4}
            inputRef={inputRef}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !inputValue.trim() || !isAuthenticated || isImpersonating || lowBalance}
            sx={{ minWidth: 80 }}
          >
            Send
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ChatWindow;
