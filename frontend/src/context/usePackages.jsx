// src/context/usePackages.jsx
import { useContext } from "react";
import { PackageContext } from "./PackageContext";

export default function usePackages() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error("usePackages must be used inside PackageProvider");
  }
  if (typeof context.getPackageById !== "function") {
    throw new Error("getPackageById is not available in PackageProvider");
  }
  return context;
}
