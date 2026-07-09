import { readFile } from "node:fs/promises";
import { join } from "node:path";

const legacyFiles = [
  "404.html",
  "aboutus.html",
  "accessibility/index.html",
  "amp.html",
  "buisness_card.html",
  "cinematic.html",
  "disclaimer/index.html",
  "emailsignature.html",
  "local-seo/index.html",
  "privacy-policy/index.html",
  "set-password.html",
  "terms-of-service/index.html",
  "watson-roofing.html",
  "website-design/index.html",
  "website-maintenance/index.html",
  "custom-software-vs-off-the-shelf/index.html",
  "ai-phone-agent-vs-answering-service/index.html",
  "dev-shop-vs-ai-assisted-development/index.html",
  "custom-software-for-roofing-companies/index.html",
  "custom-software-for-hvac-companies/index.html",
  "custom-software-for-landscaping-companies/index.html",
] as const;

type LegacyFile = (typeof legacyFiles)[number];

const legacyMinimalistPolish = `
<style id="dgc-legacy-minimalist-polish">
  :root {
    --dgc-paper: #fbfbfa;
    --dgc-paper-alt: #f7f6f3;
    --dgc-surface: #ffffff;
    --dgc-ink: #171717;
    --dgc-muted: #6f6d68;
    --dgc-line: #e8e6df;
    --dgc-accent: #18174d;
  }

  html { background: var(--dgc-paper) !important; }
  body {
    color: var(--dgc-ink) !important;
    background: var(--dgc-paper) !important;
    font-family: "Hanken Grotesk Variable", "Geist Sans", "Helvetica Neue", Arial, sans-serif !important;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  header,
  footer {
    color: var(--dgc-ink) !important;
    background: var(--dgc-paper) !important;
    border-color: var(--dgc-line) !important;
  }

  main {
    max-width: 72rem !important;
  }

  article,
  section,
  details,
  li,
  div {
    box-shadow: none !important;
  }

  section[class*="bg-"],
  article[class*="bg-"],
  details[class*="bg-"],
  li[class*="bg-"],
  div[class*="bg-"] {
    background-color: var(--dgc-surface) !important;
    background-image: none !important;
  }

  section[class*="rounded"],
  article[class*="rounded"],
  details[class*="rounded"],
  li[class*="rounded"],
  div[class*="rounded"] {
    border-radius: 10px !important;
  }

  [class*="border"] {
    border-color: var(--dgc-line) !important;
  }

  h1,
  h2,
  h3,
  h4,
  strong,
  summary,
  .font-semibold,
  .font-bold {
    color: var(--dgc-ink) !important;
  }

  h1 {
    max-width: 14ch;
    font-size: clamp(2.05rem, 8vw, 3.45rem) !important;
    letter-spacing: -0.035em !important;
    line-height: 1.02 !important;
  }

  h2 {
    font-size: clamp(1.55rem, 5.8vw, 2.25rem) !important;
    letter-spacing: -0.02em !important;
    line-height: 1.12 !important;
  }

  p,
  li,
  address,
  dd,
  .text-slate-300,
  .text-slate-400,
  .text-slate-500,
  .text-slate-600,
  .text-slate-700 {
    color: var(--dgc-muted) !important;
    line-height: 1.62 !important;
  }

  a {
    color: var(--dgc-ink) !important;
    text-decoration-color: rgba(23, 23, 23, 0.24) !important;
    text-underline-offset: 0.22em;
  }

  a[class*="bg-"],
  a[class*="rounded"],
  button[class*="bg-"],
  button[class*="rounded"] {
    min-height: 44px !important;
    border-radius: 8px !important;
    border: 1px solid var(--dgc-ink) !important;
    background: var(--dgc-ink) !important;
    color: #ffffff !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-decoration: none !important;
    touch-action: manipulation;
  }

  nav a,
  footer a,
  address a {
    min-height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
  }

  span[class*="rounded-full"],
  span[class*="bg-blue"],
  span[class*="bg-slate"],
  span[class*="bg-red"],
  span[class*="bg-amber"] {
    border-radius: 6px !important;
    background: var(--dgc-paper-alt) !important;
    color: var(--dgc-muted) !important;
  }

  svg {
    color: currentColor !important;
  }

  .bg-blue-50,
  .bg-red-50,
  .bg-amber-50 {
    background: var(--dgc-paper-alt) !important;
  }

  .text-blue-300,
  .text-blue-500,
  .text-blue-600,
  .text-red-800,
  .text-amber-800 {
    color: var(--dgc-accent) !important;
  }

  @media (max-width: 700px) {
    main {
      padding: 2rem 1.25rem !important;
    }

    a {
      height: auto;
      min-height: 44px !important;
      min-width: 44px;
      display: inline-flex !important;
      align-items: center !important;
      touch-action: manipulation;
    }

    address a,
    footer a {
      height: 44px !important;
    }

    header a {
      min-height: 44px !important;
    }

    main > article,
    main > section,
    section[class*="rounded"],
    article[class*="rounded"] {
      padding: 1.15rem !important;
    }

    section {
      margin-top: 2rem !important;
    }

    details {
      padding: 1rem 0 !important;
      border-width: 0 0 1px !important;
      border-radius: 0 !important;
      background: transparent !important;
    }

    summary {
      min-height: 44px !important;
      display: flex !important;
      align-items: center !important;
      cursor: pointer;
    }

    p,
    li,
    address,
    dd {
      font-size: 1rem !important;
    }

    [class*="text-[13px]"],
    [class*="text-[14px]"],
    [class*="text-sm"] {
      font-size: 0.95rem !important;
    }

    footer nav {
      gap: 0.5rem 1rem !important;
    }
  }
</style>`;

export async function legacyHtmlResponse(file: LegacyFile) {
  if (!legacyFiles.includes(file)) {
    return new Response("Not found", { status: 404 });
  }
  const source = await readFile(join(process.cwd(), "legacy-html", file), "utf8");
  const html = source.includes("</head>")
    ? source.replace("</head>", `${legacyMinimalistPolish}\n</head>`)
    : `${legacyMinimalistPolish}\n${source}`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
