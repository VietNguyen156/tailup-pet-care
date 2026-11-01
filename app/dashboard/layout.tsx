import { requirePageUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
