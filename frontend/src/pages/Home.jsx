import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../api/axios";

export default function Home() {
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const fallbackImage =
    "https://via.placeholder.com/600x400?text=Image+Not+Available";

  const heroImages = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  ];

  const [heroIndex, setHeroIndex] = useState(0);

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

  return (
    <div>
      {/* HERO */}
      <section
        className="h-[60vh] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url(${heroImages[heroIndex]})`,
        }}
      >
        <div className="bg-black/50 w-full h-full flex flex-col justify-center px-10 text-white">
          <h1 className="text-4xl font-bold">Plan Smarter. Travel Better.</h1>

          {!token && (
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-fit inline-flex items-center rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
            >
              Login
            </button>
          )}
        </div>
      </section>

      {/* PACKAGES */}
      <section className="p-10">
        <h2 className="text-2xl font-bold mb-6">Popular Packages</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="border rounded-lg shadow">
              <img
                src={pkg.packageImages?.[0] || fallbackImage}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{pkg.packageName}</h3>
                <p>{pkg.packageDestination}</p>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="p-10">
        <h2 className="text-xl font-bold">About</h2>
        <p>AI powered travel planning</p>
      </section>

      <section id="contact" className="p-10">
        <h2 className="text-xl font-bold">Contact</h2>
        <p>Email: support@travel.com</p>
      </section>
    </div>
  );
}
