import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, Typography } from '@mui/material';

const AccountCanceled = () => {
  const { logout } = useAuth0();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2, p: 4, textAlign: 'center' }}>
      <Typography variant="h4">Account Canceled</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
        Your account has been canceled. Please contact support if you'd like to reactivate your account.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <a href="mailto:leisureplansupport@gmail.com">leisureplansupport@gmail.com</a>
      </Typography>
      <Button
        variant="outlined"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })}
      >
        Sign Out
      </Button>
    </Box>
  );
};

export default AccountCanceled;
