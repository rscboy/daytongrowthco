import { readFileSync } from "node:fs";

const requiredMarkers = [
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
      "Start with the work that costs you most.",
      "Tell us what repeats. We will help simplify it.",
      "Clear pricing for the services with a defined starting point.",
      "Website Migration Program™",
      "The Better Quote Program™",
      "Technology that fits the work.",
    ],
    forbidden: [
      "We build phone agents",
      "Two flagship programs.",
    ],
  },
  {
    file: "app/projects/secret/recipes_for_benny/page.tsx",
    markers: [
      'title: "Sammy\'s Recipe Book Website"',
      'siteName: "Sammy\'s Recipe Book Website"',
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
      'const SETTINGS_BLOB_PATH = "secret-projects/settings.json"',
      "hashProjectPassword",
      "createProjectAccessSession",
    ],
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
];

const failures = [];

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
  console.error("\nRelease blocked: this workspace does not contain the verified modern DaytonGrowthCo site.\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nRestore the modern release source before deploying.\n");
  process.exit(1);
}

console.log("[release-guard] Homepage, recipe book, Secret Projects studio, pricing route, and calculator markers verified.");
