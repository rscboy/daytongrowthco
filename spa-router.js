(function () {
  const app = document.getElementById("app");
  const routes = {
    "/": "tpl-home",
    "/aboutus": "tpl-aboutus",
  };

  function render(pathname) {
    const tplId = routes[pathname] || routes["/"];
    const tpl = document.getElementById(tplId);

    if (!tpl) {
      app.innerHTML = "<div style='padding:40px'>Missing template.</div>";
      return;
    }

    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    // Scroll behavior:
    // - If there’s a hash, scroll to it (home sections)
    // - Else scroll to top for normal routes
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Re-init per-page JS hooks
    if (window.onRouteRendered) window.onRouteRendered();
  }

  function navigate(to) {
    history.pushState(null, "", to);
    render(location.pathname);
  }

  // Intercept internal link clicks
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    // ignore new tab / modified clicks
    if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const url = new URL(a.href, location.origin);

    // only handle same-origin
    if (url.origin !== location.origin) return;

    // allow normal anchor scrolling for hashes on same page (like /#services)
    // BUT: if you’re currently on /aboutus and click /#services, we want to SPA-navigate to /
    const isHashNav = url.pathname === "/" && url.hash;

    // handle SPA routes or hash-to-home
    const isSpaRoute = routes[url.pathname] || isHashNav;

    if (!isSpaRoute) return;

    e.preventDefault();
    navigate(url.pathname + url.hash);
  });

  // Back/forward support
  window.addEventListener("popstate", () => render(location.pathname));

  // Initial render
  render(location.pathname);

  // Run once hooks if you defined them
  if (window.setCurrentYearOnce) window.setCurrentYearOnce();
})();
