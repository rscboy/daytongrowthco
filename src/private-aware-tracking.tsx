"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
// Private memorial content and invitation fragments must never reach advertising
// pixels or session-replay tools. Project links use full-page navigation.
export function PrivateAwareTracking({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/book" || pathname.startsWith("/projects/secret/recipes_for_benny") || pathname.startsWith("/recipe-book/") || pathname.startsWith("/projects/secret/remembered-care") || pathname === "/projects/secret-projects/share/remembered_care" ? null : children;
}
