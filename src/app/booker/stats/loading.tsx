"use client";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { BarChart3 } from "lucide-react";

export default function Loading() {
  return <LoadingOverlay isLoading={true} message="" fullPage color="blue" icon={BarChart3} animateType="pulse" />;
}
