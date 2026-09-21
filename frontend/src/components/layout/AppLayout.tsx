import { useState, type MouseEvent } from 'react';
import { Link as RouterLink, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { label: 'Каталог конкурсов', to: '/grants' },
  { label: 'Мои проекты', to: '/projects' },
  { label: 'Мои заявки', to: '/applications' },
];

// Каркас основных страниц: верхняя панель + контент страницы
export default function AppLayout() {
  const navigate = useNavigate();
  const { profile } = useApp();
  const [navAnchor, setNavAnchor] = useState<HTMLElement | null>(null);
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);

  const go = (to: string) => {
    setNavAnchor(null);
    setUserAnchor(null);
    navigate(to);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <IconButton
              aria-label="Открыть меню"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={(e: MouseEvent<HTMLElement>) => setNavAnchor(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>
            <Stack
              component={RouterLink}
              to="/grants"
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ color: 'primary.main', textDecoration: 'none', mr: 2 }}
            >
              <ExploreOutlinedIcon />
              <Typography variant="h6" component="span">
                Грант.Навигатор
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  color="inherit"
                  sx={{ '&.active': { bgcolor: 'action.selected', color: 'primary.main' } }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
            <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

            <IconButton aria-label="Меню пользователя" onClick={(e: MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
              </Avatar>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu anchorEl={navAnchor} open={Boolean(navAnchor)} onClose={() => setNavAnchor(null)}>
        {NAV_ITEMS.map((item) => (
          <MenuItem key={item.to} onClick={() => go(item.to)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
        <MenuItem onClick={() => go('/profile')}>Профиль и настройки</MenuItem>
        <MenuItem onClick={() => go('/registration')}>Выйти</MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
