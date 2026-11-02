import { useAuth0 } from '@auth0/auth0-react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, CircularProgress,
  MenuItem, Paper, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { avatarChat, fetchProfile, saveAvatar, saveHandle } from '../api';
import AvatarPortrait from '../avatar/AvatarPortrait';
import { ACCOUTREMENTS, AVATAR_OPTIONS, normalizeAvatar } from '../avatar/avatarSchema';
import { FIELD_LABELS, OPTION_LABELS, STEPS, localPainterTurn } from '../avatar/localPainter';
import { fonts } from '../theme';
import { loadLocalProfile, saveLocalProfile } from '../wins';

const OPENING = "Welcome to the studio! I'm your portrait painter. Together we'll paint you full-length, the way Renaissance and Asian court artists painted their patrons — and as you make sensible money moves, I'll add symbolic keepsakes to the scene. " + STEPS[0].ask;

// What the member can say next, as tappable chips for the current step.
function suggestionsFor(stepIndex) {
  const step = STEPS[stepIndex];
  if (!step?.chipsFor) return [];
  const field = step.chipsFor;
  const values = AVATAR_OPTIONS[field].filter(v => v !== 'none').slice(0, 8);
  return [...values.map(v => OPTION_LABELS[field][v]), 'Surprise me'];
}

