import { Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import flairColor from './flairColor';

export default function FlairChip({ flair, size = 'small', selected = false, onClick }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const c = flair ? flairColor(flair, b) : b.teal;
  return (
    <Chip
      label={flair || 'All'}
      size={size}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      sx={{
        flexShrink: 0,
        fontWeight: 600,
        color: selected ? theme.palette.getContrastText(c) : c,
        bgcolor: selected ? c : alpha(c, 0.12),
        border: `1px solid ${alpha(c, selected ? 1 : 0.3)}`,
        '&:hover': onClick ? { bgcolor: selected ? c : alpha(c, 0.22) } : undefined,
      }}
    />
  );
}
