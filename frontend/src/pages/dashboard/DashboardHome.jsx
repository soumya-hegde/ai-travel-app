import { useEffect, useState } from "react";
import API from "../../api/axios";
import PackageCard from "../../components/PackageCard";
import usePackages from "../../context/usePackages";

export default function DashboardHome() {
  const { packages, setPackages } = usePackages();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await API.get("/view-package");
        if (isMounted) setPackages(response.data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.error || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPackages();
    return () => {
      isMounted = false;
    };
  }, [setPackages]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading packages…</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load packages: {error}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="p-6 text-center text-gray-500">No packages found.</div>
    );
  }
  console.log("packages:", packages);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Available Packages
        </h2>
        <p className="text-sm text-gray-500">
          Browse and choose your next trip
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id || pkg._id} id={pkg.id || pkg._id} />
        ))}
      </div>
    </div>
  );
}
