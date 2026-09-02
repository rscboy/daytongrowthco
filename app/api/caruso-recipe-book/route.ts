import { createHash } from "node:crypto";
import { authorizedRecipeAccess } from "./access";

export const runtime = "nodejs";

const RECIPE_SOURCE_PATH = "app/projects/secret/recipes_for_benny/recipe-book.tsx";
const COLORS = new Set(["blue", "coral", "gold", "green", "lavender", "lilac", "mint", "peach", "pink", "rust", "tomato"]);

type RecipeGroup = { category: string; items: string[] };
type RecipeStep = { title: string; text: string };
type AddRecipeBody = {
  recipe: {
    id: string; title: string; subtitle: string; description: string;
    prep: string; cook: string; total: string; yield: string;
    tags: string[]; color: string; ingredients: RecipeGroup[];
    steps: RecipeStep[]; note: string;
  };
  owner: { id: string; name?: string; initials?: string };
  image: { url?: string; filename?: string; base64?: string; mimeType?: string };
};

type GitHubFile = { content: string; encoding: string };
type GitHubRef = { object: { sha: string } };
type GitHubCommit = { tree: { sha: string } };
type GitHubBlob = { sha: string };
type GitHubTree = { sha: string };
type CreatedCommit = { sha: string; html_url: string };

function jsonError(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status });
}

function isText(value: unknown, max = 500) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function isSlug(value: unknown) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}

function validateBody(body: unknown): body is AddRecipeBody {
  if (!body || typeof body !== "object") return false;
  const { recipe, owner, image } = body as Partial<AddRecipeBody>;
  if (!recipe || !owner || !image || !isSlug(recipe.id) || !isSlug(owner.id)) return false;
  if (![recipe.title, recipe.subtitle, recipe.description, recipe.prep, recipe.cook, recipe.total, recipe.yield, recipe.note].every((value) => isText(value, 1_500))) return false;
  if (!Array.isArray(recipe.tags) || recipe.tags.length < 1 || recipe.tags.length > 6 || !recipe.tags.every((tag) => isText(tag, 40))) return false;
  if (!COLORS.has(recipe.color)) return false;
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length < 1 || recipe.ingredients.length > 12) return false;
  if (!recipe.ingredients.every((group) => isText(group?.category, 120) && Array.isArray(group.items) && group.items.length > 0 && group.items.length <= 60 && group.items.every((item) => isText(item, 500)))) return false;
  if (!Array.isArray(recipe.steps) || recipe.steps.length < 1 || recipe.steps.length > 30) return false;
  if (!recipe.steps.every((step) => isText(step?.title, 120) && isText(step?.text, 1_500))) return false;
  if (owner.name !== undefined && !isText(owner.name, 80)) return false;
  if (owner.initials !== undefined && !isText(owner.initials, 6)) return false;
  const hasUrl = isText(image.url, 2_000) && /^https:\/\//i.test(image.url!);
  const hasUpload = isText(image.filename, 160) && isText(image.base64, 15_000_000) && /^image\/(jpeg|png|webp)$/i.test(image.mimeType ?? "");
  return Boolean(hasUrl || hasUpload) && !(hasUrl && hasUpload);
}

function apiConfig() {
  const token = process.env.CARUSO_RECIPE_GITHUB_TOKEN;
  const [owner, repo] = (process.env.CARUSO_RECIPE_GITHUB_REPOSITORY ?? "rscboy/daytongrowthco").split("/");
  const branch = process.env.CARUSO_RECIPE_GITHUB_BRANCH ?? "main";
  if (!token || !owner || !repo || !branch) throw new Error("Recipe publishing is not configured.");
  return { token, owner, repo, branch };
}

async function github<T>(path: string, init: RequestInit = {}) {
  const config = apiConfig();
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result?.message === "string" ? result.message : `GitHub request failed (${response.status}).`);
  return result as T;
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase();
}

function sourceWithAddition(source: string, body: AddRecipeBody, imageUrl: string) {
  if (source.includes(`id: ${JSON.stringify(body.recipe.id)}`) || source.includes(`"id":${JSON.stringify(body.recipe.id)}`)) throw new Error("A recipe with this ID already exists.");
  const profileExists = source.includes(`{ id: ${JSON.stringify(body.owner.id)}, label:`) || source.includes(`{"id":${JSON.stringify(body.owner.id)},"label":`);
  const recipe = { ...body.recipe, image: imageUrl, owner: body.owner.id };
  const recipeMarker = "\n];\n\nconst recipeProfiles: RecipeProfile[] = [";
  if (!source.includes(recipeMarker)) throw new Error("The recipe source format has changed; no update was made.");
  let next = source.replace(recipeMarker, `\n  ${JSON.stringify(recipe)},\n];\n\nconst recipeProfiles: RecipeProfile[] = [`);

  if (!profileExists) {
    if (!isText(body.owner.name, 80)) throw new Error("A new recipe owner needs a display name; no update was made.");
    const ownerType = next.match(/^type RecipeOwnerId = ([^;]+);$/m)?.[0];
    if (!ownerType) throw new Error("The recipe owner type has changed; no update was made.");
    next = next.replace(ownerType, ownerType.replace(";", ` | ${JSON.stringify(body.owner.id)};`));
    const profileMarker = "\n];\n\nconst samGRecipeIds = new Set([";
    if (!next.includes(profileMarker)) throw new Error("The recipe profile source format has changed; no update was made.");
    const name = body.owner.name!.trim();
    const profile = { id: body.owner.id, label: `${name}'s Recipes`, name, initials: body.owner.initials?.trim() || initials(name), image: "/recipe-book/all-recipes-family.jpg", imagePosition: "center" };
    next = next.replace(profileMarker, `\n  ${JSON.stringify(profile)},\n];\n\nconst samGRecipeIds = new Set([`);
  }
  return next;
}

function uploadExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

async function currentSource() {
  const config = apiConfig();
  const file = await github<GitHubFile>(`/contents/${RECIPE_SOURCE_PATH}?ref=${encodeURIComponent(config.branch)}`);
  if (file.encoding !== "base64") throw new Error("GitHub returned the recipe source in an unsupported format.");
  return Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
}

function ownerList(source: string) {
  const start = source.indexOf("const recipeProfiles: RecipeProfile[] = [");
  const end = source.indexOf("\n];\n\nconst samGRecipeIds", start);
  if (start < 0 || end < 0) throw new Error("The recipe profile source format has changed.");
  const profiles = source.slice(start, end);
  const owners = new Map<string, string>();
  for (const match of profiles.matchAll(/(?:id:\s*|"id":)"([a-z0-9-]+)"[\s\S]*?(?:name:\s*|"name":)"([^"]+)"/g)) {
    if (match[1] !== "all") owners.set(match[1], match[2]);
  }
  return [...owners].map(([id, name]) => ({ id, name }));
}

export async function GET(request: Request) {
  if (!authorizedRecipeAccess(request)) return jsonError("Unauthorized.", 401);
  try {
    return Response.json({ ok: true, owners: ownerList(await currentSource()) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load recipe owners.", 500);
  }
}

export async function POST(request: Request) {
  if (!authorizedRecipeAccess(request)) return jsonError("Unauthorized.", 401);
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > 15_200_000) return jsonError("Request is too large.", 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return jsonError("The request body must be valid JSON.", 400); }
  if (!validateBody(body)) return jsonError("The recipe is incomplete or contains unsupported values.", 400);

  try {
    const config = apiConfig();
    const ref = await github<GitHubRef>(`/git/ref/heads/${encodeURIComponent(config.branch)}`);
    const parent = await github<GitHubCommit>(`/git/commits/${ref.object.sha}`);
    const source = await currentSource();

    const imageEntries: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
    let imageUrl = body.image.url!;
    if (body.image.base64 && body.image.mimeType) {
      const imageBytes = Buffer.from(body.image.base64, "base64");
      if (imageBytes.length < 100 || imageBytes.length > 8_000_000) throw new Error("The dish image must be between 100 bytes and 8 MB.");
      const digest = createHash("sha256").update(imageBytes).digest("hex").slice(0, 10);
      const imagePath = `public/recipe-book/community/${body.recipe.id}-${digest}.${uploadExtension(body.image.mimeType)}`;
      const imageBlob = await github<GitHubBlob>("/git/blobs", { method: "POST", body: JSON.stringify({ content: imageBytes.toString("base64"), encoding: "base64" }) });
      imageEntries.push({ path: imagePath, mode: "100644", type: "blob", sha: imageBlob.sha });
      imageUrl = imagePath.replace(/^public/, "");
    }

    const nextSource = sourceWithAddition(source, body, imageUrl);
    const sourceBlob = await github<GitHubBlob>("/git/blobs", { method: "POST", body: JSON.stringify({ content: Buffer.from(nextSource).toString("base64"), encoding: "base64" }) });
    const tree = await github<GitHubTree>("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree: [{ path: RECIPE_SOURCE_PATH, mode: "100644", type: "blob", sha: sourceBlob.sha }, ...imageEntries] }) });
    const commit = await github<CreatedCommit>("/git/commits", { method: "POST", body: JSON.stringify({ message: `Add ${body.recipe.title} to ${body.owner.name ?? body.owner.id}'s recipes`, tree: tree.sha, parents: [ref.object.sha] }) });
    await github(`/git/refs/heads/${encodeURIComponent(config.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });

    const siteUrl = (process.env.CARUSO_RECIPE_SITE_URL ?? "https://www.daytongrowth.co/projects/secret/recipes_for_benny/").replace(/\/$/, "");
    return Response.json({ ok: true, recipeId: body.recipe.id, commit: commit.html_url, deployment: "A production deployment will start from the new Git commit.", recipeUrl: `${siteUrl}/?recipe=${encodeURIComponent(body.recipe.id)}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recipe publishing failed.";
    const conflict = /already exists|update is not a fast forward|Reference update failed/i.test(message);
    return jsonError(message, conflict ? 409 : 500);
  }
}
