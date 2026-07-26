"use client";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { StickyNote } from "lucide-react";

export default function Loading() {
  return <LoadingOverlay isLoading={true} message="" fullPage color="amber" icon={StickyNote} animateType="pulse" />;
}
