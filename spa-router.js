// spa-router.js
(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const app = document.getElementById("app");

  const routes = {
    "/": "tpl-home",
    "/aboutus": "tpl-aboutus",
  };

  // --- Scroll lock helpers (prevents "keeps my old scroll position" bugs) ---
  let lockedScrollY = 0;

  function lockScroll() {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
  }

  function scrollTopHard() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function scrollTopAfterPaintAndImages() {
    // immediate
    scrollTopHard();

    // after paint (twice)
    requestAnimationFrame(() => {
      scrollTopHard();
      requestAnimationFrame(scrollTopHard);
    });

    // after short delays (layout shifts/fonts)
    setTimeout(scrollTopHard, 50);
    setTimeout(scrollTopHard, 200);

    // after images load (biggest source of jump)
    const imgs = app ? app.querySelectorAll("img") : [];
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", scrollTopHard, { once: true });
        img.addEventListener("error", scrollTopHard, { once: true });
      }
    });

    setTimeout(scrollTopHard, 350);
  }

  function render(pathname) {
    const tplId = routes[pathname] || routes["/"];
    const tpl = document.getElementById(tplId);
    if (!tpl || !app) return;

    // Swap content
    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    // Re-init per-route hooks (icons, reveals, etc.)
    if (typeof window.onRouteRendered === "function") window.onRouteRendered();

    // Scroll rules:
    // - If HOME (/) + hash: scroll to section
    // - Otherwise: go to top (robust)
    if (location.pathname === "/" && location.hash) {
      // unlock first so scrollIntoView can work normally
      unlockScroll();
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollTopAfterPaintAndImages();
      }
    } else {
      // Force top while still locked, then unlock and force again
      scrollTopHard();
      unlockScroll();
      scrollTopAfterPaintAndImages();
    }
  }

  function navigate(to) {
    // Lock scroll BEFORE changing state/rendering
    lockScroll();

    history.pushState(null, "", to);
    render(location.pathname);
  }

  // Only intercept links you mark with data-link
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

    // Keep hash only for home-section links
    const to = url.pathname === "/" ? url.pathname + url.hash : url.pathname;
    navigate(to);
  });

  window.addEventListener("popstate", () => {
    // Back/forward: lock + render so it doesn’t preserve old scroll
    lockScroll();
    render(location.pathname);
  });

  // Initial render
  render(location.pathname);

  if (typeof window.setCurrentYearOnce === "function") window.setCurrentYearOnce();
})();
