import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios";

export default function MyPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    const fetchMyPackages = async () => {
      try {
        const res = await API.get("/view-package"); // Backend returns all for agent
        setPackages(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPackages();
  }, []);

  const getStatusColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const myPackages = useMemo(() => {
    if (!userId) return packages;
    return packages.filter((pkg) => {
      const creator = pkg.createdBy?._id || pkg.createdBy;
      return String(creator) === String(userId);
    });
  }, [packages, userId]);

  if (loading)
    return <div className="text-center p-10">Loading your itineraries...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {myPackages.map((pkg) => (
        <div key={pkg._id} className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold">{pkg.packageName}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(pkg.status)}`}
            >
              {pkg.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{pkg.packageDestination}</p>
          <div className="mt-4 flex justify-between items-center border-t pt-3">
            <span className="font-bold text-blue-600">₹{pkg.packagePrice}</span>
            {pkg.status === "rejected" && (
              <p className="text-xs text-red-500 italic">
                Reason: {pkg.rejectionReason}
              </p>
            )}
          </div>
        </div>
      ))}
      {myPackages.length === 0 && (
        <p className="text-gray-500 col-span-2 text-center">
          No itineraries created yet.
        </p>
      )}
    </div>
  );
}
