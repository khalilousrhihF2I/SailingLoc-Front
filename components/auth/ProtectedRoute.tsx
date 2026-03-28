import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../utils/getUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (allowedRoles && userType && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
