import { NextResponse } from "next/server";
import {
  createSecretProjectsSession,
  passwordMatches,
  secretProjectsConfigured,
  secretProjectsCookie,
  secretProjectsSessionSeconds,
} from "@/lib/secret-projects-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  const destination = new URL("/projects/secret-projects", request.url);

  if (!secretProjectsConfigured()) {
    destination.searchParams.set("error", "config");
    return NextResponse.redirect(destination, 303);
  }

  if (!passwordMatches(password)) {
    destination.searchParams.set("error", "invalid");
    return NextResponse.redirect(destination, 303);
  }

  const session = createSecretProjectsSession();
  if (!session) {
    destination.searchParams.set("error", "config");
    return NextResponse.redirect(destination, 303);
  }

  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(secretProjectsCookie, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: secretProjectsSessionSeconds,
    priority: "high",
  });
  return response;
}
