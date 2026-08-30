import { requireSecretProjectAccess } from "@/lib/secret-project-access";

export const dynamic = "force-dynamic";

export default async function ProfitCalculatorLayout({ children }: { children: React.ReactNode }) {
  await requireSecretProjectAccess("profit_calculator");
  return children;
}
