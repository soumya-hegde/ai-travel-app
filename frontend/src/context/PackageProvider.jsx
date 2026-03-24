import { useState } from "react";
import { PackageContext } from "./PackageContext";

export default function PackageProvider({ children }) {
  const [packages, setPackages] = useState([]);

  const getPackageById = (id) => {
    return packages.find((pkg) => String(pkg.id || pkg._id) === String(id));
  };

  return (
    <PackageContext.Provider
      value={{
        packages,
        setPackages,
        getPackageById,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
}
