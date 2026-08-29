import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSecretProjectsSession, secretProjectsCookie } from "@/lib/secret-projects-auth";

export const dynamic = "force-dynamic";

export default async function ProfitCalculatorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!hasSecretProjectsSession(cookieStore.get(secretProjectsCookie)?.value)) {
    redirect("/projects/secret-projects");
  }
  return children;
}
