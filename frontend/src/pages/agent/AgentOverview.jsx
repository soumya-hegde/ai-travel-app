import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import PackageCard from "../../components/PackageCard";
import usePackages from "../../context/usePackages";

export default function AgentOverview() {
  const { packages, setPackages } = usePackages();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/view-package");
        if (isMounted) setPackages(res.data || []);
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

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPackages = useMemo(() => {
    const approved = packages.filter((pkg) => pkg.status === "approved");
    if (!normalizedQuery) return approved;

    return approved.filter((pkg) => {
      const name = String(pkg.packageName || "").toLowerCase();
      const dest = String(pkg.packageDestination || "").toLowerCase();
      const desc = String(pkg.packageDescription || "").toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        dest.includes(normalizedQuery) ||
        desc.includes(normalizedQuery)
      );
    });
  }, [packages, normalizedQuery]);

  const handleSearch = () => {
    setQuery(searchInput.trim());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim().length === 0) setQuery("");
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading packages...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load packages: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Available Packages
            </h2>
            <p className="text-sm text-slate-500">
              Browse approved itineraries
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <input
              type="text"
              placeholder="Search e.g. Goa"
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none md:w-72"
            />
            <button
              onClick={handleSearch}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No packages found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id || pkg._id} id={pkg.id || pkg._id} />
          ))}
        </div>
      )}
    </div>
  );
}
