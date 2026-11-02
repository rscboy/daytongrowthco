import { readFileSync } from "node:fs";

const requiredMarkers = [
  { file: "src/clarity-sections.tsx", markers: ["DaytonGrowthCo. builds websites, automates customer follow-up, and creates custom business tools.", "Selected projects", "How your project works"] },
  {
    file: "src/air-redesign.css",
    markers: [
      "Pricing — a guided, responsive decision surface",
      ".site-pricing-page .site-pricing-services",
      ".website-program .program-copy .button.button-primary",
    ],
  },
  {
    file: "src/main.tsx",
    markers: [
      "Make repeated work simpler.",
      "<TernHomepage",
      "heroMedia={<BrandHeroFilm />}",
      "inquiry={<FinalCTA />}",
      "footer={<SiteFooter />}",
      "Tell us what you need",
      "Clear pricing for the services with a defined starting point.",
      "Website Migration Program™",
      "The Better Quote Program™",
      "<SchedulingSection compact />",
    ],
    forbidden: [
      "We build phone agents",
      "Two flagship programs.",
    ],
  },
  {
    file: "src/brand-hero-film.tsx",
    markers: ["/brand/hero-window-light.mp4", "/brand/hero-window-light-poster.jpg", "useReducedMotion", "playsInline"],
  },
  {
    file: "src/tern-homepage.module.css",
    markers: [".wordmark { display: inline-flex; align-items: center;", ".wordmark :global(.dgc-brand-lockup svg) { width: 1.2em; height: 1.225em; }"],
  },
  {
    file: "src/tern-homepage.tsx",
    markers: [
      'id="main-content"',
      "Make repeated<br /><em>work simpler.</em>",
      "Websites, customer follow-up,",
      "Selected projects",
      "marketingFaqs.map",
      'id="programs"',
      'id="process"',
      "context.revert()",
      "lenis?.destroy()",
      "prefers-reduced-motion: no-preference",
    ],
  },
  {
    file: "app/projects/secret/recipes_for_benny/page.tsx",
    markers: [
      'title: "Caruso Recipe Book"',
      'siteName: "Caruso Recipe Book"',
      "recipe_sammy.png",
    ],
    forbidden: [
      'title: "Benny\'s recipe book"',
      'siteName: "Recipes for Benny"',
    ],
  },
  {
    file: "app/projects/secret/recipes_for_benny/recipe-book.tsx",
    markers: [
      'label: "Sammy\'s Recipes"',
      'image: "/recipe-book/sammy-cooks-chili.png"',
      "Choose whose recipes appear first",
      "Adjust portions",
    ],
  },
  {
    file: "app/projects/secret-projects/project-manager.tsx",
    markers: [
      "Everything you’ve built,",
      "Visitor password",
      "live preview",
      "Copy share link",
    ],
  },
  {
    file: "lib/secret-projects.ts",
    markers: [
      'const SETTINGS_STORAGE_KEY = "secret-projects-settings"',
      "hashProjectPassword",
      "createProjectAccessSession",
      "internalProjectStorageConfigured",
      "readInternalProjectStorage<SettingsStore>",
      "writeInternalProjectStorage(SETTINGS_STORAGE_KEY, normalized)",
      "older deployment can never erase newer work",
      "No defaults were applied",
    ],
    forbidden: ["INITIALLY_SHARED_PROJECTS", "SETTINGS_BLOB_PATH"],
  },
  {
    file: "app/api/caruso-recipe-book/invite/route.ts",
    markers: [
      "hasSecretProjectsSession",
      'error: "Unauthorized."',
      "status: 401",
    ],
  },
  {
    file: "app/quote/pricing/page.tsx",
    markers: [
      'initialPath="/quote/pricing"',
      "https://www.daytongrowth.co/quote/pricing",
    ],
  },
  {
    file: "next.config.mjs",
    markers: ["trailingSlash: false"],
    forbidden: ["skipTrailingSlashRedirect: true"],
  },
  {
    file: "scripts/daytongrowthco-app-script.gs",
    markers: [
      'if (check.status !== "ok")',
      'return { status: "reject", detail: "missing token" }',
      "TURNSTILE_EXPECTED_HOSTNAMES",
    ],
    forbidden: ['status: "unverified"'],
  },
];

const failures = [];

// Protect the approved film and its fallback from older deployment snapshots.
for (const file of ["public/brand/hero-window-light.mp4", "public/brand/hero-window-light-poster.jpg"]) {
  try {
    const asset = readFileSync(file);
    const valid = file.endsWith(".mp4") ? asset.subarray(4, 8).toString() === "ftyp" : asset[0] === 0xff && asset[1] === 0xd8;
    if (asset.length < 1024 || !valid) failures.push(`${file} is not a valid hero asset`);
  } catch {
    failures.push(`${file} is missing`);
  }
}

for (const requirement of requiredMarkers) {
  let source = "";
  try {
    source = readFileSync(requirement.file, "utf8");
  } catch {
    failures.push(`${requirement.file} is missing`);
    continue;
  }

  for (const marker of requirement.markers) {
    if (!source.includes(marker)) failures.push(`${requirement.file} is missing: ${marker}`);
  }

  for (const marker of requirement.forbidden ?? []) {
    if (source.includes(marker)) failures.push(`${requirement.file} still contains forbidden release setting: ${marker}`);
  }
}

if (failures.length) {
  console.error("\nRelease blocked: this workspace does not contain the verified modern DaytonGrowthCo. site.\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nRestore the modern release source before deploying.\n");
  process.exit(1);
}

console.log("[release-guard] Homepage, recipe book, Secret Projects studio, pricing route, and calculator markers verified.");

await import('./verify-caruso-reader.mjs');
