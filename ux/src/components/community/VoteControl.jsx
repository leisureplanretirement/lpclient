import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

// Reddit-style vote control. Clicking your current vote clears it (direction 0).
// Optimistic: the score moves immediately and rolls back if the request fails.
// `onVote(direction)` must return a promise resolving to the server's new score.
// `canVote()` is called first; return false to stop (e.g. to prompt login).
// Parents should give this a `key` that changes when server data is refetched,
// so local state re-syncs from the props.
export default function VoteControl({ score = 0, myVote = 0, onVote, canVote, orientation = 'vertical', size = 'medium', disabled = false }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const [state, setState] = useState({ score, myVote });
  const [busy, setBusy] = useState(false);

  const click = async (dir) => {
    if (disabled || busy) return;
    if (canVote && !canVote()) return;
    const prev = state;
    const next = prev.myVote === dir ? 0 : dir;
    setState({ score: prev.score - prev.myVote + next, myVote: next });
    setBusy(true);
    try {
      const serverScore = await onVote(next);
      if (typeof serverScore === 'number') setState({ score: serverScore, myVote: next });
    } catch {
      setState(prev);
    } finally {
      setBusy(false);
    }
  };

  const up = state.myVote === 1;
  const down = state.myVote === -1;
  const vertical = orientation === 'vertical';
  const iconSize = size === 'small' ? 'small' : 'medium';
  const scoreColor = up ? b.coral : down ? b.plum : b.inkSoft;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        gap: vertical ? 0 : 0.25,
        minWidth: vertical ? 40 : undefined,
      }}
    >
      <Tooltip title={up ? 'Remove upvote' : 'Upvote'}>
        <span>
          <IconButton
            size="small"
            aria-label="Upvote"
            aria-pressed={up}
            disabled={disabled}
            onClick={() => click(1)}
            sx={{
              color: up ? b.coral : b.inkSoft,
              bgcolor: up ? alpha(b.coral, 0.14) : 'transparent',
              '&:hover': { color: b.coral, bgcolor: alpha(b.coral, 0.12) },
            }}
          >
            <ArrowUpwardRoundedIcon fontSize={iconSize} />
          </IconButton>
        </span>
      </Tooltip>
      <Typography
        variant="body2"
        aria-live="polite"
        sx={{ fontWeight: 700, color: scoreColor, minWidth: 20, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
      >
        {state.score}
      </Typography>
      <Tooltip title={down ? 'Remove downvote' : 'Downvote'}>
        <span>
          <IconButton
            size="small"
            aria-label="Downvote"
            aria-pressed={down}
            disabled={disabled}
            onClick={() => click(-1)}
            sx={{
              color: down ? b.plum : b.inkSoft,
              bgcolor: down ? alpha(b.plum, 0.14) : 'transparent',
              '&:hover': { color: b.plum, bgcolor: alpha(b.plum, 0.12) },
            }}
          >
            <ArrowDownwardRoundedIcon fontSize={iconSize} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
