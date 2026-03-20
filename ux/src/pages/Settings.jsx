import { Alert, Box, Divider, FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import { useColorMode } from '../ColorModeContext';
import { useImpersonation } from '../ImpersonationContext';

const Settings = () => {
  const { mode, setMode } = useColorMode();
  const { isAdmin, isImpersonating, impersonateSubject, setImpersonation } = useImpersonation();
  const isDarkMode = mode === 'dark';

  return (
    <Box sx={{ p: 3, maxWidth: 480 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Settings</Typography>

      <FormControlLabel
        control={
          <Switch
            checked={isDarkMode}
            onChange={e => setMode(e.target.checked ? 'dark' : 'light')}
          />
        }
        label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
      />

      {isAdmin && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Impersonation
          </Typography>

          {isImpersonating && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Active — viewing data as {impersonateSubject}. Write operations are disabled.
            </Alert>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={isImpersonating}
                onChange={e => setImpersonation({ enabled: e.target.checked })}
              />
            }
            label="Impersonation"
          />

          <TextField
            fullWidth
            size="small"
            label="Auth0 Subject"
            placeholder="auth0|64f3a1b2c9d8e7f0a1b2c3d4"
            value={impersonateSubject}
            onChange={e => setImpersonation({ subject: e.target.value })}
            sx={{ mt: 2 }}
          />
        </>
      )}
    </Box>
  );
};

export default Settings;
