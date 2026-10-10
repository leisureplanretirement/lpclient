import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function ConfirmDeleteDialog({ open, what = 'post', busy = false, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Delete this {what}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This can’t be undone. Any replies from others will stay, with your {what} shown as removed.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit" disabled={busy}>Keep it</Button>
        <Button onClick={onConfirm} variant="contained" color="secondary" disabled={busy}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
