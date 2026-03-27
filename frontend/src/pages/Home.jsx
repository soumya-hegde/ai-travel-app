import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Added to sync with Auth state
import API from "../api/axios";

export default function Home() {
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();

  // LOGIC: Get token and role from Redux to stay in sync with Navbar
  const { token, role } = useSelector((state) => state.auth);

  const heroImages = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  ];

  const [heroIndex, setHeroIndex] = useState(0);

  // LOGIC: If a user is already logged in, redirect them to their dashboard automatically
  if (token) {
    const dashboardPath =
      role === "agent" ? "/agent-dashboard" : "/dashboard/home";
    return <Navigate to={dashboardPath} replace />;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await API.get("/public-packages");
        const data = res.data?.packages || res.data || [];
        setPackages(Array.isArray(data) ? data : []);
      } catch {
        setPackages([]);
      }
    };
    fetchPackages();
  }, []);

  const handleBookNow = (pkgId) => {
    const target = `/dashboard/package/${pkgId}`;
    if (token) {
      navigate(target);
      return;
    }
    navigate("/login", { state: { from: target } });
  };

  return (
    <div className="bg-gray-50">
      {/* HERO - STYLING KEPT EXACTLY SAME */}
      <section
        className="h-[60vh] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url(${heroImages[heroIndex]})`,
        }}
      >
        <div className="bg-black/50 w-full h-full flex flex-col justify-center px-10 text-white">
          <h1 className="text-4xl font-bold">Plan Smarter. Travel Better.</h1>

          {/* LOGIC: Button only shows if NO token is present */}
          {!token && (
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-fit rounded-lg bg-white px-6 py-2 font-semibold text-slate-800 hover:bg-gray-100 transition"
            >
              Login
            </button>
          )}
        </div>
      </section>

      {/* PACKAGES - STYLING KEPT EXACTLY SAME */}
      <section className="px-10 py-14 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">
          Popular Packages
        </h2>
        <p className="text-gray-500 mb-8">
          Explore our curated travel experiences
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:-translate-y-2"
            >
              {/* IMAGE */}
              <div className="h-48 w-full bg-white flex items-center justify-center overflow-hidden">
                {pkg.packageImages?.[0] ? (
                  <img
                    src={pkg.packageImages[0]}
                    alt={pkg.packageName}
                    className="h-full w-full object-cover transform group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800">
                  {pkg.packageName}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {pkg.packageDestination}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-600">
                    {pkg.packageDays} days
                  </span>
                  <span className="font-semibold text-blue-700">
                    ₹{pkg.packagePrice}
                  </span>
                </div>

                {/* BUTTON */}
                <button
                  onClick={() => handleBookNow(pkg._id || pkg.id)}
                  className="mt-5 w-full rounded-lg bg-[#0B3C5D] py-2 text-white font-medium hover:bg-black transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT - STYLING KEPT EXACTLY SAME */}
      <section id="about" className="bg-white py-16 px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
          <p className="text-gray-600 mt-4">
            We use AI to create personalized travel plans based on your
            interests, time, and budget — making your trips smarter and
            hassle-free.
          </p>
        </div>
      </section>

      {/* CONTACT - STYLING KEPT EXACTLY SAME */}
      <section id="contact" className="bg-gray-100 py-16 px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">Contact Us</h2>
          <p className="text-gray-600 mt-4">
            Email: support@aitravelplanner.com
          </p>
        </div>
      </section>
    </div>
  );
}
