import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { createTopUpSession } from '../api';

const TIERS = [
  { label: '$10', priceId: import.meta.env.VITE_STRIPE_PRICE_10 },
  { label: '$25', priceId: import.meta.env.VITE_STRIPE_PRICE_25 },
  { label: '$50', priceId: import.meta.env.VITE_STRIPE_PRICE_50 },
];

const AddFundsFlow = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = async (priceId) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently();
      const { url } = await createTopUpSession(priceId, token);
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {loading ? (
          <CircularProgress size={28} />
        ) : (
          TIERS.map(({ label, priceId }) => (
            <Button
              key={label}
              variant="contained"
              onClick={() => handleSelect(priceId)}
            >
              {label}
            </Button>
          ))
        )}
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AddFundsFlow;
