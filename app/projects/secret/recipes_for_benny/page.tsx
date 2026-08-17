import type { Metadata } from "next";
import { BennyRecipeBook } from "./recipe-book";

export const metadata: Metadata = {
  title: "Benny's recipe book",
  description: "A private collection of family favorites, made for cooking.",
  robots: { index: false, follow: false, nocache: true },
};

export default function RecipesForBennyPage() {
  return <BennyRecipeBook />;
}
