import { useAuth0 } from '@auth0/auth0-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';

const PostVerify = () => {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">Logging you in...</Typography>
    </Box>
  );
};

export default PostVerify;
