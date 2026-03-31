import { useAuth0 } from '@auth0/auth0-react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
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
import { fetchBillingRecords } from '../api';

function camelToTitle(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

function formatCell(key, value) {
  if (value === null || value === undefined) return '—';
  const lk = key.toLowerCase();
  if (lk.includes('timestamp') || lk.includes('date') || lk.includes('time')) {
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleString();
  }
  if ((lk.includes('amount') || lk.includes('cost') || lk.includes('total') || lk.includes('price')) && typeof value === 'number') {
    return `$${value.toFixed(4)}`;
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function SortIcon({ dir }) {
  if (dir === 'asc') return <ArrowUpwardIcon fontSize="inherit" />;
  if (dir === 'desc') return <ArrowDownwardIcon fontSize="inherit" />;
  return <UnfoldMoreIcon fontSize="inherit" sx={{ opacity: 0.4 }} />;
}

const Billing = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

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

  const columns = useMemo(() => {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
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
      <Typography variant="h5" sx={{ mb: 2 }}>Billing</Typography>

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
                        {formatCell(col, row[col])}
                      </TableCell>
                    ))}
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

export default Billing;
