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
  {
    file: "app/ai-phone-agents/page.tsx",
    markers: [
      "AI Phone Agents for Small Businesses",
      'const url = "https://www.daytongrowth.co/ai-phone-agents"',
      'mainEntity: { "@id": `${url}#service` }',
    ],
  },
  {
    file: "app/ai-automation/page.tsx",
    markers: [
      "AI Automation Company in Dayton, Ohio",
      'const url = "https://www.daytongrowth.co/ai-automation"',
      "custom AI agents, workflow automation, system integrations",
      'mainEntity: { "@id": `${url}#service` }',
    ],
  },
  {
    file: "app/layout.tsx",
    markers: [
      "AI Automation Company in Dayton, Ohio | DaytonGrowthCo.",
      "AI automation company Dayton Ohio",
      "custom AI agents",
      "workflow automation",
      "system integrations",
      "business process automation",
    ],
  },
  {
    file: "app/quote/page.tsx",
    markers: [
      "Quote Shopping Service | The Better Quote Program™",
      'const url = "https://www.daytongrowth.co/quote"',
      'mainEntity: { "@id": `${url}#service` }',
    ],
  },
  {
    file: "app/website/page.tsx",
    markers: [
      "Website Migration Service | Website Migration Program™",
      'const url = "https://www.daytongrowth.co/website"',
      'mainEntity: { "@id": `${url}#service` }',
    ],
  },
  {
    file: "app/local-search/page.tsx",
    markers: [
      "Local SEO & AI Search for Dayton Businesses",
      'const url = "https://www.daytongrowth.co/local-search"',
      'mainEntity: { "@id": `${url}#service` }',
    ],
  },
  {
    file: "app/missed-call-follow-up/page.tsx",
    markers: [
      "Automated Follow-Up and Scheduling for Trades",
      'const url = "https://www.daytongrowth.co/missed-call-follow-up"',
      'mainEntity: { "@id": `${url}#service` }',
    ],
  },
  {
    file: "app/local-seo/route.ts",
    markers: ['NextResponse.redirect("https://www.daytongrowth.co/local-search", 308)'],
    forbidden: ["legacyHtmlResponse"],
  },
  {
    file: "public/sitemap.xml",
    markers: [
      "https://www.daytongrowth.co/ai-phone-agents</loc>",
      "https://www.daytongrowth.co/ai-automation</loc>",
      "https://www.daytongrowth.co/quote</loc>",
      "https://www.daytongrowth.co/website</loc>",
      "https://www.daytongrowth.co/missed-call-follow-up</loc>",
      "https://www.daytongrowth.co/local-search</loc>",
    ],
    forbidden: ["https://www.daytongrowth.co/local-seo"],
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

console.log("[release-guard] Modern design, pricing route, calculator, and primary SEO architecture markers verified.");
