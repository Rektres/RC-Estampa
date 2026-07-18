import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function RequireAdmin() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || user?.rol !== 'admin') {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}
