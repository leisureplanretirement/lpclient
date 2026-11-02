import { alpha, createTheme } from '@mui/material/styles';

// "Gilded Calm": warm parchment and deep teal for steadiness, coral for warmth, and a touch of
// gold leaf borrowed from Renaissance portraiture for moments of recognition (wins, portraits).
export const brand = {
  light: {
    ink: '#2a2238',
    inkSoft: '#5f5672',
    parchment: '#fbf6ec',
    paper: '#ffffff',
    surface: '#f4ede0',
    teal: '#1f6f6b',
    tealSoft: '#d7ece8',
    coral: '#e07a5f',
    coralSoft: '#fbe3da',
    gold: '#b8902a',
    goldSoft: '#f6ebcd',
    plum: '#6d3b6f',
    line: '#e6dccb',
  },
  dark: {
    ink: '#f3ecdf',
    inkSoft: '#b9afc6',
    parchment: '#16131f',
    paper: '#1f1b2b',
    surface: '#262134',
    teal: '#5fbfb5',
    tealSoft: '#1d3735',
    coral: '#f0957c',
    coralSoft: '#3b2421',
    gold: '#e2bd5a',
    goldSoft: '#3a3020',
    plum: '#c79ad0',
    line: '#352e45',
  },
};

export const fonts = {
  display: '"Fraunces", "Georgia", serif',
  body: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
};

export const createAppTheme = (mode) => {
  const c = brand[mode === 'dark' ? 'dark' : 'light'];
  return createTheme({
    palette: {
      mode,
      primary: { main: c.teal, contrastText: mode === 'dark' ? '#0f1f1e' : '#ffffff' },
      secondary: { main: c.coral, contrastText: mode === 'dark' ? '#2a1510' : '#ffffff' },
      warning: { main: c.gold },
      background: { default: c.parchment, paper: c.paper },
      text: { primary: c.ink, secondary: c.inkSoft },
      divider: c.line,
      brand: c,
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: fonts.body,
      h1: { fontFamily: fonts.display, fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.01em' },
      h2: { fontFamily: fonts.display, fontWeight: 650, fontSize: '2rem', letterSpacing: '-0.01em' },
      h3: { fontFamily: fonts.display, fontWeight: 650, fontSize: '1.6rem' },
      h4: { fontFamily: fonts.display, fontWeight: 650, fontSize: '1.35rem' },
      h5: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.15rem' },
      h6: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.05rem' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: c.parchment },
          a: { color: c.teal },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 18 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 500 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, border: `1px solid ${c.line}` },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: c.paper,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(c.teal, 0.6) },
          },
          notchedOutline: { borderColor: c.line },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: c.ink, color: c.parchment, fontSize: '0.8rem' },
        },
      },
    },
  });
};
