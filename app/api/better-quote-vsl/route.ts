import { NextRequest } from "next/server";

const sourceUrl = "https://drive.usercontent.google.com/download?id=1FFoD2DNkIcUulrXOEDEIB5-VR0fL1aEY&export=download&confirm=t";

export const dynamic = "force-dynamic";

/** Streams the B-test video without sending visitors to its Google Drive page. */
export async function GET(request: NextRequest) {
  const range = request.headers.get("range");
  const upstream = await fetch(sourceUrl, { headers: range ? { range } : undefined, cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("Video is temporarily unavailable.", { status: 502 });
  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("cache-control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  headers.set("cdn-cache-control", "public, s-maxage=3600, stale-while-revalidate=86400");
  headers.set("vercel-cdn-cache-control", "public, s-maxage=3600, stale-while-revalidate=86400");
  headers.set("x-content-type-options", "nosniff");
  return new Response(upstream.body, { status: upstream.status, headers });
}
