import { Alert, Box, Button, Collapse, Link, Paper, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

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

const ChatWindow = ({ messages, onSend, loading, onQueryIdClick, selectedQueryId, shouldScrollToBottom, onScrollComplete, sessionId, isAuthenticated, isImpersonating }) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [lastUserMessageIndex, setLastUserMessageIndex] = useState(-1);
  const topRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const prevMessageCountRef = useRef(0);

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
      onSend(inputValue);
      setInputValue('');
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
        {sessionId && (
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
                      width: '100%',
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
                    <ReactMarkdown remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]} rehypePlugins={[rehypeKatex]}>{msg.text}</ReactMarkdown>
                  </Box>
                )}
                {msg.queryId && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
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
                )}
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
            placeholder={isAuthenticated ? "Type your message..." : "Please login."}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={loading || !isAuthenticated || isImpersonating}
            multiline
            maxRows={4}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !inputValue.trim() || !isAuthenticated || isImpersonating}
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
