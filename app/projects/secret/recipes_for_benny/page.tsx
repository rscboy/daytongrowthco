import type { Metadata } from "next";
import { BennyRecipeBook } from "./recipe-book";
import { currentActor } from "@/lib/caruso-recipe-auth";
import { hasSecretProjectAccess } from "@/lib/secret-project-access";
import { loadBook } from "@/lib/caruso-recipe-storage";
import type { RecipeAdditions } from "@/lib/caruso-recipe-additions";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Caruso Recipe Book",
  description: "A private collection of family favorites, made for cooking.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Caruso Recipe Book",
    description: "A private collection of family favorites, made for cooking.",
    url: "https://recipes.daytongrowth.co/book",
    siteName: "Caruso Recipe Book",
    type: "website",
    images: [{
      url: "https://raw.githubusercontent.com/rscboy/daytongrowthco/refs/heads/main/recipe_sammy.png",
      width: 1200,
      height: 630,
      alt: "Caruso Recipe Book",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Caruso Recipe Book",
    description: "A private collection of family favorites, made for cooking.",
    images: ["https://raw.githubusercontent.com/rscboy/daytongrowthco/refs/heads/main/recipe_sammy.png"],
  },
};

export default async function RecipesForBennyPage() {
  let initialBook: RecipeAdditions | undefined;
  let initialError = "";
  try {
    if (!(await currentActor()) && !(await hasSecretProjectAccess('recipes_for_benny'))) {
      initialError = "Open your invitation or sign in to see the family book.";
    } else {
      const { store } = await loadBook();
      initialBook = {version:1,entries:store.records.filter(r => !r.deletedAt).map(r => ({recipe:r.recipe,owner:store.profiles.find(p => p.id === r.recipe.owner)!}))};
    }
  } catch (error) { console.error("Recipe page:", error instanceof Error ? error.message : "Unavailable"); initialError = "We couldn’t open the saved recipe book. Your recipes are safe. Try again below, or sign in."; }
  return <BennyRecipeBook initialBook={initialBook} initialError={initialError} />;
}
