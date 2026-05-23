
import { useAuth0 } from '@auth0/auth0-react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  ApiError,
  CanceledAccountError,
  InsufficientBalanceError,
  fetchAnnualTable,
  fetchChart,
  fetchChartHtml,
  fetchChatDialog,
  fetchFlowsTable,
  fetchIsAdministrator,
  fetchLatestAnnualTable,
  fetchLatestChart,
  fetchLatestChartHtml,
  fetchLatestFlowsTable,
  fetchLatestSummaryTable,
  fetchQueryStatus,
  fetchRetirementInputs,
  fetchSummaryTable,
  getBillingBalance,
  postUserLogin,
  sendMessage
} from './api';
import { ColorModeContext } from './ColorModeContext';
import Banner from './components/Banner';
import ChatWindow from './components/ChatWindow';
import CookieNotice from './components/CookieNotice';
import LowBalanceBanner from './components/LowBalanceBanner';
import PollingProgressBar from './components/PollingProgressBar';
import { ImpersonationContext, useImpersonation } from './ImpersonationContext';
import About from './pages/About';
import AccountCanceled from './pages/AccountCanceled';
import Admin from './pages/Admin';
import Billing from './pages/Billing';
import Help from './pages/Help';
import Plans from './pages/Plans';
import PleaseVerify from './pages/PleaseVerify';
import PostVerify from './pages/PostVerify';
import Privacy from './pages/Privacy';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import { createAppTheme } from './theme';


// Transform API dialog messages to match UI expectations
function normalizeDialogMessages(apiMessages) {
  if (!Array.isArray(apiMessages)) return [];
  return apiMessages.map(msg => ({
    ...msg,
    // Map 'assistant' to 'agent' for ChatWindow compatibility
    sender: msg.sender === 'assistant' ? 'agent' : msg.sender
  }));
}

// Fields that should be displayed as percentages
const percentFields = new Set([
  'annualInflationRate',
  'annualMedicalInflationRate',
  'marketROR',
  'socialSecurityColaRate',
  'stateIncomeTaxRate'
]);

// Convert camelCase to Title Case With Spaces
function camelToTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

// Format object entries, converting decimal values to percentages for specific fields
function formatEntries(obj) {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => {
    const displayKey = camelToTitleCase(key);
    if (percentFields.has(key) && typeof value === 'number') {
      return [displayKey, `${(value * 100).toFixed(1)}%`];
    }
    return [displayKey, value];
  });
}

function CanceledRedirect({ canceled }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (canceled) navigate('/canceled', { replace: true });
  }, [canceled]);
  return null;
}

