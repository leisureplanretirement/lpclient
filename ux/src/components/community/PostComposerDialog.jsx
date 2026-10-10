import { useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel,
  MenuItem, Select, TextField, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ComposerNotice from './ComposerNotice';
import describeSubmitError from './composerErrors';

const TITLE_MIN = 5;
const TITLE_MAX = 140;
const BODY_MAX = 10000;

function Count({ value, max, min }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const over = value > max;
  const under = min != null && value > 0 && value < min;
  return (
    <Typography component="span" variant="caption" sx={{ color: over ? b.coral : under ? b.gold : b.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
      {value.toLocaleString()} / {max.toLocaleString()}
    </Typography>
  );
}

// New-post composer. `onSubmit({ title, body, flair })` should return a promise; a rejected
// ModerationError shows a gentle note and keeps the draft so the member can edit it.
export default function PostComposerDialog({ open, onClose, flairs = [], defaultFlair, onSubmit }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [flair, setFlair] = useState(defaultFlair || '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const chosenFlair = flair || defaultFlair || flairs[0] || '';
  const t = title.trim().length;
  const bl = body.trim().length;
  const valid = t >= TITLE_MIN && t <= TITLE_MAX && bl > 0 && body.length <= BODY_MAX && !!chosenFlair;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), body, flair: chosenFlair });
      setTitle('');
      setBody('');
      setFlair('');
    } catch (err) {
      const r = describeSubmitError(err);
      setNotice(r.notice ?? null);
      setError(r.error ?? null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Start a conversation</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I start an emergency fund on a small salary?"
            fullWidth
            autoFocus
            error={title.length > TITLE_MAX}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <span>{t > 0 && t < TITLE_MIN ? `At least ${TITLE_MIN} characters` : ' '}</span>
                <Count value={title.length} max={TITLE_MAX} min={TITLE_MIN} />
              </Box>
            }
          />
          <FormControl fullWidth>
            <InputLabel id="forum-flair-label">Topic</InputLabel>
            <Select
              labelId="forum-flair-label"
              label="Topic"
              value={flairs.includes(chosenFlair) ? chosenFlair : ''}
              onChange={(e) => setFlair(e.target.value)}
            >
              {flairs.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="What’s on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share as much or as little as you like. No question is too basic here."
            fullWidth
            multiline
            minRows={6}
            maxRows={16}
            error={body.length > BODY_MAX}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <span>Plain text. Be kind — critique ideas, not people.</span>
                <Count value={body.length} max={BODY_MAX} />
              </Box>
            }
          />
          <ComposerNotice message={notice} onClose={() => setNotice(null)} />
          {error && <Alert severity="info" onClose={() => setError(null)}>{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>Keep for later</Button>
        <Button variant="contained" onClick={submit} disabled={!valid || busy}>
          {busy ? 'Posting…' : 'Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
