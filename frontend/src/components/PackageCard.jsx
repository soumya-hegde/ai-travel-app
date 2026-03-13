import { Link } from "react-router-dom";
import usePackages from "../context/usePackages";

export default function PackageCard({ id }) {
  const { getPackageById } = usePackages();
  const pkg = getPackageById(id);

  if (!pkg) return null;

  return (
    <Link to={`/dashboard/package/${id}`} className="border p-2 block">
      <img src={pkg.image} alt={pkg.name} />
      <h3>{pkg.name}</h3>
      <p>{pkg.days} days</p>
      <p>₹{pkg.price}</p>
    </Link>
  );
}
