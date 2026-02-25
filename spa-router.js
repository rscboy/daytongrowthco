// spa-router.js
(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const app = document.getElementById("app");

  const routes = {
    "/": "tpl-home",
    "/aboutus": "tpl-aboutus",
  };

  function forceTop() {
    // Do it immediately...
    window.scrollTo(0, 0);

    // ...then after layout/paint...
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    });

    // ...and one more after images/fonts may shift layout
    setTimeout(() => window.scrollTo(0, 0), 50);
  }

  function render(pathname) {
    const tplId = routes[pathname] || routes["/"];
    const tpl = document.getElementById(tplId);
    if (!tpl || !app) return;

    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    // Re-init per-route hooks (icons, reveals, etc.)
    if (typeof window.onRouteRendered === "function") window.onRouteRendered();

    // Scroll behavior:
    // - Only honor hashes on home route
    // - Otherwise ALWAYS force top (with timing protection)
    if (location.pathname === "/" && location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else forceTop();
    } else {
      forceTop();
    }
  }

  function navigate(to) {
    history.pushState(null, "", to);
    render(location.pathname);
  }

  // Only intercept anchors you mark with data-link
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

    // Keep hash only for home route links
    const to = url.pathname === "/" ? url.pathname + url.hash : url.pathname;
    navigate(to);
  });

  window.addEventListener("popstate", () => render(location.pathname));

  // Initial render
  render(location.pathname);

  if (typeof window.setCurrentYearOnce === "function") window.setCurrentYearOnce();
})();
