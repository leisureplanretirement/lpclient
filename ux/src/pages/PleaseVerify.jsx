import { useAuth0 } from '@auth0/auth0-react';
import EmailIcon from '@mui/icons-material/Email';
import { Box, Button, Typography } from '@mui/material';

const PleaseVerify = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 3, p: 4, textAlign: 'center' }}>
      <EmailIcon sx={{ fontSize: 64, color: 'primary.main' }} />
      <Typography variant="h5">Check your email</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
        We sent a verification link to your email address. Click the link to verify your account, then come back and log in.
      </Typography>
      <Button variant="contained" onClick={() => loginWithRedirect()}>
        I've verified my email — Log in
      </Button>
    </Box>
  );
};

export default PleaseVerify;
