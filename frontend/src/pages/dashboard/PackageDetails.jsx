import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState("");

  // Booking States
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // AI States
  const [aiPlan, setAiPlan] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Fetch Package Data
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

  // 2. Handle Booking
  const handleBookNow = async () => {
    try {
      const selectedDate = new Date(travelDate);
      if (selectedDate < minDateObj) {
        setBookingError(`You can only book after ${duration} days from today`);
        return;
      }
      setBookingLoading(true);
      setBookingError("");
      await API.post("/create-booking", {
        packageId: pkg._id || pkg.id,
        travelDate,
      });
      setBookingStatus("Booking successful!");
      setTimeout(() => navigate("/dashboard/bookings"), 1200);
    } catch (err) {
      setBookingError(
        err.response?.status === 400
          ? "You have already booked for this date"
          : "Something went wrong.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // 3. Handle AI Generation
  const handleGenerateAI = async () => {
    if (!travelDate) return alert("Please select a travel date first!");
    setIsAiLoading(true);
    setAiPlan(null); // Clear old plan
    try {
      // We send date, destination and the key attractions provided by the agent
      const res = await API.post("/generate-smart-plan", {
        destination: pkg.packageDestination,
        days: pkg.packageDays,
        attractions: pkg.keyAttractions,
        travelDate,
        packagePrice: pkg.packagePrice,
      });
      setAiPlan(res.data.itinerary);
    } catch (err) {
      alert("AI Generation failed. Check your backend routes.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (!pkg)
    return (
      <div className="p-6 text-center text-red-600">Package not found</div>
    );

  // Image Logic
  const imageName =
    Array.isArray(pkg.packageImages) && pkg.packageImages.length > 0
      ? pkg.packageImages[0]
      : null;
  const imageURL = imageName?.startsWith("http")
    ? imageName
    : imageName
      ? `${BASE_URL}/uploads/${imageName}`
      : "https://picsum.photos/800/400?fallback";

  // Date Logic
  const today = new Date();
  const duration = Number(pkg.packageDays || 0);
  const minDateObj = new Date();
  minDateObj.setDate(today.getDate() + duration + 1);
  const minDate = minDateObj.toISOString().split("T")[0];

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* TOP SECTION: IMAGE & BOOKING */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* IMAGE */}
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white h-[450px]">
            <img
              src={imageURL}
              alt={pkg.packageName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* DETAILS & BOOKING CARD */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">
                {pkg.packageName}
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                {pkg.packageDescription}
              </p>

              <div className="mt-6 flex gap-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                  ₹{pkg.packagePrice}
                </span>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold">
                  {pkg.packageDays} Days / {pkg.packageNights} Nights
                </span>
              </div>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-3xl shadow-xl p-8 space-y-5">
              <div>
                <label className="text-gray-700 font-bold block mb-2">
                  When are you traveling?
                </label>
                <input
                  type="date"
                  value={travelDate}
                  min={minDate}
                  onChange={(e) => {
                    setTravelDate(e.target.value);
                    setAiPlan(null);
                  }}
                  className="w-full rounded-xl border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={handleBookNow}
                disabled={!travelDate || bookingLoading}
                className="w-full py-4 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition disabled:bg-gray-300"
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>

              {bookingStatus && (
                <p className="text-green-600 text-center font-bold">
                  {bookingStatus}
                </p>
              )}
              {bookingError && (
                <p className="text-red-500 text-center text-sm">
                  {bookingError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: AI ITINERARY */}
        <div className="mt-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Personalized Itinerary
              </h2>
              <p className="text-gray-500">
                Based on weather, season, and your selected date.
              </p>
            </div>

            {travelDate && (
              <button
                onClick={handleGenerateAI}
                disabled={isAiLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition active:scale-95"
              >
                {isAiLoading
                  ? "AI is Planning..."
                  : aiPlan
                    ? "🔄 Regenerate Plan"
                    : "✨ Generate AI Plan"}
              </button>
            )}
          </div>

          {!travelDate && (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
              Select a travel date above to unlock your smart day-wise plan.
            </div>
          )}

          {aiPlan && (
            <div className="grid gap-6">
              {aiPlan.map((day) => (
                <div
                  key={day.day}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6"
                >
                  <div className="hidden md:flex flex-col items-center">
                    <span className="text-sm font-black text-indigo-200 uppercase">
                      Day
                    </span>
                    <span className="text-4xl font-black text-indigo-600">
                      {day.day}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {day.title || `Day ${day.day} Exploration`}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {day.activities}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
