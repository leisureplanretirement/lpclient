import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#388e3c',
    },
    secondary: {
      main: mode === 'dark' ? '#64b5f6' : '#1976d2',
    },
    ...(mode === 'light' && {
      background: {
        default: '#f5f5f5',
        paper: '#fff',
      },
    }),
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
  },
});
