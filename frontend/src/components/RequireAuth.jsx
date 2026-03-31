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
    if (role === "agent") return <Navigate to="/agent-dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
