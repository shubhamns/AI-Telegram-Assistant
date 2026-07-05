import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingState from "@/components/common/LoadingState";
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
