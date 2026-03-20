import React, { useState } from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';

const ChatInput = ({ onSend, loading }) => {
  const [value, setValue] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, background: '#f5f5f5' }}>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your message..."
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading || !value.trim()}>
          Send
        </Button>
      </form>
    </Paper>
  );
};

export default ChatInput;
