import PackageCard from "../../../components/PackageCard";
import usePackages from "../../../context/usePackages";

export default function Home() {
  const { packages } = usePackages();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Packages</h2>

      <div className="grid grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} id={pkg.id} />
        ))}
      </div>
    </div>
  );
}
