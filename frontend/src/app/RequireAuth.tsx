import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useSession } from '@/entities/user';

export function RequireAuth() {
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading) return <Box sx={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/registration" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
