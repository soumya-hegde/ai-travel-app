import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FolderHeart,
  UserCog,
  Users,
} from "lucide-react";

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Overview", path: "/agent-dashboard/home", icon: LayoutDashboard },
    {
      name: "Create Itinerary",
      path: "/agent-dashboard/create-package",
      icon: PlusCircle,
    },
    {
      name: "My Itineraries",
      path: "/agent-dashboard/my-packages",
      icon: FolderHeart,
    },
    {
      name: "Customer Bookings",
      path: "/agent-dashboard/bookings",
      icon: Users,
    }, // Add this
    { name: "Profile", path: "/agent-dashboard/profile", icon: UserCog },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium transition relative ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                  {isActive && (
                    <span className="absolute left-0 bottom-0 h-[3px] w-full bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-6">
        <Outlet />
      </div>
    </div>
  );
}
