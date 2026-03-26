import { Link } from "react-router-dom";
import usePackages from "../context/usePackages";

export default function PackageCard({ id }) {
  const { getPackageById } = usePackages();
  const pkg = getPackageById(id);

  if (!pkg) return null;

  const image =
    Array.isArray(pkg.packageImages) && pkg.packageImages.length > 0
      ? pkg.packageImages[0]
      : "https://picsum.photos/400/250?fallback";

  return (
    <Link
      to={`/dashboard/package/${id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={image}
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
      </div>
    </Link>
  );
}