const PortraitStudio = () => {
  const theme = useTheme();
  const c = theme.palette.brand;
  const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0();

  const [avatar, setAvatar] = useState(() => loadLocalProfile().avatar);
  const [wins, setWins] = useState(() => loadLocalProfile().wins);
  const [handle, setHandle] = useState('');
  const [handleDraft, setHandleDraft] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: OPENING }]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    getAccessTokenSilently()
      .then(fetchProfile)
      .then(profile => {
        setAvatar(normalizeAvatar(profile.avatar));
        setWins(profile.wins ?? []);
        setHandle(profile.handle);
        setHandleDraft(profile.handle);
      })
      .catch(() => setNotice({ severity: 'info', text: "Couldn't load your saved portrait — showing this browser's copy." }));
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const applyAvatar = (next) => {
    // Accoutrements are earned, never chosen: keep whatever the member already has.
    setAvatar(prev => ({ ...normalizeAvatar(next), accoutrements: prev.accoutrements }));
    setDirty(true);
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const history = [...messages, { role: 'user', text: trimmed }];
    setMessages(history);
    setInput('');
    setThinking(true);

    // The offline painter always runs, so the conversation keeps its place in the steps
    // even when the server painter is the one answering.
    const local = localPainterTurn(trimmed, avatar, stepIndex);
    setStepIndex(local.stepIndex);
    let reply = local.reply;
    let next = local.avatar;
    if (isAuthenticated) {
      try {
        const token = await getAccessTokenSilently();
        const turn = await avatarChat(history, avatar, token);
        reply = turn.reply;
        next = turn.avatar;
      } catch {
        // Fall back to the offline painter's answer.
      }
    }
    applyAvatar(next);
    setMessages(m => [...m, { role: 'assistant', text: reply }]);
    setThinking(false);
  };

  const save = async () => {
    if (isAuthenticated) {
      try {
        const token = await getAccessTokenSilently();
        const profile = await saveAvatar(avatar, token);
        setAvatar(normalizeAvatar(profile.avatar));
        setDirty(false);
        setNotice({ severity: 'success', text: 'Portrait saved. It will appear next to your community posts.' });
      } catch (e) {
        setNotice({ severity: 'warning', text: `Couldn't save just now: ${e.message}` });
      }
      return;
    }
    saveLocalProfile({ avatar, wins });
    setDirty(false);
    setNotice({ severity: 'success', text: 'Saved in this browser. Log in to keep it everywhere and use it in the community.' });
  };

  const saveMyHandle = async () => {
    try {
      const token = await getAccessTokenSilently();
      const profile = await saveHandle(handleDraft, token);
      setHandle(profile.handle);
      setNotice({ severity: 'success', text: `You'll appear as ${profile.handle} in the community.` });
    } catch (e) {
      setNotice({ severity: 'warning', text: e.message });
    }
  };

  const earned = new Set(avatar.accoutrements);
  const winByKey = Object.fromEntries(wins.map(w => [w.accoutrement, w]));

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: c.parchment }}>
      <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>Your portrait</Typography>
        <Typography sx={{ color: c.inkSoft, mb: 3, maxWidth: 720 }}>
          Old portraits were full of symbols — a shield for protection, keys for a home, a laurel for a victory.
          Yours fills up the same way: every prudent money move you make earns a keepsake for the scene.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(300px, 400px) minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
          {/* Portrait column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 380 }}>
              <AvatarPortrait spec={avatar} size={380} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="contained" onClick={save} disabled={!dirty && isAuthenticated}>
                {dirty ? 'Save portrait' : 'Saved'}
              </Button>
              {!isAuthenticated && !isLoading && (
                <Button variant="outlined" onClick={() => loginWithRedirect()}>Log in to keep it</Button>
              )}
            </Box>

            <Accordion disableGutters elevation={0} sx={{ width: '100%', border: `1px solid ${c.line}`, borderRadius: '14px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>Fine-tune by hand</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <TextField
                  label="Portrait title"
                  size="small"
                  value={avatar.name}
                  onChange={e => applyAvatar({ ...avatar, name: e.target.value })}
                  inputProps={{ maxLength: 60 }}
                  sx={{ gridColumn: '1 / -1' }}
                />
                {Object.keys(AVATAR_OPTIONS).map(field => (
                  <TextField
                    key={field}
                    select
                    size="small"
                    label={FIELD_LABELS[field]}
                    value={avatar[field]}
                    onChange={e => applyAvatar({ ...avatar, [field]: e.target.value })}
                  >
                    {AVATAR_OPTIONS[field].map(v => (
                      <MenuItem key={v} value={v}>{OPTION_LABELS[field][v]}</MenuItem>
                    ))}
                  </TextField>
                ))}
              </AccordionDetails>
            </Accordion>

            {isAuthenticated && (
              <Paper elevation={0} sx={{ width: '100%', p: 2, border: `1px solid ${c.line}`, borderRadius: 3 }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Community name</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={handleDraft}
                    onChange={e => setHandleDraft(e.target.value)}
                    helperText="3–24 letters, numbers, _ - ."
                  />
                  <Button onClick={saveMyHandle} disabled={!handleDraft || handleDraft === handle} sx={{ alignSelf: 'flex-start' }}>
                    Save
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Painter chat + wins column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <Paper elevation={0} sx={{ border: `1px solid ${c.line}`, borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${c.line}`, bgcolor: c.surface }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700 }}>The painter</Typography>
                <Typography variant="body2" sx={{ color: c.inkSoft }}>
                  Describe yourself in your own words, or tap a suggestion.
                </Typography>
              </Box>
              <Box ref={scrollRef} sx={{ height: { xs: 320, md: 380 }, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {messages.map((m, i) => (
                  <Box key={i} sx={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    px: 1.75, py: 1.25,
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: m.role === 'user' ? c.tealSoft : c.goldSoft,
                    color: c.ink,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.text}
                  </Box>
                ))}
                {thinking && (
                  <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center', color: c.inkSoft }}>
                    <CircularProgress size={14} /> mixing pigments…
                  </Box>
                )}
              </Box>
              <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {suggestionsFor(stepIndex).map(s => (
                  <Chip key={s} label={s} size="small" variant="outlined" onClick={() => send(s)} disabled={thinking} />
                ))}
              </Box>
              <Box component="form" onSubmit={e => { e.preventDefault(); send(input); }} sx={{ display: 'flex', gap: 1, p: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={STEPS[stepIndex] ? 'e.g. "a plum Venetian gown with pearl trim"' : 'Ask for any change…'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  inputProps={{ maxLength: 600 }}
                />
                <Button type="submit" variant="contained" color="secondary" disabled={!input.trim() || thinking}>Send</Button>
              </Box>
            </Paper>

            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>Keepsakes &amp; wins</Typography>
              <Typography variant="body2" sx={{ color: c.inkSoft, mb: 1.5 }}>
                Tell the coach when you do something sensible — they'll recognise it and a keepsake appears in your portrait.{' '}
                <RouterLink to="/">Go to the coach</RouterLink>
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.25 }}>
                {Object.entries(ACCOUTREMENTS).map(([key, item]) => {
                  const has = earned.has(key);
                  const win = winByKey[key];
                  return (
                    <Tooltip key={key} title={win ? `Earned ${new Date(win.earnedAt).toLocaleDateString()}` : ''}>
                      <Paper elevation={0} sx={{
                        p: 1.5, borderRadius: 3,
                        border: `1px solid ${has ? c.gold : c.line}`,
                        bgcolor: has ? c.goldSoft : c.paper,
                        opacity: has ? 1 : 0.8,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {has ? <span aria-hidden>🏅</span> : <LockOutlinedIcon sx={{ fontSize: 16, color: c.inkSoft }} />}
                          <Typography sx={{ fontWeight: 700, fontFamily: fonts.display }}>{item.label}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: c.inkSoft, mt: 0.5 }}>
                          {win?.title || item.meaning}
                        </Typography>
                      </Paper>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar open={!!notice} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {notice ? <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.text}</Alert> : <span />}
      </Snackbar>
    </Box>
  );
};

export default PortraitStudio;
