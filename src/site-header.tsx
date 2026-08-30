"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BrandWordmark } from "./brand-wordmark";

type PrimaryNavLink = { href: string; label: string; mobileLabel?: string };
const MOBILE_NAV_SCROLL_KEY = "dgc:mobile-nav-scroll-top";

export const primaryNavLinks: PrimaryNavLink[] = [
  { href: "/products/", label: "Solutions" },
  { href: "/quote/pricing", label: "Pricing" },
  { href: "/examples/", label: "Examples" },
  { href: "/how-it-works/", label: "How It Works", mobileLabel: "Process" },
  { href: "/aboutus", label: "About" },
];

export function InteractiveWordmark() {
  return <BrandWordmark interactive onDark />;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const restoreMobileFocusRef = useRef(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const productPaths = new Set(["/ai-phone-agents", "/website-design", "/missed-call-follow-up", "/google-reviews", "/google-review-texting", "/quote-tools", "/local-search", "/dashboards-portals"]);
  const isNavLinkActive = (href: string) => {
    const normalizedPath = pathname.replace(/\/$/, "") || "/";
    const normalizedHref = href.replace(/\/$/, "") || "/";
    return normalizedPath === normalizedHref || (normalizedHref === "/products" && productPaths.has(normalizedPath));
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    // Next can preserve the prior document position during client-side route
    // changes. Mobile primary navigation always represents a new page visit,
    // so it should begin at that page's top.
    if (window.sessionStorage.getItem(MOBILE_NAV_SCROLL_KEY) !== "1") return;
    window.sessionStorage.removeItem(MOBILE_NAV_SCROLL_KEY);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      });
    });
  }, [pathname]);

  const handleMobileNavigation = () => {
    restoreMobileFocusRef.current = false;
    setMobileOpen(false);
    window.sessionStorage.setItem(MOBILE_NAV_SCROLL_KEY, "1");
    // Also reset immediately for the active-page case, where there is no
    // pathname change to trigger the effect above.
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = mobilePanelRef.current;
    const mobileToggle = mobileToggleRef.current;
    const pageRegions = Array.from(document.querySelectorAll<HTMLElement>("main, body > footer"));
    pageRegions.forEach((region) => { region.inert = true; });

    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    window.requestAnimationFrame(() => focusable()[0]?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreMobileFocusRef.current = true;
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.classList.add("mobile-nav-lock");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("mobile-nav-lock");
      window.removeEventListener("keydown", onKeyDown);
      pageRegions.forEach((region) => { region.inert = false; });
      if (restoreMobileFocusRef.current) mobileToggle?.focus();
    };
  }, [mobileOpen]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Link className="site-offer-banner" href="/systems-that-pay/" aria-label="Free homepage redesign. Claim the offer.">
        <span className="site-offer-copy">
          <strong>Free homepage redesign.</strong>
        </span>
        <span className="site-offer-action">
          Claim offer
          <ArrowRight size={15} aria-hidden="true" />
        </span>
      </Link>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Primary">
        {isHome ? (
          <a href="#top" className="logo-lockup" aria-label="DaytonGrowthCo home">
            <InteractiveWordmark />
          </a>
        ) : (
          <Link href="/" className="logo-lockup" aria-label="DaytonGrowthCo home">
            <InteractiveWordmark />
          </Link>
        )}
        <div className="header-nav" aria-label="Sections">
          {primaryNavLinks.map((link) => {
            const active = isNavLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                scroll
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
                onClick={() => {
                  window.sessionStorage.setItem(MOBILE_NAV_SCROLL_KEY, "1");
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="header-actions">
          {isHome ? (
            <a className="button button-primary" href="#cta">
              Start a conversation
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link className="button button-primary" href="/#cta">
              Start a conversation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          <button
            ref={mobileToggleRef}
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobilePrimaryNav"
            onClick={() => {
              restoreMobileFocusRef.current = mobileOpen;
              setMobileOpen((open) => !open);
            }}
          >
            <span className="mobile-menu-glyph" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>
      <div
        ref={mobilePanelRef}
        id="mobilePrimaryNav"
        className="mobile-nav-panel"
        data-open={mobileOpen ? "true" : "false"}
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <nav aria-label="Mobile primary">
          {primaryNavLinks.map((link) => {
            const active = isNavLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                scroll
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
                onClick={handleMobileNavigation}
              >
                {link.mobileLabel ?? link.label}
              </Link>
            );
          })}
          {isHome ? (
            <a className="button button-primary" href="#cta" onClick={() => { restoreMobileFocusRef.current = false; setMobileOpen(false); }}>
              Start a conversation
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link className="button button-primary" href="/#cta" onClick={() => { restoreMobileFocusRef.current = false; setMobileOpen(false); window.sessionStorage.removeItem(MOBILE_NAV_SCROLL_KEY); }}>
              Start a conversation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
