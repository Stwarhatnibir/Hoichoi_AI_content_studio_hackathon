import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";

export default function Home() {
  const session = cookies().get("hoichoi_session");

  if (!session?.value) {
    redirect("/login");
  }

  return <DashboardShell />;
}
