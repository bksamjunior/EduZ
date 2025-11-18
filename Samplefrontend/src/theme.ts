import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#555',
    },
    success: {
      main: '#4caf50', // green for good scores
    },
    error: {
      main: '#ffcccc', // light red for errors/bad scores
    },
    // Grayscale accents
    grey: {
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
