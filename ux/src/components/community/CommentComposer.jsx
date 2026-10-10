import { useState } from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ComposerNotice from './ComposerNotice';
import describeSubmitError from './composerErrors';

const COMMENT_MAX = 5000;

// Comment / reply box. `onSubmit(body)` returns a promise; on success the box clears,
// on moderation rejection a gentle note appears and the draft is kept.
export default function CommentComposer({ onSubmit, onCancel, placeholder = 'Add a thoughtful reply…', submitLabel = 'Comment', autoFocus = false }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const valid = body.trim().length > 0 && body.length <= COMMENT_MAX;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      await onSubmit(body);
      setBody('');
    } catch (err) {
      const r = describeSubmitError(err);
      setNotice(r.notice ?? null);
      setError(r.error ?? null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextField
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
        placeholder={placeholder}
        multiline
        minRows={2}
        maxRows={12}
        fullWidth
        autoFocus={autoFocus}
        error={body.length > COMMENT_MAX}
        size="small"
      />
      <ComposerNotice message={notice} onClose={() => setNotice(null)} />
      {error && <Alert severity="info" onClose={() => setError(null)}>{error}</Alert>}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: body.length > COMMENT_MAX ? b.coral : b.inkSoft, flex: 1, fontVariantNumeric: 'tabular-nums' }}>
          {body.length > 0 ? `${body.length.toLocaleString()} / ${COMMENT_MAX.toLocaleString()}` : ''}
        </Typography>
        {onCancel && <Button size="small" color="inherit" onClick={onCancel} disabled={busy}>Cancel</Button>}
        <Button size="small" variant="contained" onClick={submit} disabled={!valid || busy}>
          {busy ? 'Sending…' : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
