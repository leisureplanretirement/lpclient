import { Box, IconButton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// A gentle note shown beside a composer, e.g. when moderation asks the member to rephrase.
// Deliberately calm (gold-soft, leaf icon) rather than an alarming red error.
export default function ComposerNotice({ message, onClose, title = 'A gentle nudge' }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  if (!message) return null;
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-start',
        p: 1.5,
        borderRadius: 3,
        bgcolor: b.goldSoft,
        border: `1px solid ${alpha(b.gold, 0.45)}`,
        color: b.ink,
      }}
    >
      <SpaRoundedIcon sx={{ color: b.gold, mt: 0.25 }} fontSize="small" />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: b.inkSoft, whiteSpace: 'pre-wrap' }}>{message}</Typography>
        <Typography variant="caption" sx={{ color: b.inkSoft, display: 'block', mt: 0.5 }}>
          Your draft is still here — tweak it and try again.
        </Typography>
      </Box>
      {onClose && (
        <IconButton size="small" aria-label="Dismiss" onClick={onClose} sx={{ color: b.inkSoft }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
