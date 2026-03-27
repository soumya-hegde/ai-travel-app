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
      const selectedDate = new Date(travelDate);

      // 🚫 Prevent invalid booking
      if (selectedDate < minDateObj) {
        setBookingError(`You can only book after ${duration} days from today`);
        return;
      }

      setBookingLoading(true);
      setBookingError("");
      setBookingStatus("");

      await API.post("/create-booking", {
        packageId: pkg._id || pkg.id,
        travelDate,
      });

      setBookingStatus("Booking successful!");
      setTimeout(() => navigate("/dashboard/bookings"), 1200);
    } catch (err) {
      if (err.response?.status === 400) {
        setBookingError("You have already booked for this date");
      } else {
        setBookingError("Something went wrong. Please try again.");
      }
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

  // Block booking for today + package duration
  const today = new Date();
  const duration = Number(pkg.packageDays || 0);

  const minDateObj = new Date();
  minDateObj.setDate(today.getDate() + duration + 1);

  const minDate = minDateObj.toISOString().split("T")[0];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* LEFT: IMAGE */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
          <img
            src={image}
            alt={pkg.packageName}
            onError={(e) => {
              e.currentTarget.src = "https://picsum.photos/800/400?fallback";
            }}
            className="w-full h-[420px] object-cover hover:scale-105 transition duration-500"
          />
        </div>

        {/* RIGHT: DETAILS */}
        <div className="flex flex-col justify-between">
          {/* TEXT CONTENT */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 leading-tight">
              {pkg.packageName}
            </h1>

            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              {pkg.packageDescription}
            </p>

            {/* PRICE + DURATION */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-2xl font-bold text-blue-700">
                ₹{pkg.packagePrice}
              </span>

              <span className="text-gray-500 font-medium">
                {pkg.packageDays} days
              </span>
            </div>
          </div>

          {/* BOOKING CARD */}
          <div className="mt-10 bg-white border rounded-2xl shadow-md p-6 space-y-4">
            <label className="text-gray-700 font-medium">
              Select Travel Date
            </label>

            <input
              type="date"
              value={travelDate}
              min={minDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />

            <button
              onClick={handleBookNow}
              disabled={!travelDate || bookingLoading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition
              ${
                travelDate && !bookingLoading
                  ? "bg-blue-950 hover:bg-black"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {bookingLoading ? "Booking..." : "Book Now"}
            </button>

            {/* STATUS */}
            {bookingStatus && (
              <div className="rounded-lg bg-green-100 px-4 py-2 text-green-700 text-sm">
                {bookingStatus}
              </div>
            )}

            {bookingError && (
              <div className="rounded-lg bg-red-100 px-4 py-2 text-red-700 text-sm">
                {bookingError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
