import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useColorMode } from '../ColorModeContext';
import { useImpersonation } from '../ImpersonationContext';
import { cancelAccount, getDiscountCodes, putDiscountCodes } from '../api';

async function subToGuid(sub) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sub));
  const b = new Uint8Array(hash);
  const h = x => x.toString(16).padStart(2, '0');
  const d1 = [b[3],b[2],b[1],b[0]].map(h).join('');
  const d2 = [b[5],b[4]].map(h).join('');
  const d3 = [b[7],b[6]].map(h).join('');
  const d4 = Array.from(b.slice(8,10)).map(h).join('');
  const d5 = Array.from(b.slice(10,16)).map(h).join('');
  return `${d1}-${d2}-${d3}-${d4}-${d5}`;
}

const Settings = () => {
  const { mode, setMode } = useColorMode();
  const { isAdmin, impersonationEnabled, isImpersonating, impersonateSubject, setImpersonation } = useImpersonation();
  const { getAccessTokenSilently, logout, user } = useAuth0();
  const rawSub = isImpersonating ? impersonateSubject : (user?.sub ?? null);
  const [displayedUserId, setDisplayedUserId] = useState(null);

  useEffect(() => {
    if (!rawSub) { setDisplayedUserId(null); return; }
    subToGuid(rawSub).then(setDisplayedUserId);
  }, [rawSub]);

  const [lookupSub, setLookupSub] = useState('');
  const [lookupGuid, setLookupGuid] = useState(null);

  useEffect(() => {
    if (!lookupSub.trim()) { setLookupGuid(null); return; }
    subToGuid(lookupSub.trim()).then(setLookupGuid);
  }, [lookupSub]);
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
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const handleCancelAccount = async () => {
    setCanceling(true);
    setCancelError(null);
    try {
      const token = await getAccessTokenSilently();
      await cancelAccount(token);
      logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } });
    } catch (e) {
      setCancelError(e.message);
      setCanceling(false);
    }
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

      {isAdmin && displayedUserId && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isImpersonating ? 'Impersonated user' : 'User'} ID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {displayedUserId}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Cancel Account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Permanently cancels your account. This cannot be undone. Contact support to reactivate.
      </Typography>
      <Button variant="outlined" color="error" onClick={() => setCancelDialogOpen(true)}>
        Cancel Account
      </Button>
      {cancelError && <Alert severity="error" sx={{ mt: 1 }}>{cancelError}</Alert>}

      <Dialog open={cancelDialogOpen} onClose={() => !canceling && setCancelDialogOpen(false)}>
        <DialogTitle>Cancel your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently cancel your account. You will be logged out immediately and will need to contact support to reactivate.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={canceling}>Keep Account</Button>
          <Button onClick={handleCancelAccount} color="error" disabled={canceling}>
            {canceling ? 'Canceling…' : 'Yes, Cancel My Account'}
          </Button>
        </DialogActions>
      </Dialog>

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
                checked={impersonationEnabled}
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
          {impersonateSubject.trim() && impersonateSubject.trim() === user?.sub && (
            <Alert severity="warning" sx={{ mt: 1 }}>You cannot impersonate yourself.</Alert>
          )}

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

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            User ID Lookup
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Auth0 subject"
            placeholder="auth0|64f3a1b2c9d8e7f0a1b2c3d4"
            value={lookupSub}
            onChange={e => setLookupSub(e.target.value)}
          />
          {lookupGuid && (
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
              {lookupGuid}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default Settings;
