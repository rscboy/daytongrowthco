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

  function keepTargetAtTop(target) {
    if (!target) return;

    const alignTarget = () => {
      const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset);
      window.scrollTo({ top, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = top;
      document.body.scrollTop = top;
    };

    alignTarget();

    requestAnimationFrame(() => {
      alignTarget();
      requestAnimationFrame(alignTarget);
    });

    setTimeout(alignTarget, 50);
    setTimeout(alignTarget, 200);
    setTimeout(alignTarget, 350);

    const imgs = app ? app.querySelectorAll("img") : [];
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", alignTarget, { once: true });
        img.addEventListener("error", alignTarget, { once: true });
      }
    });
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
      keepTargetAtTop(hashTarget);
      return;
    }

    forceTopAfterPaintAndImages();
  }

  function normalizeRouteHash(url) {
    if (url.pathname === "/aboutus" && url.hash === "#about-top") {
      return "";
    }

    return url.hash;
  }

  function navigate(to) {
    const url = new URL(to, location.origin);
    const normalizedHash = normalizeRouteHash(url);

    const pushPath = url.pathname + normalizedHash;
    history.pushState(null, "", pushPath);

    render(url.pathname, normalizedHash);
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
    const normalizedHash = normalizeRouteHash(new URL(location.href));
    render(location.pathname, normalizedHash);
  });

  // Initial render
  render(location.pathname, normalizeRouteHash(new URL(location.href)));

  if (typeof window.setCurrentYearOnce === "function") window.setCurrentYearOnce();
})();
