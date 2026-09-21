import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#26408B', dark: '#1A2C63', light: '#5B74B8' },
    secondary: { main: '#C9861A' },
    background: { default: '#F4F6FB', paper: '#FFFFFF' },
    text: { primary: '#1B2340', secondary: '#5A6280' },
    divider: '#DDE2EF',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.01em' },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiTextField: { defaultProps: { fullWidth: true } },
  },
});
