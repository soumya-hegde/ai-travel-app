import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RequireAuth({ children, permittedRoles }) {
  const location = useLocation();
  const { token, role } = useSelector((state) => state.auth);

  // 1. If not logged in, send to login
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // 2. If logged in but role is not allowed for this route
  if (permittedRoles && !permittedRoles.includes(role)) {
    // Redirect agents to their dashboard, users to theirs
    if (role === "agent") return <Navigate to="/agent-dashboard" replace />;
    return <Navigate to="/" replace />; // Or a 403 Forbidden page
  }

  return children;
}
