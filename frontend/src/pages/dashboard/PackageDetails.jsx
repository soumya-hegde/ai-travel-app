import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useParams } from "react-router-dom";
import API from "../../api/axios";

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBookNow = async () => {
    try {
      setBookingLoading(true);
      setBookingError("");
      setBookingStatus("");

      await API.post("/create-booking", {
        packageId: pkg._id || pkg.id,
        travelDate,
      });

      setBookingStatus("Booking successful!");
      // redirect after success
      setTimeout(() => navigate("/dashboard/bookings"), 1200);
    } catch (err) {
      setBookingError(err.response?.data?.error || err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPackage = async () => {
      try {
        setLoading(true);
        const res = await API.get("/view-package");
        const found = res.data.find(
          (p) => String(p.id || p._id) === String(id),
        );
        if (isMounted) setPkg(found || null);
      } catch (err) {
        if (isMounted) setPkg(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPackage();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (!pkg) {
    return (
      <div className="p-6 text-center text-red-600">Package not found</div>
    );
  }
  const image =
    Array.isArray(pkg.packageImages) && pkg.packageImages.length > 0
      ? pkg.packageImages[0]
      : "https://picsum.photos/800/400?fallback";

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-white shadow">
        <img
          src={image}
          alt={pkg.packageName}
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/800/400?fallback";
          }}
        />

        <div className="p-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            {pkg.packageName}
          </h1>
          <p className="mt-2 text-gray-600">{pkg.packageDescription}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-blue-600">
              ₹{pkg.packagePrice}
            </span>
            <span className="text-sm text-gray-500">
              {pkg.packageDays} days
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />

            <button
              onClick={handleBookNow}
              disabled={!travelDate || bookingLoading}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {bookingLoading ? "Booking..." : "Book Now"}
            </button>

            {bookingStatus && (
              <div className="rounded-md bg-green-100 px-3 py-2 text-green-700 text-sm">
                {bookingStatus}
              </div>
            )}

            {bookingError && (
              <div className="rounded-md bg-red-100 px-3 py-2 text-red-700 text-sm">
                {bookingError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
