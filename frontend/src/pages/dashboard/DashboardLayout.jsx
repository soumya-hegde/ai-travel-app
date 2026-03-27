import { Outlet } from "react-router-dom";
import DashboardTabs from "../../components/DashboardTabs";

export default function DashboardLayout() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardTabs />

      <div className="mx-auto max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
}
