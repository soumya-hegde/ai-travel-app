import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAppModal } from "../../hooks/useAppModal";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showConfirm } = useAppModal();

  const fetchAllBookings = async () => {
    try {
      const res = await API.get("/view-booking");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = await showConfirm({
      title: "Cancel this booking?",
      message:
        "This booking will be marked as cancelled and the action cannot be undone.",
      confirmLabel: "Yes, Cancel",
      cancelLabel: "Keep Booking",
    });

    if (!confirmed) {
      return;
    }

    try {
      await API.patch(`/cancel-booking/${id}`);
      await showAlert({
        variant: "success",
        title: "Booking cancelled",
        message: "The booking was cancelled successfully.",
      });
      fetchAllBookings();
    } catch (err) {
      await showAlert({
        variant: "error",
        title: "Cancellation failed",
        message:
          err.response?.data?.message || "Failed to cancel booking.",
      });
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Master Booking List</h2>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Package</th>
              <th className="p-4">Travel Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr
                key={b._id}
                className={b.status === "cancelled" ? "bg-red-50/40" : ""}
              >
                <td className="p-4 font-medium">
                  {b.userId?.username}
                  <br />
                  <span className="text-[10px] text-gray-400">
                    {b.userId?.email}
                  </span>
                </td>

                <td className="p-4">{b.packageId?.packageName}</td>

                <td className="p-4">
                  {new Date(b.travelDate).toLocaleDateString()}
                </td>

                <td className="p-4 font-bold">Rs. {b.totalAmount}</td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      b.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : b.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="p-4 text-right">
                  {b.status === "confirmed" ? (
                    <button
                      onClick={() => handleCancel(b._id)}
                      className="text-red-600 font-bold hover:underline"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      {b.status === "cancelled"
                        ? "Already cancelled"
                        : "No action available"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}
