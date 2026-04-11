import { useEffect, useState } from "react";
import API from "../../api/axios";
import PackageCard from "../../components/PackageCard";
import usePackages from "../../context/usePackages";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function AdminDashboardHome() {
  const { setPackages: setGlobalPackages } = usePackages();
  const [localPackages, setLocalPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await API.get("/view-package");
        const data = res.data || [];
        setLocalPackages(data);
        setGlobalPackages(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [setGlobalPackages]);

  const approved = localPackages.filter((p) => p.status === "approved");
  const pending = localPackages.filter((p) => p.status === "pending");
  const rejected = localPackages.filter((p) => p.status === "rejected");

  const chartData = [
    { name: "Approved", value: approved.length, color: "#22c55e" },
    { name: "Pending", value: pending.length, color: "#f59e0b" },
    { name: "Rejected", value: rejected.length, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const gridClass =
    "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading Analytics...</div>
    );

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* 1. PIE CHART SECTION */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Itinerary Distribution
        </h3>
        <div className="h-64 w-full max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. APPROVED SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Approved Itineraries
          </h2>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            {approved.length}
          </span>
        </div>
        <div className={gridClass}>
          {approved.map((pkg) => (
            <PackageCard
              key={pkg._id}
              id={pkg._id}
              to={`/admin-dashboard/package/${pkg._id}`}
            />
          ))}
          {approved.length === 0 && (
            <p className="text-gray-400 col-span-full">
              No approved packages found.
            </p>
          )}
        </div>
      </section>

      {/* 3. PENDING SECTION */}
      <section className="pt-10 border-t">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Pending Approvals
          </h2>
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            {pending.length}
          </span>
        </div>
        <div className={gridClass}>
          {pending.map((pkg) => (
            <PackageCard
              key={pkg._id}
              id={pkg._id}
              to={`/admin-dashboard/package/${pkg._id}`}
            />
          ))}
          {pending.length === 0 && (
            <p className="text-gray-400 col-span-full">No pending requests.</p>
          )}
        </div>
      </section>

      {/* 4. REJECTED SECTION */}
      <section className="pt-10 border-t">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Rejected / Cancelled
          </h2>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            {rejected.length}
          </span>
        </div>
        <div className={gridClass}>
          {rejected.map((pkg) => (
            <PackageCard
              key={pkg._id}
              id={pkg._id}
              to={`/admin-dashboard/package/${pkg._id}`}
            />
          ))}
          {rejected.length === 0 && (
            <p className="text-gray-400 col-span-full">No rejected packages.</p>
          )}
        </div>
      </section>
    </div>
  );
}
