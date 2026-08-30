import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSecretProjectsSession, secretProjectsCookie } from "@/lib/secret-projects-auth";
import {
  getSecretProjectSetting,
  hasProjectAccessSession,
  projectAccessCookie,
} from "@/lib/secret-projects";

export async function requireSecretProjectAccess(id: string) {
  const cookieStore = await cookies();
  if (hasSecretProjectsSession(cookieStore.get(secretProjectsCookie)?.value)) return;

  const setting = await getSecretProjectSetting(id);
  const sharedAccess = hasProjectAccessSession(id, cookieStore.get(projectAccessCookie(id))?.value);
  if (setting.active && (!setting.passwordEnabled || sharedAccess)) return;

  redirect(`/projects/secret-projects/share/${id}`);
}