function MainChat({ onBalanceUpdate, onCanceled }) {
  const { getAccessTokenSilently, isAuthenticated, isLoading, error: auth0Error } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [queryId, setQueryId] = useState(null);
  const [results, setResults] = useState({ images: [], tables: [] });
  const [dialog, setDialog] = useState([]);
  const [retInputs, setRetInputs] = useState(null);
  const [flowsHtml, setFlowsHtml] = useState(null);
  const [balancesHtml, setBalancesHtml] = useState(null);
  const [flowsThumbnail, setFlowsThumbnail] = useState(null);
  const [balancesThumbnail, setBalancesThumbnail] = useState(null);
  const [summaryHtml, setSummaryHtml] = useState(null);
  const [queryStatus, setQueryStatus] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [maxPolls] = useState(300);
  const pollRef = useRef();
  const isNewQueryRef = useRef(false);
  const prevAuthRef = useRef(isAuthenticated);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const hasLoadedSessionRef = useRef(false);
  const [lowBalance, setLowBalance] = useState(false);
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeBalance, setWelcomeBalance] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loadedQueryHistory, setLoadedQueryHistory] = useState([]);
  const [chatPrefill, setChatPrefill] = useState('');

  // Helper function to get appropriate welcome message based on auth state
  const getWelcomeMessage = (isAuth) => {
    return isAuth
      ? 'How can I help you plan your retirement?'
      : 'Welcome to LeisurePlan.App! Please Login.';
  };

  // Set initial welcome message after Auth0 finishes loading
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      setMessages([{
        sender: 'agent',
        text: getWelcomeMessage(isAuthenticated)
      }]);
    }
  }, [isLoading]);

  const { isAdmin, isImpersonating } = useImpersonation();

  // Handle authentication state changes during session
  useEffect(() => {
    if (!isLoading) {
      const prevAuth = prevAuthRef.current;
      const currentAuth = isAuthenticated;

      // User logged out - clear everything for security
      if (prevAuth && !currentAuth) {
        setMessages([{
          sender: 'agent',
          text: getWelcomeMessage(false)
        }]);
        setSessionId(null);
        setQueryId(null);
        setSelectedQueryId(null);
        setResults({ images: [], tables: [] });
        setRetInputs(null);
        setFlowsHtml(null);
        setBalancesHtml(null);
        setFlowsThumbnail(null);
        setBalancesThumbnail(null);
        setSummaryHtml(null);
        setDialog([]);
      }

      // User logged in - update welcome message and check for new user
      if (!prevAuth && currentAuth) {
        setMessages((msgs) => {
          if (msgs.length === 1 && msgs[0].sender === 'agent') {
            return [{ sender: 'agent', text: getWelcomeMessage(true) }];
          }
          return msgs;
        });
        getAccessTokenSilently().then(token =>
          getBillingBalance(token).then(({ balanceUsd, isNewUser }) => {
            onBalanceUpdate(balanceUsd);
            if (isNewUser) {
              setWelcomeBalance(balanceUsd);
              setWelcomeOpen(true);
            }
          })
        ).catch(() => {});
      }

      prevAuthRef.current = currentAuth;
    }
  }, [isAuthenticated, isLoading]);

  // Load session from navigation state (when coming from Sessions page)
  useEffect(() => {
    const loadSessionFromState = async () => {
      if (!isAuthenticated || isLoading || hasLoadedSessionRef.current) {
        return;
      }

      // Check if we have session data from navigation
      if (location.state?.sessionId) {
        hasLoadedSessionRef.current = true;
        const { sessionId: loadSessionId, queryId: loadQueryId } = location.state;

        setSessionId(loadSessionId);
        isNewQueryRef.current = false;

        if (loadQueryId) {
          setQueryId(loadQueryId);
          setSelectedQueryId(loadQueryId);
        }

        try {
          if (loadQueryId) {
            await loadResults(loadSessionId, loadQueryId);
          }

          const token = await getAccessTokenSilently();
          const dialogMessages = await fetchChatDialog(loadSessionId, token);
          const normalizedMessages = normalizeDialogMessages(dialogMessages);
          setMessages(normalizedMessages);
          setLoadedQueryHistory(normalizedMessages.filter(m => m.sender === 'user').map(m => m.text));
        } catch (e) {
          setMessages([
            { sender: 'agent', text: getWelcomeMessage(true) },
            { sender: 'agent', text: 'Error loading session: ' + e.message }
          ]);
        }
      }
    };

    loadSessionFromState();
  }, [isAuthenticated, isLoading, location.state]);

  // Handle ?payment=success return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'success' && isAuthenticated && !isLoading) {
      const refresh = async () => {
        try {
          const token = await getAccessTokenSilently();
          const { balanceUsd } = await getBillingBalance(token);
          onBalanceUpdate(balanceUsd);
          setLowBalance(false);
          setPaymentSuccessOpen(true);
        } catch {}
      };
      refresh();
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading]);

  // Handle Auth0 error redirect (e.g. email not verified)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const description = params.get('error_description');
    if (error) {
      setAuthError(description || error);
      navigate('/', { replace: true });
    }
  }, []);

  // Fallback: catch errors the Auth0 SDK surfaces after consuming the URL params itself
  useEffect(() => {
    if (auth0Error && !authError) {
      setAuthError(auth0Error.message || String(auth0Error));
    }
  }, [auth0Error]);

  // Handle "New Chat" from menu
  useEffect(() => {
    if (location.state?.newChat) {
      setMessages([{ sender: 'agent', text: getWelcomeMessage(isAuthenticated) }]);
      setSessionId(null);
      setQueryId(null);
      setSelectedQueryId(null);
      setResults({ images: [], tables: [] });
      setRetInputs(null);
      setFlowsHtml(null);
      setBalancesHtml(null);
      setFlowsThumbnail(null);
      setBalancesThumbnail(null);
      setSummaryHtml(null);
      setDialog([]);
      setQueryStatus(null);
      hasLoadedSessionRef.current = false;
      isNewQueryRef.current = false;
      setLoadedQueryHistory([]);
      // Clear the navigation state so refresh doesn't re-trigger
      navigate('/', { replace: true });
    }
  }, [location.state?.newChat]);

  // Send message and start polling for status
  const handleSend = async (text) => {
    setMessages((msgs) => [...msgs, { sender: 'user', text }]);
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await sendMessage(text, sessionId, token);
      setSessionId(res.chatSessionId);
      setQueryId(res.chatQueryId);
      setSelectedQueryId(res.chatQueryId); // Auto-select the new query
      isNewQueryRef.current = true; // Mark this as a new query (not a historical click)
      setMessages((msgs) => [...msgs, { sender: 'agent', text: res.reply || 'Message sent. Waiting for results...', queryId: res.chatQueryId }]);
      pollQueryStatus(res.chatSessionId, res.chatQueryId);
    } catch (e) {
      if (e instanceof CanceledAccountError) {
        onCanceled();
      } else if (e instanceof InsufficientBalanceError) {
        setLowBalance(true);
        if (e.balanceUsd !== null && e.balanceUsd !== undefined) onBalanceUpdate(e.balanceUsd);
      } else if (e instanceof ApiError && e.details) {
        setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Error: ' + e.message, errorDetails: e.details }]);
      } else if (e instanceof TypeError) {
        setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Connection error — the server may be unavailable or the request timed out. Please try again.' }]);
      } else {
        setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Error: ' + e.message }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll for query status and load results when done
  const pollQueryStatus = async (sessId, qId) => {
    setQueryStatus('Working');
    setPollCount(0);
    const poll = async () => {
      setPollCount(prev => prev + 1);
      const currentPoll = pollCount + 1;
      try {
        const token = await getAccessTokenSilently();
        const statusData = await fetchQueryStatus(sessId, qId, token);
        const status = statusData.status;
        setQueryStatus(status);
        if (status === 'Working' || status === 'Preprocessing') {
          // Update dialog while working
          try {
            const dialogMessages = await fetchChatDialog(sessId, token);
            const normalizedMessages = normalizeDialogMessages(dialogMessages);
            setDialog(normalizedMessages);
          } catch (err) {
            // Ignore dialog fetch errors while working
          }
          if (currentPoll < maxPolls) setTimeout(poll, 1000);
        } else if (status === 'Done') {
          if (statusData.balanceUsd !== null && statusData.balanceUsd !== undefined) {
            onBalanceUpdate(statusData.balanceUsd);
          }
          await loadResults(sessId, qId, true); // Use latest endpoints for new query
          await updateMessagesFromDialog(sessId, qId);
        } else if (status === 'Failed') {
          setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Sorry, but something failed. Please try again.' }]);
        } else if (status === 'Timeout') {
          setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Query timed out, try again.' }]);
        }
      } catch (e) {
        if (e instanceof CanceledAccountError) { onCanceled(); return; }
        if (currentPoll < maxPolls) setTimeout(poll, 1000);
      }
    };
    pollRef.current = poll;
    poll();
  };

  // Load result data (charts and inputs) for a specific query
  // useLatest: if true, use LatestChart/LatestFlowsTable endpoints (no queryId needed)
  const loadResults = async (sessId, qId, useLatest = false) => {
    try {
      const token = await getAccessTokenSilently();

      // Model Inputs (always requires queryId)
      try {
        const inputs = await fetchRetirementInputs(sessId, qId, token);
        setRetInputs(inputs);
      } catch (err) {
        // Ignore input fetch errors
      }
      // Charts
      try {
        const html = useLatest
          ? await fetchLatestChartHtml(sessId, 'Flows', token)
          : await fetchChartHtml(sessId, qId, 'Flows', token);
        setFlowsHtml(html);
      } catch (err) {
        setFlowsHtml(null);
      }
      try {
        const html = useLatest
          ? await fetchLatestChartHtml(sessId, 'Balances', token)
          : await fetchChartHtml(sessId, qId, 'Balances', token);
        setBalancesHtml(html);
      } catch (err) {
        setBalancesHtml(null);
      }
      // Chart thumbnails (PNG)
      try {
        const blob = useLatest
          ? await fetchLatestChart(sessId, 'Flows', token)
          : await fetchChart(sessId, qId, 'Flows', token);
        setFlowsThumbnail(URL.createObjectURL(blob));
      } catch (err) {
        setFlowsThumbnail(null);
      }
      try {
        const blob = useLatest
          ? await fetchLatestChart(sessId, 'Balances', token)
          : await fetchChart(sessId, qId, 'Balances', token);
        setBalancesThumbnail(URL.createObjectURL(blob));
      } catch (err) {
        setBalancesThumbnail(null);
      }
      // Summary table
      try {
        const summary = useLatest
          ? await fetchLatestSummaryTable(sessId, token)
          : await fetchSummaryTable(sessId, qId, token);
        setSummaryHtml(summary);
      } catch (err) {
        setSummaryHtml(null);
      }
      // Optionally update messages/results
      setResults((r) => ({ ...r }));
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Error loading results: ' + e.message }]);
    }
  };

  // Update messages with dialog after query completes
  const updateMessagesFromDialog = async (sessId, qId) => {
    try {
      const token = await getAccessTokenSilently();

      // Fetch structured dialog messages
      const dialogMessages = await fetchChatDialog(sessId, token);
      const normalizedMessages = normalizeDialogMessages(dialogMessages);
      setDialog(normalizedMessages);

      // Find the last assistant message in the dialog (should match the current queryId)
      if (normalizedMessages.length > 0) {
        const lastAssistantMessage = normalizedMessages.filter(m => m.sender === 'agent').pop();
        if (lastAssistantMessage) {
          // Update messages: replace the last agent message with the actual response
          setMessages((msgs) => {
            const newMsgs = [...msgs];
            // Find last agent message index with matching queryId
            for (let i = newMsgs.length - 1; i >= 0; i--) {
              if (newMsgs[i].sender === 'agent' && newMsgs[i].queryId === qId) {
                newMsgs[i] = { ...newMsgs[i], text: lastAssistantMessage.text, queryId: lastAssistantMessage.queryId };
                break;
              }
            }
            return newMsgs;
          });
          // Only scroll if this is a NEW query (not a historical click)
          if (isNewQueryRef.current) {
            setShouldScrollToBottom(true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to update messages from dialog:', e);
    }
  };

  // Handler for clicking on a query ID
  const handleQueryIdClick = async (clickedQueryId) => {
    setSelectedQueryId(clickedQueryId);
    isNewQueryRef.current = false; // This is a historical click, not a new query

    // Clear existing results first to force re-render
    setRetInputs(null);
    setFlowsHtml(null);
    setBalancesHtml(null);
    setFlowsThumbnail(null);
    setBalancesThumbnail(null);
    setSummaryHtml(null);

    // Load results for the selected query
    if (sessionId) {
      await loadResults(sessionId, clickedQueryId);
    }
  };

  // Handler for clicking on Monthly Details link
  const handleDetailsClick = async (detailsLink) => {
    try {
      const token = await getAccessTokenSilently();
      // Use latest endpoint for new queries, otherwise use specific queryId
      const html = isNewQueryRef.current
        ? await fetchLatestFlowsTable(sessionId, token)
        : await fetchFlowsTable(sessionId, selectedQueryId, token);

      // Open HTML in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (e) {
      console.error('Failed to load monthly details:', e);
      alert('Failed to load monthly details: ' + e.message);
    }
  };

  // Handler for clicking on Annual Details link
  const handleAnnualDetailsClick = async () => {
    try {
      const token = await getAccessTokenSilently();
      const html = isNewQueryRef.current
        ? await fetchLatestAnnualTable(sessionId, token)
        : await fetchAnnualTable(sessionId, selectedQueryId, token);

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (e) {
      console.error('Failed to load annual details:', e);
      alert('Failed to load annual details: ' + e.message);
    }
  };

  // Handler for admin clicking on query ID
  const handleAdminClick = (adminSessionId, adminQueryId) => {
    window.open(`/admin?sessionId=${encodeURIComponent(adminSessionId)}&queryId=${encodeURIComponent(adminQueryId)}`, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Snackbar
        open={paymentSuccessOpen}
        autoHideDuration={6000}
        onClose={() => setPaymentSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setPaymentSuccessOpen(false)}>
          Payment successful — your balance has been updated.
        </Alert>
      </Snackbar>

      <Dialog open={welcomeOpen} onClose={() => setWelcomeOpen(false)}>
        <DialogTitle>Welcome to LeisurePlan!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have ${welcomeBalance?.toFixed(2)} in free credit ready to use. You should get about 20 queries/dollar.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            To get started, ask me anything about planning for retirement. See the <a href="/help">Help page</a> for examples.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Or you can ask what the app itself what it can do.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWelcomeOpen(false)} autoFocus>Get Started</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!authError} onClose={() => setAuthError(null)}>
        <DialogTitle>Login Failed</DialogTitle>
        <DialogContent>
          <DialogContentText>{authError}</DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Once you have verified your email, you can log in again using the Login button.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthError(null)} autoFocus>OK</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <PollingProgressBar pollCount={pollCount} maxPolls={maxPolls} loading={queryStatus === 'Working'} />
        {lowBalance && <LowBalanceBanner />}
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          loading={loading}
          onQueryIdClick={handleQueryIdClick}
          selectedQueryId={selectedQueryId}
          shouldScrollToBottom={shouldScrollToBottom}
          onScrollComplete={() => setShouldScrollToBottom(false)}
          sessionId={sessionId}
          isAuthenticated={isAuthenticated}
          isImpersonating={isImpersonating}
          lowBalance={lowBalance}
          loadedQueryHistory={loadedQueryHistory}
          prefillText={chatPrefill}
          onPrefillConsumed={() => setChatPrefill('')}
        />
      </Box>
    </Box>
  );
}

function App() {
  console.debug('[App] launched');
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();

  const [mode, setMode] = useState(() => localStorage.getItem('colorMode') ?? 'dark');
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const [balance, setBalance] = useState(null);
  const [canceled, setCanceled] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonation, setImpersonationState] = useState(() => {
    try {
      const stored = localStorage.getItem('impersonation');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { enabled: false, subject: '' };
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      getAccessTokenSilently().then(token => {
        if (!sessionStorage.getItem('lp_login_called')) {
          sessionStorage.setItem('lp_login_called', '1');
          postUserLogin(token).catch(() => {});
        }
        fetchIsAdministrator(token)
          .then(setIsAdmin)
          .catch(e => {
            if (e instanceof CanceledAccountError) setCanceled(true);
            else setIsAdmin(false);
          });
      });
    }
    if (!isLoading && !isAuthenticated) {
      setIsAdmin(false);
      sessionStorage.removeItem('lp_login_called');
    }
  }, [isLoading, isAuthenticated]);

  const setImpersonation = useCallback((updates) => {
    setImpersonationState(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('impersonation', JSON.stringify(next));
      return next;
    });
  }, []);

  const colorModeContext = useMemo(() => ({
    mode,
    setMode: (newMode) => {
      setMode(newMode);
      localStorage.setItem('colorMode', newMode);
    },
  }), [mode]);

  const impersonationContext = useMemo(() => ({
    isAdmin,
    impersonationEnabled: impersonation.enabled,
    isImpersonating: impersonation.enabled && !!impersonation.subject.trim() && impersonation.subject.trim() !== user?.sub,
    impersonateSubject: impersonation.subject,
    setImpersonation,
  }), [isAdmin, impersonation, setImpersonation]);

  return (
    <ImpersonationContext.Provider value={impersonationContext}>
    <ColorModeContext.Provider value={colorModeContext}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <CanceledRedirect canceled={canceled} />

          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Banner canceled={canceled} />
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <Routes>
                <Route path="/canceled" element={<AccountCanceled />} />
                <Route path="/please-verify" element={<PleaseVerify />} />
                <Route path="/post-verify" element={<PostVerify />} />
                <Route path="/about" element={<About />} />
                <Route path="/billing" element={<Billing balance={balance} onBalanceUpdate={setBalance} />} />
                <Route path="/help" element={<Help />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<MainChat onBalanceUpdate={setBalance} onCanceled={() => setCanceled(true)} />} />
              </Routes>
            </Box>
            <Box sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.default',
              padding: '8px 16px',
              fontSize: '0.75rem',
              color: 'text.secondary',
              textAlign: 'left',
              lineHeight: 1.4
            }}>
              <strong>Disclaimer:</strong> The information and calculations provided on this website are for educational purposes only and are not intended as financial, investment, tax, or legal advice. Individual circumstances vary, and you should consult with a qualified financial advisor, tax professional, or attorney before making any decisions based on the information provided.
              {' '}<a href="/privacy">Privacy Policy</a>
            </Box>
            <CookieNotice />
          </Box>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
    </ImpersonationContext.Provider>
  );
}

export default App;
