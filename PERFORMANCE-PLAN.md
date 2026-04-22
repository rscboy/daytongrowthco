# Website Speed Improvement Plan (No Feature Removal)

This plan keeps all current functionality and content, while reducing load time and improving Core Web Vitals.

## 1) Replace runtime Tailwind CDN with prebuilt CSS (highest impact)
- Current homepage loads Tailwind from `https://cdn.tailwindcss.com` at runtime.
- This adds JS parse/execute work on every page load before styling is finalized.
- Keep all existing design/classes, but compile Tailwind ahead of time into a static stylesheet and serve it locally.
- Expected impact: lower render-blocking JS and faster First Contentful Paint/LCP.

## 2) Load Netlify Identity widget only when needed
- Current homepage always loads `https://identity.netlify.com/v1/netlify-identity-widget.js`.
- Most visitors never need the identity flow.
- Keep recovery and invite behavior by conditionally injecting the script only when the URL hash contains `invite_token=` or `recovery_token=`.
- Also gate loading to admin/auth routes where applicable.
- Expected impact: reduced JS payload and faster Time to Interactive.

## 3) Move legal modal content out of inline JavaScript blob
- The page ships a large `legalContent` object with full terms/privacy/disclaimer/accessibility HTML in JS.
- Keep all legal content, but fetch each legal page on demand from existing routes:
  - `/terms-of-service/`
  - `/privacy-policy/`
  - `/disclaimer/`
  - `/accessibility/`
- Cache fetched HTML in memory after first open.
- Expected impact: smaller initial HTML/JS parse cost without removing content.

## 4) Defer non-critical animations until idle
- The hero mockup animation and several observers run immediately on `DOMContentLoaded`.
- Keep animations, but delay startup using `requestIdleCallback` fallback to `setTimeout`.
- Respect reduced-motion preferences and skip expensive loops when `prefers-reduced-motion: reduce` is enabled.
- Expected impact: better responsiveness on lower-end mobile devices.

## 5) Use stronger connection hints and script attributes
- Add `crossorigin` on third-party preconnects where relevant.
- Mark third-party scripts with `defer` when execution order allows.
- Keep analytics and functionality intact.
- Expected impact: improved connection reuse and less parser blocking.

## 6) Optimize image delivery without removing imagery
- Keep the same images but convert large JPEG/PNG assets to AVIF/WebP variants and use `<picture>`.
- Preserve visual output with quality targets (e.g., AVIF q45–55 / WebP q70–80).
- Ensure precise `width`/`height` are set for all images (already mostly done on homepage).
- Expected impact: lower transfer size and improved LCP.

## 7) Enable CDN caching/compression policies
- Ensure static assets are served with long-lived immutable cache headers (`cache-control: public,max-age=31536000,immutable`) for versioned files.
- Enable Brotli and fallback gzip on HTML/CSS/JS/SVG.
- Keep current content and routes unchanged.
- Expected impact: faster repeat visits and lower bandwidth.

## 8) Add performance budgets + regression checks
- Add a lightweight Lighthouse CI check with budgets (LCP, JS bytes, image bytes).
- Track regressions before publishing.
- Keep shipping cadence while preventing slowdowns from future edits.

## Suggested Implementation Order
1. Prebuild Tailwind CSS.
2. Conditional Netlify Identity loading.
3. Lazy-load legal content.
4. Animation idle scheduling and reduced-motion handling.
5. Image format optimization.
6. CDN cache/compression hardening.
7. Lighthouse CI budget enforcement.
