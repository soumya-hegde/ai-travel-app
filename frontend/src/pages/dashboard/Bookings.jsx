import { useEffect, useState } from "react";
import API from "../../api/axios";
import ReviewModal from "../../components/ReviewModal"; // Make sure this path is correct
import { useAppModal } from "../../hooks/useAppModal";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- REVIEW MODAL STATE ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { showAlert } = useAppModal();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/view-booking");
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const reason = (reasons[id] || "").trim();
    if (!reason) {
      await showAlert({
        variant: "warning",
        title: "Reason required",
        message: "Please enter a cancellation reason before sending the request.",
      });
      return;
    }
    try {
      await API.post(`/bookings/${id}/cancel-request`, { reason });
      await showAlert({
        variant: "success",
        title: "Request sent",
        message: "Your cancellation request has been sent to the admin.",
      });
      setReasons((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      await showAlert({
        variant: "error",
        title: "Request failed",
        message: err.response?.data?.error || err.message,
      });
    }
  };

  // Function to trigger the Rating Modal
  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading bookings...</div>
    );
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Bookings</h2>
        <p className="text-sm text-gray-500">
          View and manage your upcoming trips
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {bookings.map((b) => {
              const isPastTrip = new Date(b.travelDate) < new Date();
              const isCancelled = b.status === "cancelled";
              const isCompleted = b.status === "completed";
              const canRequestCancel = b.status === "confirmed" && !isPastTrip;

              return (
                <tr
                  key={b._id}
                  className={isCancelled ? "bg-red-50/40 opacity-80" : ""}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {b.packageId?.packageName || "Package"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {new Date(b.travelDate).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    Rs. {b.totalAmount}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : isCancelled
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {b.status || "confirmed"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {canRequestCancel && (
                      <input
                        type="text"
                        placeholder="Reason for cancellation"
                        value={reasons[b._id] || ""}
                        onChange={(e) =>
                          setReasons((prev) => ({
                            ...prev,
                            [b._id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                      />
                    )}
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    {isCompleted && (
                      <button
                        onClick={() => handleOpenReviewModal(b)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition"
                      >
                        Rate Trip
                      </button>
                    )}

                    {b.status === "confirmed" && (
                      <button
                        onClick={() => cancelBooking(b._id)}
                        disabled={!canRequestCancel}
                        className={`rounded-lg px-4 py-2 text-white text-sm font-semibold transition ${
                          !canRequestCancel
                            ? "bg-red-200 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 shadow-sm"
                        }`}
                      >
                        Request Cancel
                      </button>
                    )}

                    {isCancelled && (
                      <span className="text-gray-400 text-xs italic">
                        Trip Cancelled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No bookings found.
          </div>
        )}
      </div>

      {/* --- RENDER REVIEW MODAL --- */}
      {showReviewModal && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => setShowReviewModal(false)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
}
