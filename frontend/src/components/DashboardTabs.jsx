import { useLocation, useNavigate } from "react-router-dom";
import { Home, Book, User } from "lucide-react";

export default function DashboardTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: "Home", path: "/dashboard/home", icon: Home },
    { name: "Bookings", path: "/dashboard/bookings", icon: Book },
    // { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  return (
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
                className={`flex items-center gap-2 py-4 text-sm font-medium transition relative
                  ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
              >
                <Icon size={18} />

                {tab.name}

                {/* Active underline */}
                <span
                  className={`absolute left-0 bottom-0 h-[3px] w-full rounded-full transition-all duration-300
                    ${isActive ? "bg-blue-600 scale-x-100" : "scale-x-0"}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
