import { useNavigate } from 'react-router-dom';
import { Box, Container, Fade, Paper, Typography } from '@mui/material';
import { InterestsForm } from '@/features/setup-interests';

/** Настройка интересов после регистрации. */
export function InterestsPage() {
  const navigate = useNavigate();
  const goToCatalog = () => navigate('/grants');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, background: 'linear-gradient(160deg, #e8f0fe 0%, #f5f7fb 60%)' }}>
      <Container maxWidth="sm">
        <Fade in appear timeout={500}>
          <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
              Что вам интересно?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Мы подберём конкурсы по вашим направлениям. Настройку можно пропустить и изменить позже в профиле.
            </Typography>
            <InterestsForm onSaved={goToCatalog} onSkip={goToCatalog} />
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
