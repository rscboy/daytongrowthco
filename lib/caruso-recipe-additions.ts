export const RECIPE_ADDITIONS_PATH = "data/caruso-recipe-additions.json";

export type CommunityRecipe = {
  id: string; title: string; subtitle: string; description: string;
  prep: string; cook: string; total: string; yield: string; note: string;
  tags: string[]; color: string; image: string; owner: string;
  ingredients: { category: string; items: string[] }[];
  steps: { title: string; text: string }[];
};
export type RecipeAddition = { owner: { id: string; name: string; initials: string }; recipe: CommunityRecipe };
export type RecipeAdditions = { version: 1; entries: RecipeAddition[] };

const slug = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
const text = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function parseRecipeAdditions(raw: string): RecipeAdditions {
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.version !== 1 || !Array.isArray(value.entries)) throw new Error("Recipe additions have an unsupported format.");
  const ids = new Set<string>();
  const entries = value.entries.map((entry: unknown): RecipeAddition => {
    if (!object(entry) || !object(entry.owner) || !object(entry.recipe)) throw new Error("Recipe addition is incomplete.");
    const owner = entry.owner, recipe = entry.recipe;
    if (!slug(owner.id) || !text(owner.name, 80) || !text(owner.initials, 6) || !slug(recipe.id) || recipe.owner !== owner.id || ids.has(recipe.id)) throw new Error("Recipe addition has an invalid or duplicate ID.");
    for (const key of ["title", "subtitle", "description", "prep", "cook", "total", "yield", "note"]) if (!text(recipe[key], 1500)) throw new Error("Recipe addition has incomplete text.");
    if (!Array.isArray(recipe.tags) || !recipe.tags.length || recipe.tags.length > 6 || !recipe.tags.every((tag) => text(tag, 40)) || !text(recipe.color, 20)) throw new Error("Recipe addition has invalid tags.");
    if (!text(recipe.image, 2000) || (!/^https:\/\//i.test(recipe.image) && !/^\/(?:recipe-book\/community|api\/caruso-recipe-book\/image)\/[a-z0-9-]+\.(?:jpg|png|webp)$/.test(recipe.image))) throw new Error("Recipe addition has an invalid image.");
    if (!Array.isArray(recipe.ingredients) || !recipe.ingredients.length || recipe.ingredients.length > 12 || !recipe.ingredients.every((group) => object(group) && text(group.category, 120) && Array.isArray(group.items) && group.items.length > 0 && group.items.length <= 60 && group.items.every((item) => text(item, 500)))) throw new Error("Recipe addition has invalid ingredients.");
    if (!Array.isArray(recipe.steps) || !recipe.steps.length || recipe.steps.length > 30 || !recipe.steps.every((step) => object(step) && text(step.title, 120) && text(step.text, 1500))) throw new Error("Recipe addition has invalid steps.");
    ids.add(recipe.id);
    const fields = ["id", "title", "subtitle", "description", "prep", "cook", "total", "yield", "note", "tags", "color", "image", "owner", "ingredients", "steps"];
    return { owner: { id: owner.id, name: owner.name, initials: owner.initials }, recipe: Object.fromEntries(fields.map((key) => [key, recipe[key]])) as CommunityRecipe };
  });
  return { version: 1, entries };
}
