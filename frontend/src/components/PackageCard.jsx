import { Link } from "react-router-dom";
import usePackages from "../context/usePackages";
import { BASE_URL } from "../api/axios";

export default function PackageCard({ id }) {
  const { getPackageById } = usePackages();
  const pkg = getPackageById(id);

  if (!pkg) return null;

  //LOGIC: Check if it's an external URL or a local filename
  const imageName =
    Array.isArray(pkg.packageImages) && pkg.packageImages.length > 0
      ? pkg.packageImages[0]
      : null;

  let imageURL = "https://picsum.photos/400/250?fallback";

  if (imageName) {
    if (imageName.startsWith("http")) {
      imageURL = imageName; // Use external URL as is
    } else {
      imageURL = `${BASE_URL}/uploads/${imageName}`; // Add local server prefix
    }
  }

  return (
    <Link
      to={`/dashboard/package/${id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={imageURL}
          alt={pkg.packageName}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/400/250?fallback";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition">
          {pkg.packageName}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{pkg.packageDays} days</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            {pkg.packageDestination}
          </span>
          <span className="text-base font-semibold text-blue-700">
            {"\u20B9"}
            {pkg.packagePrice}
          </span>
        </div>

        <div className="mt-4">
          <span className="inline-flex w-full items-center justify-center rounded-lg bg-[#0B3C5D] py-2 text-sm font-semibold text-white transition group-hover:bg-black">
            View Details
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {pkg.keyAttractions?.slice(0, 3).map((place, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-100"
            >
              {place}
            </span>
          ))}
          {pkg.keyAttractions?.length > 3 && (
            <span className="text-[10px] text-gray-400">
              +{pkg.keyAttractions.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
