import { useEffect, useState } from "react";
import API from "../../api/axios";
import PackageCard from "../../components/PackageCard";
import {
  LayoutGrid,
  List,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Backend now populates createdBy.username thanks to your update
      const res = await API.get("/view-package");
      setPackages(res.data || []);
    } catch (err) {
      console.error("Error fetching packages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // --- Action Handlers ---
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this itinerary?")) return;
    try {
      await API.patch(`/approve-package/${id}`);
      fetchPackages();
    } catch (err) {
      alert("Approval failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      await API.patch(`/reject-package/${id}`, { rejectionReason: reason });
      fetchPackages();
    } catch (err) {
      alert("Rejection failed");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await API.patch("/package/bulk-approval", { packageIds: selectedIds });
      setSelectedIds([]);
      fetchPackages();
    } catch (err) {
      alert("Bulk approval failed");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="animate-pulse">Loading itineraries...</div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Itinerary Approvals
          </h2>
          <p className="text-sm text-gray-500">
            Manage and review agent submissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition ${viewMode === "table" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              title="Table View"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 transition ${viewMode === "cards" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              title="Card View"
            >
              <LayoutGrid size={20} />
            </button>
          </div>

          {/* Bulk Action Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-md transition-all animate-in fade-in zoom-in-95"
            >
              Approve Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODES */}
      {viewMode === "table" ? (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Package Details</th>
                  <th className="p-4">Agent</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {packages.map((pkg) => (
                  <tr
                    key={pkg._id}
                    className={`${selectedIds.includes(pkg._id) ? "bg-indigo-50/50" : "hover:bg-gray-50 transition"}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        disabled={pkg.status !== "pending"} // Disabled if not pending
                        checked={selectedIds.includes(pkg._id)}
                        onChange={() => toggleSelect(pkg._id)}
                        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${pkg.status !== "pending" ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">
                        {pkg.packageName}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {pkg.createdBy?.username || "Admin/System"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {pkg.packageDestination}
                    </td>
                    <td className="p-4 text-gray-600">
                      {pkg.packageDays} Days
                    </td>
                    <td className="p-4 font-bold text-blue-700">
                      ₹{pkg.packagePrice}
                    </td>
                    <td className="p-4">
                      <span
                        className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight
                        ${
                          pkg.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : pkg.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {pkg.status === "pending" && <Clock size={12} />}
                        {pkg.status === "approved" && <CheckCircle size={12} />}
                        {pkg.status === "rejected" && <XCircle size={12} />}
                        {pkg.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {pkg.status === "pending" ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleApprove(pkg._id)}
                            className="text-green-600 hover:bg-green-50 p-2 rounded-full transition"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(pkg._id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs px-2">
                          Handled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {packages.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <AlertCircle className="mx-auto mb-2 opacity-20" size={48} />
              No itineraries to display.
            </div>
          )}
        </div>
      ) : (
        /* CARD VIEW: Similar to Home Page */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg._id} className="relative group">
              {/* Show status badge overlay on top of card */}
              <div
                className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-lg border
                  ${
                    pkg.status === "approved"
                      ? "bg-green-500 text-white border-green-400"
                      : pkg.status === "rejected"
                        ? "bg-red-500 text-white border-red-400"
                        : "bg-amber-500 text-white border-amber-400"
                  }`}
              >
                {pkg.status}
              </div>
              <PackageCard id={pkg._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
