"use client";

import { useFilterPersistence } from "@/hooks/useFilterPersistence";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AppTracker() {
  const pathname = usePathname();
  const { updateFilter } = useFilterPersistence("app-filters", {
    selectedApp: "dashboard",
  });

  useEffect(() => {
    updateFilter("selectedApp", pathname.replace("/", "") || "dashboard");
  }, [pathname, updateFilter]);

  return null;
}
