import React from 'react';
import { LinearProgress, Box } from '@mui/material';

const PollingProgressBar = ({ pollCount, maxPolls, loading }) => {
  if (!loading) return null;
  const value = maxPolls ? Math.min((pollCount / maxPolls) * 100, 100) : 0;
  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress variant="determinate" value={value} />
    </Box>
  );
};

export default PollingProgressBar;
