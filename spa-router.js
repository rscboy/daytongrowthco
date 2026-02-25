// spa-router.js
(() => {
  // Prevent browser from trying to restore scroll on SPA navigations
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const app = document.getElementById("app");

  // Map routes -> template IDs
  const routes = {
    "/": "tpl-home",
    "/aboutus": "tpl-aboutus",
  };

  function render(pathname) {
    const tplId = routes[pathname] || routes["/"];
    const tpl = document.getElementById(tplId);

    if (!tpl || !app) return;

    // Swap content
    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    // Scroll behavior:
    // - Only honor hash scrolling on the HOME route (/)
    // - For all other routes, always go to top
    if (location.pathname === "/" && location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Use "auto" so it doesn't animate from some deep scroll position
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    // Re-init per-route hooks (icons, reveals, etc.)
    if (typeof window.onRouteRendered === "function") {
      window.onRouteRendered();
    }
  }

  function navigate(to) {
    history.pushState(null, "", to);
    render(location.pathname);
  }

  // Intercept internal navigation
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    // allow new-tab / modified clicks
    if (
      a.target === "_blank" ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    const url = new URL(a.getAttribute("href") || a.href, location.origin);

    // only same-origin
    if (url.origin !== location.origin) return;

    // Decide if this click should be handled by the SPA:
    // 1) Any known route, e.g. /aboutus
    // 2) Any home hash navigation, e.g. /#services
    const isKnownRoute = Object.prototype.hasOwnProperty.call(routes, url.pathname);
    const isHomeHashNav = url.pathname === "/" && !!url.hash;

    if (!isKnownRoute && !isHomeHashNav) return;

    e.preventDefault();

    // IMPORTANT:
    // - If going to a home section, keep the hash.
    // - Otherwise, drop hash so /aboutus never inherits a scroll target.
    const to = url.pathname === "/" ? url.pathname + url.hash : url.pathname;

    navigate(to);
  });

  // Back/forward support
  window.addEventListener("popstate", () => render(location.pathname));

  // Initial render
  render(location.pathname);

  // Optional: run once hooks if you defined them
  if (typeof window.setCurrentYearOnce === "function") {
    window.setCurrentYearOnce();
  }
})();
