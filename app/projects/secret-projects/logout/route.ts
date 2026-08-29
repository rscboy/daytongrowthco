import { NextResponse } from "next/server";
import { secretProjectsCookie } from "@/lib/secret-projects-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/projects/secret-projects", request.url), 303);
  response.cookies.set(secretProjectsCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
