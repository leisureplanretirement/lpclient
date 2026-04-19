import { useState } from 'react';
import { Box, Button, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const STORAGE_KEY = 'lp_cookie_notice_dismissed';

const CookieNotice = () => {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(STORAGE_KEY));

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1300,
      backgroundColor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider',
      px: 3,
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'wrap',
    }}>
      <Typography variant="body2" sx={{ flex: 1 }}>
        This site uses cookies for authentication and payment processing. No tracking or advertising cookies are used.{' '}
        <Link component={RouterLink} to="/privacy">Privacy Policy</Link>
      </Typography>
      <Button variant="contained" size="small" onClick={handleDismiss}>OK</Button>
    </Box>
  );
};

export default CookieNotice;
