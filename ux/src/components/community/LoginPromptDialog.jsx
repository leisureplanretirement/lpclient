import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// Shown when a logged-out reader tries to vote, post or reply.
export default function LoginPromptDialog({ open, onClose, onLogin }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Join the conversation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Reading is open to everyone. To vote, post or reply, log in or create a free account — it only takes a moment.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Not now</Button>
        <Button variant="contained" onClick={() => { onClose(); onLogin(); }} autoFocus>Log in</Button>
      </DialogActions>
    </Dialog>
  );
}
