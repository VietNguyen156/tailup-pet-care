import { Bath, Scissors, HeartPulse, PawPrint } from "lucide-react";
export function ServiceIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const Icon =
    { bath: Bath, scissors: Scissors, health: HeartPulse, paw: PawPrint }[
      name
    ] ?? PawPrint;
  return <Icon className={className} strokeWidth={1.6} />;
}
