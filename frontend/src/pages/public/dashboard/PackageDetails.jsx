import { useParams } from "react-router-dom";
import usePackages from "../../../context/usePackages";

export default function PackageDetails() {
  const { id } = useParams();
  const { getPackageById } = usePackages();

  const pkg = getPackageById(Number(id));

  if (!pkg) return <p>Package not found</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{pkg.name}</h2>
      <img src={pkg.image} alt={pkg.name} />
      <p>{pkg.days} days</p>
      <p>₹{pkg.price}</p>
    </div>
  );
}
