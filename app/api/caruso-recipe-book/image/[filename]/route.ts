import { hasSecretProjectAccess } from "@/lib/secret-project-access";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    if (!(await hasSecretProjectAccess("recipes_for_benny"))) return new Response("Recipe Book access required.", { status: 403 });
    const { filename } = await params;
    if (!/^[a-z0-9-]+-[a-f0-9]{10}\.(?:jpg|png|webp)$/.test(filename) || filename.length > 110) return new Response("Photo not found.", { status: 404 });
    const token = process.env.CARUSO_RECIPE_GITHUB_TOKEN;
    const repository = process.env.CARUSO_RECIPE_GITHUB_REPOSITORY ?? "rscboy/daytongrowthco";
    const branch = process.env.CARUSO_RECIPE_GITHUB_BRANCH ?? "main";
    if (!token || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository)) return new Response("Photo storage unavailable.", { status: 503 });
    const response = await fetch(`https://api.github.com/repos/${repository}/contents/public/recipe-book/community/${filename}?ref=${encodeURIComponent(branch)}`, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/vnd.github.raw+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (!response.ok) return new Response("Photo unavailable.", { status: response.status === 404 ? 404 : 503 });
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 3_000_000) return new Response("Photo unavailable.", { status: 413 });
    const type = filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new Response(bytes, { headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, max-age=3600" } });
  } catch { return new Response("Photo storage unavailable.", { status: 503 }); }
}
