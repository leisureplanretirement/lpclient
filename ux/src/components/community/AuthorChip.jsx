import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AvatarPortrait from '../../avatar/AvatarPortrait';
import timeAgo from './timeAgo';

// Small portrait (or initial circle) + handle, with an optional relative time.
export default function AuthorChip({ author, createdAt, size = 44, isMe = false }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const handle = author?.handle || 'member';
  const initial = handle.trim().charAt(0).toUpperCase() || '?';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          // Portraits are tall (5:7); a rounded square tile shows the head and shoulders.
          borderRadius: author?.avatar ? '30%' : '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: author?.avatar ? 'flex-start' : 'center',
          justifyContent: 'center',
          bgcolor: author?.avatar ? b.goldSoft : b.tealSoft,
          border: `1px solid ${b.line}`,
        }}
      >
        {author?.avatar ? (
          <AvatarPortrait spec={author.avatar} size={size} showFrame={false} showCaption={false} />
        ) : (
          <Typography
            aria-hidden
            sx={{ fontFamily: theme.typography.h1.fontFamily, fontWeight: 700, color: b.teal, fontSize: size * 0.42, lineHeight: 1 }}
          >
            {initial}
          </Typography>
        )}
      </Box>
      <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: b.ink }} noWrap>
          {handle}
          {isMe && (
            <Typography component="span" variant="caption" sx={{ ml: 0.5, color: b.teal, fontWeight: 600 }}>
              (you)
            </Typography>
          )}
        </Typography>
        {createdAt && (
          <Typography
            variant="caption"
            component="time"
            dateTime={createdAt}
            title={new Date(createdAt).toLocaleString()}
            sx={{ color: b.inkSoft }}
          >
            {timeAgo(createdAt)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
