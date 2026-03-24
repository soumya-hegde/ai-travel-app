import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      alert("Please enter a cancellation reason.");
      return;
    }

    try {
      await API.post(`/bookings/${id}/cancel-request`, { reason });
      alert("Cancel request sent to admin.");
      setReasons((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading bookings...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

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
            {Array.isArray(bookings) &&
              bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {b.packageId?.packageName || "Package"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(b.travelDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{b.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {b.status || "confirmed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => cancelBooking(b._id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-gray-300"
                    >
                      Request Cancel
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}
