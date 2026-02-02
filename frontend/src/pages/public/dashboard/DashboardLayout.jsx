import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <>
      <nav className="flex justify-between p-4 shadow">
        <div className="space-x-4">
          <Link to="/dashboard">Home</Link>
          <Link to="/dashboard/bookings">Bookings</Link>
        </div>
        <Link to="/dashboard/profile">👤</Link>
      </nav>

      <Outlet />
    </>
  );
}
