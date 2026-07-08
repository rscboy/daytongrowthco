"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

export const primaryNavLinks = [
  { href: "/what-we-build/", label: "What We Build" },
  { href: "/examples/", label: "Examples" },
  { href: "/how-it-works/", label: "How It Works" },
  { href: "/aboutus", label: "About" },
];

export function InteractiveWordmark() {
  return (
    <span className="nav-wordmark interactive-wordmark" aria-hidden="true">
      <span className="nav-wordmark-dayton">
        <span className="wordmark-initial">D</span><span className="wordmark-rest">ayton</span>
      </span>
      <span className="nav-wordmark-growth">
        <span className="wordmark-initial">G</span><span className="wordmark-rest">rowth</span>
      </span>
      <b>
        <span className="wordmark-initial">C</span><span className="wordmark-rest">o.</span>
      </b>
    </span>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

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
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Link className="site-offer-banner" href="/systems-that-pay/">
        <span className="site-offer-copy">
          <strong>Free homepage redesign available.</strong>
          <span>Custom concept · No obligation</span>
        </span>
        <span className="site-offer-action">
          Claim free redesign
          <ArrowRight size={14} aria-hidden="true" />
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
            const active = pathname === link.href || pathname === link.href.replace(/\/$/, "");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="header-actions">
          {isHome ? (
            <a className="button button-primary" href="#cta">
              Schedule consultation
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link className="button button-primary" href="/#cta">
              Schedule consultation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobilePrimaryNav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <div id="mobilePrimaryNav" className="mobile-nav-panel" hidden={!mobileOpen}>
        <nav aria-label="Mobile primary">
          {primaryNavLinks.map((link) => {
            const active = pathname === link.href || pathname === link.href.replace(/\/$/, "");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          {isHome ? (
            <a className="button button-primary" href="#cta" onClick={() => setMobileOpen(false)}>
              Schedule consultation
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link className="button button-primary" href="/#cta">
              Schedule consultation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
