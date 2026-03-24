import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-3 flex gap-6 text-sm font-medium text-gray-600">
          <Link to="/dashboard/home">Home</Link>
          <Link to="/dashboard/bookings">Bookings</Link>
          <Link to="/dashboard/profile">Profile</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
}
