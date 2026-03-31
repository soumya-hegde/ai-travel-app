import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ForgotPassword from "./pages/ForgotPassword";

import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Bookings from "./pages/dashboard/Bookings";
import Profile from "./pages/dashboard/Profile";
import PackageDetails from "./pages/dashboard/PackageDetails";
import AgentProfile from "./pages/agent/AgentProfile";
import AgentLayout from "./pages/agent/AgentLayout";
import CreatePackage from "./pages/agent/CreatePackage";
import MyPackages from "./pages/agent/MyPackages";
import AgentOverview from "./pages/agent/AgentOverview";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";

function App() {
  const token = useSelector((state) => state.auth.token);

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard/home" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard/home" />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- USER DASHBOARD --- */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth permittedRoles={["user"]}>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="package/:id" element={<PackageDetails />} />
        </Route>

        {/* --- AGENT DASHBOARD --- */}
        <Route
          path="/agent-dashboard"
          element={
            <RequireAuth permittedRoles={["agent"]}>
              <AgentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<AgentOverview />} />
          <Route path="create-package" element={<CreatePackage />} />
          <Route path="my-packages" element={<MyPackages />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>

        {/* --- ADMIN DASHBOARD --- */}
        <Route
          path="/admin-dashboard"
          element={
            <RequireAuth permittedRoles={["admin"]}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="packages" replace />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="home" element={<AdminDashboardHome />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
