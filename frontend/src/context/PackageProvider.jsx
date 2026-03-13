import { useState } from "react";
import { PackageContext } from "./PackageContext";

export default function PackageProvider({ children }) {
  const [packages, setPackages] = useState([]);

  return (
    <PackageContext.Provider
      value={{
        packages,
        setPackages,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
}
