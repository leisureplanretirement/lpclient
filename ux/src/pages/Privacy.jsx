import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Privacy = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/Legal/PrivacyPolicy.md')
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(setContent)
      .catch(() => setError(true));
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800, overflowY: 'auto', height: '100%' }}>
      {error && <Typography color="error">Failed to load privacy policy.</Typography>}
      {!content && !error && <CircularProgress />}
      {content && <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>}
    </Box>
  );
};

export default Privacy;
