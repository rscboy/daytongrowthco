import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect("https://www.daytongrowth.co/local-search", 308);
}
