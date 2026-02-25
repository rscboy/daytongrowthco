// spa-router.js
(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const app = document.getElementById("app");

  const routes = {
    "/": "tpl-home",
    "/aboutus": "tpl-aboutus",
  };

  function scrollTopHard() {
    // Blur can prevent "scroll into view" fights (especially after hash jumps)
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function forceTopAfterPaintAndImages() {
    scrollTopHard();

    // after paint (twice)
    requestAnimationFrame(() => {
      scrollTopHard();
      requestAnimationFrame(scrollTopHard);
    });

    // after short delays (fonts/layout shifts)
    setTimeout(scrollTopHard, 50);
    setTimeout(scrollTopHard, 200);

    // after images load (major cause of jumping)
    const imgs = app ? app.querySelectorAll("img") : [];
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", scrollTopHard, { once: true });
        img.addEventListener("error", scrollTopHard, { once: true });
      }
    });

    setTimeout(scrollTopHard, 350);
  }

  function render(pathname, hash) {
    const tplId = routes[pathname] || routes["/"];
    const tpl = document.getElementById(tplId);
    if (!tpl || !app) return;

    // Swap content
    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    // Re-init per-route hooks (lucide, reveals, etc.)
    if (typeof window.onRouteRendered === "function") window.onRouteRendered();

    // Scroll rules:
    // - Only honor hash scrolling on HOME (/)
    // - All other routes: ALWAYS go to top
    if (pathname === "/" && hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else forceTopAfterPaintAndImages();
    } else {
      forceTopAfterPaintAndImages();
    }
  }

  function navigate(to) {
    const url = new URL(to, location.origin);

    // Update URL first
    history.pushState(null, "", url.pathname + url.hash);

    // Render using the URL we just pushed (never stale hash)
    render(url.pathname, url.hash);
  }

  // Only intercept <a data-link>
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-link]");
    if (!a) return;

    if (
      a.target === "_blank" ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) return;

    const href = a.getAttribute("href");
    if (!href) return;

    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return;

    const isKnownRoute = Object.prototype.hasOwnProperty.call(routes, url.pathname);
    const isHomeHashNav = url.pathname === "/" && !!url.hash;
    if (!isKnownRoute && !isHomeHashNav) return;

    e.preventDefault();

    // Keep hash only for home-section links. Drop it for /aboutus.
    const to = url.pathname === "/" ? url.pathname + url.hash : url.pathname;

    navigate(to);
  });

  window.addEventListener("popstate", () => {
    render(location.pathname, location.hash);
  });

  // Initial render
  render(location.pathname, location.hash);

  if (typeof window.setCurrentYearOnce === "function") window.setCurrentYearOnce();
})();
