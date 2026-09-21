import { Outlet } from 'react-router-dom';
import { Box, Container, Stack, Typography } from '@mui/material';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';

// Каркас для страниц входа и первичной настройки: без верхнего меню, по центру.
export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, sm: 6 } }}>
      <Container maxWidth="sm">
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 3, color: 'primary.main' }}>
          <ExploreOutlinedIcon fontSize="large" />
          <Typography variant="h5" component="div">
            Грант.Навигатор
          </Typography>
        </Stack>
        <Outlet />
      </Container>
    </Box>
  );
}
