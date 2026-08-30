import type { Metadata } from "next";
import { BennyRecipeBook } from "./recipe-book";

export const metadata: Metadata = {
  title: "Sammy's Recipe Book Website",
  description: "A private collection of family favorites, made for cooking.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Sammy's Recipe Book Website",
    description: "A private collection of family favorites, made for cooking.",
    url: "/projects/secret/recipes_for_benny/",
    siteName: "Sammy's Recipe Book Website",
    type: "website",
    images: [{
      url: "https://raw.githubusercontent.com/rscboy/daytongrowthco/refs/heads/main/recipe_sammy.png",
      width: 1200,
      height: 630,
      alt: "Sammy's Recipe Book Website",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sammy's Recipe Book Website",
    description: "A private collection of family favorites, made for cooking.",
    images: ["https://raw.githubusercontent.com/rscboy/daytongrowthco/refs/heads/main/recipe_sammy.png"],
  },
};

export default function RecipesForBennyPage() {
  return <BennyRecipeBook />;
}
