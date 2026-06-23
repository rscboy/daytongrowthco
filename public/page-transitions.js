(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const style = document.createElement("style");
  style.id = "dgc-page-transitions";
  style.textContent = `
    @keyframes dgc-page-in {
      from {
        opacity: 0;
        transform: translateY(9px) scale(0.998);
        filter: blur(2px);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    html.dgc-transition-fallback.dgc-page-entering body {
      animation: dgc-page-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    html.dgc-transition-fallback body {
      transition:
        opacity 180ms cubic-bezier(0.4, 0, 1, 1),
        transform 180ms cubic-bezier(0.4, 0, 1, 1),
        filter 180ms cubic-bezier(0.4, 0, 1, 1);
    }

    html.dgc-transition-fallback.dgc-page-leaving body {
      opacity: 0;
      transform: translateY(-4px) scale(0.997);
      filter: blur(1.5px);
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      html.dgc-transition-fallback.dgc-page-entering body {
        animation: none;
      }

      html.dgc-transition-fallback body {
        transition: none;
      }

      html.dgc-transition-fallback.dgc-page-leaving body {
        opacity: 1;
        transform: none;
        filter: none;
      }
    }
  `;
  document.head.appendChild(style);

  document.documentElement.classList.add("dgc-transition-fallback", "dgc-page-entering");

  let entranceTimer;

  function enterPage() {
    window.clearTimeout(entranceTimer);
    document.documentElement.classList.remove("dgc-page-leaving");

    if (prefersReducedMotion.matches) {
      document.documentElement.classList.remove("dgc-page-entering");
      return;
    }

    document.documentElement.classList.remove("dgc-page-entering");
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add("dgc-page-entering");

    entranceTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("dgc-page-entering");
    }, 440);
  }

  window.addEventListener("pageshow", enterPage);

  function handleFallbackNavigation(event) {
    if (prefersReducedMotion.matches || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    if (link.dataset.noPageTransition !== undefined) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (!["http:", "https:"].includes(destination.protocol)) return;

    const current = new URL(window.location.href);
    const isSameDocument =
      destination.pathname === current.pathname &&
      destination.search === current.search;

    if (isSameDocument && destination.hash) return;

    event.preventDefault();
    window.clearTimeout(entranceTimer);
    document.documentElement.classList.remove("dgc-page-entering");
    document.documentElement.classList.add("dgc-page-leaving");

    window.setTimeout(() => {
      window.location.assign(destination.href);
    }, 175);
  }

  // Register after deferred enhancement scripts so features such as the legal
  // document dialog retain first right of refusal over their own links.
  window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", handleFallbackNavigation);
  });
})();
