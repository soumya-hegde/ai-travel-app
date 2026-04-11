import { useEffect, useState } from "react";
import API from "../../api/axios";
import { User, Mail, Calendar, Tag } from "lucide-react";

export default function AgentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/view-booking");
        // Your backend already filters by agentId if the role is 'agent'
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Error fetching bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading customer bookings...
      </div>
    );

  const getPaidAmount = (booking) => {
    const pkg = booking.packageId || {};
    const price = Number(pkg.packagePrice || 0);
    const discount = Number(pkg.packageDiscountPrice || 0);

    // If offer is enabled and discount is valid, subtract it
    if (pkg.packageOffer === true && discount > 0) {
      return Math.max(price - discount, 0);
    }

    // Otherwise show full price
    if (price > 0) return price;

    // Fallback
    return booking.totalAmount || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Customer Bookings</h2>
        <p className="text-sm text-gray-500">
          Manage people who have booked your itineraries
        </p>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-600 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Package</th>
              <th className="p-4">Travel Date</th>
              <th className="p-4">Booking Value</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {b.userId?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {b.userId?.username}
                      </div>
                      <div className="text-gray-400 text-xs flex items-center gap-1">
                        <Mail size={12} /> {b.userId?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-700">
                  {b.packageId?.packageName}
                </td>
                <td className="p-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(b.travelDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="p-4 font-bold text-green-600">
                  ₹{b.packageId?.packagePrice ?? b.totalAmount}
                </td>

                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      b.status === "confirmed"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : b.status === "completed"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-gray-300 mb-2 flex justify-center">
              <Tag size={48} />
            </div>
            <p className="text-gray-500">
              No customers have booked your packages yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
