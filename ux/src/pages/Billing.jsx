import { useAuth0 } from '@auth0/auth0-react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddFundsFlow from '../components/AddFundsFlow';
import { fetchBillingRecords, fetchSession, getBillingBalance, getDiscountCodes } from '../api';

// UUID fields: show only the first segment (before the first '-'), tooltip shows full value
const UUID_SHORT_KEYS = new Set(['sessionId', 'queryId']);

// Text fields: truncate to 20 chars, tooltip shows full value
const SNIPPET_KEYS = new Set(['querySnippet', 'snippet', 'message', 'query']);

function camelToTitle(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

function formatValue(key, value) {
  if (value === null || value === undefined) return '—';
  const lk = key.toLowerCase();
  if (lk.includes('timestamp') || lk.includes('date') || lk.includes('time')) {
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleString();
  }
  if (lk.includes('balance') && typeof value === 'number') {
    return `$${value.toFixed(2)}`;
  }
  if ((lk.includes('amount') || lk.includes('cost') || lk.includes('total') || lk.includes('price')) && typeof value === 'number') {
    return `$${value.toFixed(4)}`;
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function ShortUuid({ value, onClick }) {
  const short = value.split('-')[0];
  return (
    <Tooltip title={value} placement="top">
      <span
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default', fontFamily: 'monospace', color: onClick ? '#1976d2' : undefined, textDecoration: onClick ? 'underline' : undefined }}
      >
        {short}…
      </span>
    </Tooltip>
  );
}

function CellContent({ col, value, onSessionClick }) {
  // Render deduction object: show session id, query id, token counts
  if (col === 'deduction') {
    if (!value) return <>—</>;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, fontSize: '0.75rem' }}>
        {value.sessionId && (
          <Box><span style={{ color: 'text.secondary' }}>sess: </span>
            <ShortUuid value={value.sessionId} onClick={onSessionClick ? () => onSessionClick(value.sessionId) : undefined} />
          </Box>
        )}
        {value.queryId && (
          <Box><span>qry: </span><ShortUuid value={value.queryId} /></Box>
        )}
        {value.inputTokens != null && (
          <Box>in: {value.inputTokens.toLocaleString()} / out: {value.outputTokens?.toLocaleString() ?? '—'}</Box>
        )}
      </Box>
    );
  }

  const formatted = formatValue(col, value);

  if (UUID_SHORT_KEYS.has(col) && typeof value === 'string' && value.includes('-')) {
    return <ShortUuid value={value} onClick={col === 'sessionId' && onSessionClick ? () => onSessionClick(value) : undefined} />;
  }

  if (SNIPPET_KEYS.has(col) && typeof value === 'string' && value.length > 20) {
    return (
      <Tooltip title={value} placement="top">
        <span style={{ cursor: 'default' }}>{value.slice(0, 20)}…</span>
      </Tooltip>
    );
  }

  return <>{formatted}</>;
}

function SortIcon({ dir }) {
  if (dir === 'asc') return <ArrowUpwardIcon fontSize="inherit" />;
  if (dir === 'desc') return <ArrowDownwardIcon fontSize="inherit" />;
  return <UnfoldMoreIcon fontSize="inherit" sx={{ opacity: 0.4 }} />;
}

const Billing = ({ balance, onBalanceUpdate }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Fetch fresh balance on mount; also handle ?payment=success
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const init = async () => {
      try {
        const token = await getAccessTokenSilently();
        const { balanceUsd } = await getBillingBalance(token);
        onBalanceUpdate(balanceUsd);
        const { codes } = await getDiscountCodes(token);
        setDiscountCodes(codes ?? []);
      } catch {}

      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setPaymentSuccessOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    init();
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessTokenSilently();
        const from = fromDate ? new Date(fromDate).toISOString() : undefined;
        const to = toDate ? new Date(toDate + 'T23:59:59').toISOString() : undefined;
        const data = await fetchBillingRecords(token, from, to);
        setRecords(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoading, isAuthenticated, getAccessTokenSilently, fromDate, toDate]);

  const handleLoadSession = async (sessionId) => {
    try {
      const token = await getAccessTokenSilently();
      const sessionData = await fetchSession(sessionId, token);
      navigate('/', { state: { sessionId: sessionData.sessionId, queryId: sessionData.lastSuccessfulQueryId } });
    } catch (e) {
      alert('Failed to load session: ' + e.message);
    }
  };

  const columns = useMemo(() => {
    if (records.length === 0) return [];
    return Object.keys(records[0]).filter(k => k !== 'userId');
  }, [records]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const lf = filterText.toLowerCase();
    return records.filter(row =>
      !lf || columns.some(col => String(row[col] ?? '').toLowerCase().includes(lf))
    );
  }, [records, columns, filterText]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Billing</Typography>
        <Typography>Please login to view your billing records.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
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

      <Typography variant="h5" sx={{ mb: 2 }}>Billing</Typography>

      {/* Balance display */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ color: balance !== null && balance < 0.05 ? 'warning.main' : 'text.primary' }}
        >
          {balance !== null ? `$${balance.toFixed(2)}` : '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current balance{balance !== null && balance < 0.05 ? ' — low, please add funds' : ''}
        </Typography>
        <AddFundsFlow />
        {discountCodes.length > 0 && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Active discounts:</strong> {discountCodes.join(', ')}
          </Typography>
        )}
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>Usage</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="From"
          type="date"
          size="small"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Search"
          size="small"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="Filter rows..."
          sx={{ minWidth: 200 }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error">Error loading billing records: {error}</Typography>
      )}

      {!loading && !error && records.length === 0 && (
        <Typography>No billing records found.</Typography>
      )}

      {!loading && !error && records.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {sorted.length} of {records.length} record{records.length !== 1 ? 's' : ''}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" aria-label="billing table">
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell
                      key={col}
                      onClick={() => handleSort(col)}
                      sx={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <strong>{camelToTitle(col)}</strong>
                        <SortIcon dir={sortField === col ? sortDir : null} />
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((row, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                    {columns.map(col => (
                      <TableCell key={col} sx={{ whiteSpace: 'nowrap' }}>
                        <CellContent col={col} value={row[col]} onSessionClick={handleLoadSession} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" color="warning" onClick={() => setRefundDialogOpen(true)}>
          Request Refund
        </Button>
      </Box>

      <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Refund</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Refund requests are not yet automated. To request a refund, please send an email to our support team and we will process it manually.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clicking the button below will open your email client with a pre-filled message. Please describe your refund request in the email body.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            component="a"
            href={`mailto:Leisureplansupport@gmail.com?subject=${encodeURIComponent(`Refund Requested - ${user?.sub ?? ''} - ${user?.name ?? user?.email ?? ''}`)}`}
            onClick={() => setRefundDialogOpen(false)}
          >
            Send Email to Support
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Billing;
