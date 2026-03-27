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
        <Route
          path="/dashboard"
          element={
            <RequireAuth permittedRoles={["user"]}>
              {" "}
              {/* Only 'user' can enter here */}
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
        <Route
          path="/agent-dashboard"
          element={
            <RequireAuth permittedRoles={["agent"]}>
              <AgentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="create-package" element={<CreatePackage />} />
          <Route path="my-packages" element={<MyPackages />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
