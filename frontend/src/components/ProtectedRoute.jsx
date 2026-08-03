import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Usage :
// <ProtectedRoute><Account /></ProtectedRoute>
// <ProtectedRoute roles={["proprietaire", "admin"]}><OwnerDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-navy">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
