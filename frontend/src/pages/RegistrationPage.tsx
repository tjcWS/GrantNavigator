import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Box, Container, Fade, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useSession } from '@/entities/user';
import { LoginForm, RegisterForm } from '@/features/auth';

type Mode = 'login' | 'register';

/** Экран входа и регистрации: две формы в одной карточке с плавным переключением. */
export function RegistrationPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');

  if (user) return <Navigate to="/grants" replace />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, background: 'linear-gradient(160deg, #e8f0fe 0%, #f5f7fb 60%)' }}>
      <Container maxWidth="sm">
        <Fade in appear timeout={500}>
          <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h4" fontWeight={800} color="primary" align="center">
              Грант.Навигатор
            </Typography>
            <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
              Поиск конкурсов, подготовка заявок и ИИ-проверка в одном месте
            </Typography>

            <Tabs value={mode} onChange={(_, v: Mode) => setMode(v)} variant="fullWidth" sx={{ mb: 3 }}>
              <Tab value="login" label="Вход" />
              <Tab value="register" label="Регистрация" />
            </Tabs>

            <Fade in key={mode} timeout={350}>
              <Box>
                {mode === 'login' ? (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Демо-доступ: логин <b>demo</b>, пароль <b>demo12345</b>
                    </Alert>
                    <LoginForm onSuccess={() => navigate('/grants')} />
                  </>
                ) : (
                  <RegisterForm onSuccess={() => navigate('/interests')} />
                )}
              </Box>
            </Fade>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
