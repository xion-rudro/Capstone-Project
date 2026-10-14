import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><span className="brand-mark">A</span><p>Loading your study space…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
