import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Package, BookOpen } from "lucide-react";
import { BarChart3 } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Home", path: "/admin-dashboard/home", icon: BarChart3 },
    {
      name: "Manage Itineraries",
      path: "/admin-dashboard/packages",
      icon: Package,
    },
    { name: "All Bookings", path: "/admin-dashboard/bookings", icon: BookOpen },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b shadow-sm sticky top-[64px] z-40">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 py-4 text-sm font-semibold transition relative ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
              >
                <Icon size={18} />
                {tab.name}
                {isActive && (
                  <span className="absolute left-0 bottom-0 h-[3px] w-full bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-6">
        <Outlet />
      </div>
    </div>
  );
}
