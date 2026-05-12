import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function Loading() {
  return <LoadingOverlay isLoading={true} message="Chargement des exercices..." fullPage color="green" />;
}
