import { Alert, Box, Button, CircularProgress, Divider, FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useColorMode } from '../ColorModeContext';
import { useImpersonation } from '../ImpersonationContext';
import { getDiscountCodes, putDiscountCodes } from '../api';

const Settings = () => {
  const { mode, setMode } = useColorMode();
  const { isAdmin, isImpersonating, impersonateSubject, setImpersonation } = useImpersonation();
  const { getAccessTokenSilently } = useAuth0();
  const [codesInput, setCodesInput] = useState('');
  const [codesLoading, setCodesLoading] = useState(false);
  const [codesSaving, setCodesSaving] = useState(false);
  const [codesSaveError, setCodesSaveError] = useState(null);
  const [codesSaveSuccess, setCodesSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setCodesLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const { codes } = await getDiscountCodes(token);
        setCodesInput((codes ?? []).join(', '));
      } catch {}
      setCodesLoading(false);
    };
    load();
  }, [isAdmin]);

  const handleSaveCodes = async () => {
    setCodesSaving(true);
    setCodesSaveError(null);
    setCodesSaveSuccess(false);
    try {
      const token = await getAccessTokenSilently();
      const codes = codesInput.split(',').map(s => s.trim()).filter(Boolean);
      const { codes: saved } = await putDiscountCodes(codes, token);
      setCodesInput((saved ?? []).join(', '));
      setCodesSaveSuccess(true);
    } catch (e) {
      setCodesSaveError(e.message);
    }
    setCodesSaving(false);
  };
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

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Discount Codes
          </Typography>

          {codesLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                label="Active codes (comma-separated)"
                placeholder="FREE, PROMO10"
                value={codesInput}
                onChange={e => { setCodesInput(e.target.value); setCodesSaveSuccess(false); }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveCodes}
                disabled={codesSaving}
                sx={{ mt: 1 }}
              >
                {codesSaving ? 'Saving…' : 'Save'}
              </Button>
              {codesSaveSuccess && (
                <Alert severity="success" sx={{ mt: 1 }}>Saved.</Alert>
              )}
              {codesSaveError && (
                <Alert severity="error" sx={{ mt: 1 }}>{codesSaveError}</Alert>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Settings;
