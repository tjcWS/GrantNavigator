import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { AppBar, Box, Button, Container, Fade, IconButton, Tab, Tabs, Toolbar, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSession } from '@/entities/user';
import { DemoControls } from './DemoControls';

const NAV = [
  { label: 'Конкурсы', to: '/grants' },
  { label: 'Проекты', to: '/projects' },
  { label: 'Заявки', to: '/applications' },
  { label: 'Профиль', to: '/profile' },
];

/** Общий каркас: шапка с навигацией + область страницы с плавной сменой экранов. */
export function AppLayout() {
  const { user, logout } = useSession();
  const { pathname } = useLocation();
  const current = NAV.find((item) => pathname.startsWith(item.to))?.to ?? false;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" fontWeight={800} component={RouterLink} to="/grants" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
            Грант.Навигатор
          </Typography>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Tooltip title="Выйти">
            <IconButton color="inherit" onClick={logout} aria-label="Выйти">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Container maxWidth="lg">
          <Tabs value={current} variant="scrollable" scrollButtons="auto" textColor="inherit" indicatorColor="secondary">
            {NAV.map((item) => (
              <Tab key={item.to} value={item.to} label={item.label} component={RouterLink} to={item.to} />
            ))}
          </Tabs>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* key меняется при смене адреса — страница плавно появляется заново */}
        <Fade in appear key={pathname} timeout={350}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
        <DemoControls />
      </Container>
    </Box>
  );
}
