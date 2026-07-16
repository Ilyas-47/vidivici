import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: ('superadmin' | 'admin' | 'subadmin' | 'customer')[];
}

export function ProtectedRoute({ allowedRoles = ['superadmin', 'admin', 'subadmin'] }: ProtectedRouteProps) {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  // Si non connecté, redirection vers login
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si un rôle est requis et que le profil ne l'a pas, rediriger vers une page "non autorisé" ou accueil
  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />; // ou une page 403
  }

  return <Outlet />;
}
