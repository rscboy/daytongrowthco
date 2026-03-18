// spa-router.js
(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const app = document.getElementById("app");

  const routes = {
    "/": "tpl-home",
    "/aboutus": "tpl-aboutus",
  };

  function scrollTopHard() {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function forceTopAfterPaintAndImages() {
    // Synchronous first — runs before browser has a chance to restore scroll
    scrollTopHard();

    requestAnimationFrame(() => {
      scrollTopHard();
      requestAnimationFrame(scrollTopHard);
    });

    setTimeout(scrollTopHard, 50);
    setTimeout(scrollTopHard, 200);
    setTimeout(scrollTopHard, 350);

    const imgs = app ? app.querySelectorAll("img") : [];
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", scrollTopHard, { once: true });
        img.addEventListener("error", scrollTopHard, { once: true });
      }
    });
  }

  function render(pathname, hash) {
    const tplId = routes[pathname] || routes["/"];
    const tpl = document.getElementById(tplId);
    if (!tpl || !app) return;

    // Scroll to top BEFORE swapping content so there's no flash at old position
    scrollTopHard();

    // Swap content
    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    // Re-init per-route hooks (lucide, reveals, etc.)
    if (typeof window.onRouteRendered === "function") window.onRouteRendered();

    const hashTarget = hash ? app.querySelector(hash) || document.querySelector(hash) : null;

    if (hashTarget) {
      requestAnimationFrame(() => {
        hashTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    forceTopAfterPaintAndImages();
  }

  function navigate(to) {
    const url = new URL(to, location.origin);

    // Preserve hashes so route-specific anchors can scroll into place after render
    const pushPath = url.pathname + url.hash;
    history.pushState(null, "", pushPath);

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

    navigate(url.pathname + url.hash);
  });

  window.addEventListener("popstate", () => {
    render(location.pathname, location.hash);
  });

  // Initial render
  render(location.pathname, location.hash);

  if (typeof window.setCurrentYearOnce === "function") window.setCurrentYearOnce();
})();
