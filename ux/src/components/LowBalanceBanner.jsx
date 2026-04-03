import { Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LowBalanceBanner = () => {
  const navigate = useNavigate();
  return (
    <Alert
      severity="warning"
      action={
        <Button size="small" color="inherit" onClick={() => navigate('/billing')}>
          Add Funds
        </Button>
      }
    >
      Insufficient balance. Please add funds to continue.
    </Alert>
  );
};

export default LowBalanceBanner;
