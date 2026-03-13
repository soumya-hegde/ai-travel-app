import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div>
      <nav className="flex gap-4 p-4 border-b">
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/bookings">Bookings</Link>
      </nav>

      {/* CHILD ROUTES RENDER HERE */}
      <Outlet />
    </div>
  );
}
