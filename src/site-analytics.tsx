"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { captureAttribution } from "@/src/funnel-analytics";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (command: "event", eventName: string, eventParams?: Record<string, string>) => void;
  fbq?: (command: "track", eventName: "PageView", eventParams?: Record<string, string>) => void;
};

export function SiteAnalytics() {
  const pathname = usePathname();
  const firstPage = useRef(true);

  useEffect(() => {
    if (pathname === "/book" || pathname.startsWith("/projects/secret/recipes_for_benny") || pathname.startsWith("/recipe-book/") || pathname.startsWith("/projects/secret/remembered-care") || pathname === "/projects/secret-projects/share/remembered_care") return;
    captureAttribution("site");
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }

    const analyticsWindow = window as AnalyticsWindow;
    const pageParams = {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    };
    if (analyticsWindow.gtag) analyticsWindow.gtag("event", "page_view", pageParams);
    else (analyticsWindow.dataLayer ||= []).push(["event", "page_view", pageParams]);
    analyticsWindow.fbq?.("track", "PageView", { page_path: pathname });
  }, [pathname]);

  return null;
}
