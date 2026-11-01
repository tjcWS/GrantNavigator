import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/entities/user';

/** Закрытые страницы: без входа отправляем на /registration. */
export function RequireAuth() {
  const { user } = useSession();
  const location = useLocation();
  if (!user) return <Navigate to="/registration" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
