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
      "Clear pricing for the services with a defined starting point.",
      "Website Migration Program™",
      "The Better Quote Program™",
      "Interactive program return estimator",
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

console.log("[release-guard] Modern design, pricing route, and calculator markers verified.");
