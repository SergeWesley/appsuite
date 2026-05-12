import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function Loading() {
  return <LoadingOverlay isLoading={true} message="Chargement de la note..." fullPage color="amber" />;
}
