"use client";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Activity } from "lucide-react";

export default function Loading() {
  return <LoadingOverlay isLoading={true} message="" fullPage icon={Activity} animateType="pulse" color="green" />;
}
