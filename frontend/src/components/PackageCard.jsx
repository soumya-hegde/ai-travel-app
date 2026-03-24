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
  console.log(pkg.packageImages);

  return (
    <Link to={`/dashboard/package/${id}`} className="border p-2 block">
      <img
        src={image}
        alt={pkg.packageName}
        onError={(e) => {
          e.currentTarget.src = "https://picsum.photos/400/250?fallback";
        }}
      />
      <h3>{pkg.packageName}</h3>
      <p>{pkg.packageDays} days</p>
      <p>₹{pkg.packagePrice}</p>
    </Link>
  );
}
