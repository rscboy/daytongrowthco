import { requireSecretProjectAccess } from "@/lib/secret-project-access";

export const dynamic = "force-dynamic";

export default async function RecipeBookLayout({ children }: { children: React.ReactNode }) {
  await requireSecretProjectAccess("recipes_for_benny");
  return children;
}
