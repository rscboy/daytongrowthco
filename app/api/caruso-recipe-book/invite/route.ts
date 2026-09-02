import { createGuestRecipeCode } from "../access";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { code, expiresAt } = createGuestRecipeCode();
    return Response.json({ ok: true, code, expiresAt }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Could not create a guest code." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
