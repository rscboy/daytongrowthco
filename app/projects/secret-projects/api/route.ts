import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasSecretProjectsSession, secretProjectsCookie } from "@/lib/secret-projects-auth";
import {
  getSecretProject,
  getSecretProjectSettings,
  hashProjectPassword,
  publicSetting,
  saveSecretProjectSettings,
} from "@/lib/secret-projects";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!hasSecretProjectsSession(cookieStore.get(secretProjectsCookie)?.value)) {
    return NextResponse.json({ error: "Your private workspace session has expired." }, { status: 401 });
  }

  let input: { id?: unknown; active?: unknown; passwordEnabled?: unknown; password?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "The update could not be read." }, { status: 400 });
  }

  const id = typeof input.id === "string" ? input.id : "";
  if (!getSecretProject(id)) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const settings = await getSecretProjectSettings();
  const current = settings[id];
  const password = typeof input.password === "string" ? input.password.trim() : "";
  const next = {
    ...current,
    ...(typeof input.active === "boolean" ? { active: input.active } : {}),
    ...(typeof input.passwordEnabled === "boolean" ? { passwordEnabled: input.passwordEnabled } : {}),
    ...(password ? { passwordHash: hashProjectPassword(password) } : {}),
    updatedAt: new Date().toISOString(),
  };

  if (password && password.length < 6) {
    return NextResponse.json({ error: "Use at least 6 characters for the project password." }, { status: 400 });
  }
  if (next.passwordEnabled && !next.passwordHash) {
    return NextResponse.json({ error: "Set a password before turning password protection on." }, { status: 400 });
  }

  settings[id] = next;
  try {
    await saveSecretProjectSettings(settings);
  } catch {
    return NextResponse.json({ error: "The setting could not be saved. Check the project storage connection." }, { status: 500 });
  }

  return NextResponse.json({ setting: publicSetting(next) });
}
