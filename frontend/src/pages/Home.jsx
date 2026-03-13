import PackageCard from "../components/PackageCard";
import usePackages from "../context/usePackages";

export default function DashboardHome() {
  const { packages } = usePackages();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Available Packages</h2>

      <div className="grid grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} id={pkg.id} />
        ))}
      </div>
    </div>
  );
}
