import { NextResponse } from "next/server";
import {
  createProjectAccessSession,
  getSecretProject,
  getSecretProjectSetting,
  projectAccessCookie,
  projectPasswordMatches,
  projectShareSessionSeconds,
} from "@/lib/secret-projects";

export async function POST(request: Request, context: RouteContext<"/projects/secret-projects/share/[slug]/login">) {
  const { slug } = await context.params;
  const project = getSecretProject(slug);
  if (!project) return NextResponse.redirect(new URL("/projects/secret-projects", request.url), 303);

  const setting = await getSecretProjectSetting(slug);
  if (!setting.active) return NextResponse.redirect(new URL(`/projects/secret-projects/share/${slug}`, request.url), 303);
  if (!setting.passwordEnabled) return NextResponse.redirect(new URL(project.href, request.url), 303);

  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  if (!projectPasswordMatches(password, setting.passwordHash)) {
    return NextResponse.redirect(new URL(`/projects/secret-projects/share/${slug}?error=invalid`, request.url), 303);
  }

  const session = createProjectAccessSession(slug);
  if (!session) return NextResponse.redirect(new URL(`/projects/secret-projects/share/${slug}?error=invalid`, request.url), 303);
  const response = NextResponse.redirect(new URL(project.href, request.url), 303);
  response.cookies.set(projectAccessCookie(slug), session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/projects/secret",
    maxAge: projectShareSessionSeconds,
  });
  return response;
}
