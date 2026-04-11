import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";

export default function AdminPackageDetails() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (!pkg)
    return (
      <div className="p-6 text-center text-red-600">Package not found</div>
    );

  const imageName =
    Array.isArray(pkg.packageImages) && pkg.packageImages.length > 0
      ? pkg.packageImages[0]
      : null;

  const imageURL = imageName?.startsWith("http")
    ? imageName
    : imageName
      ? `${BASE_URL}/uploads/${imageName}`
      : "https://picsum.photos/800/400?fallback";

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white h-[450px]">
            <img
              src={imageURL}
              alt={pkg.packageName}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              {pkg.packageName}
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              {pkg.packageDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                ₹{pkg.packagePrice}
              </span>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold">
                {pkg.packageDays} Days / {pkg.packageNights} Nights
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  pkg.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : pkg.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {pkg.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Package Details
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <strong>Destination:</strong> {pkg.packageDestination}
            </div>
            <div>
              <strong>Accommodation:</strong> {pkg.packageAccommodation}
            </div>
            <div>
              <strong>Transportation:</strong> {pkg.packageTransportation}
            </div>
            <div>
              <strong>Meals:</strong> {pkg.packageMeals}
            </div>
            <div>
              <strong>Activities:</strong> {pkg.packageActivities}
            </div>
            <div>
              <strong>Offer:</strong> {pkg.packageOffer || "N/A"}
            </div>
          </div>

          {pkg.keyAttractions?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                Key Attractions
              </h3>
              <div className="flex flex-wrap gap-2">
                {pkg.keyAttractions.map((place, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full border border-blue-100"
                  >
                    {place}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
