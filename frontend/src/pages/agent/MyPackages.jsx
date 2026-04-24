import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/axios";

export default function MyPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.auth.user?._id);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPackages = async () => {
      try {
        const res = await API.get("/view-package");
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

  if (loading) {
    return <div className="text-center p-10">Loading your itineraries...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {myPackages.map((pkg) => {
        const canEdit = pkg.status === "pending" || pkg.status === "rejected";

        return (
          <div
            key={pkg._id}
            className="bg-white border rounded-xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold">{pkg.packageName}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {pkg.packageDestination}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(pkg.status)}`}
              >
                {pkg.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="font-bold text-blue-600">
                Rs. {pkg.packagePrice}
              </span>

              {canEdit ? (
                <button
                  onClick={() =>
                    navigate(`/agent-dashboard/edit-package/${pkg._id}`)
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
                >
                  Edit Itinerary
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Approved itineraries are locked
                </span>
              )}
            </div>

            {pkg.status === "rejected" && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Rejection Reason
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {pkg.rejectionReason || "No reason provided"}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {myPackages.length === 0 && (
        <p className="text-gray-500 col-span-2 text-center">
          No itineraries created yet.
        </p>
      )}
    </div>
  );
}
