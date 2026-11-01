import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SessionProvider } from '@/entities/user';
import { NotifierProvider } from '@/shared/ui';
import { AppRouter } from './router';
import { theme } from './theme';

/** Корень приложения: тема, уведомления, сессия пользователя, маршрутизация. */
export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotifierProvider>
        <SessionProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </SessionProvider>
      </NotifierProvider>
    </ThemeProvider>
  );
}
