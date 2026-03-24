import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

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

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
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
      </Routes>
    </div>
  );
}

export default App;
