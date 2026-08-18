export const websiteMigrationPricing = {
  version: "2026-08-07",
  standardMigration: 1500,
  fullRebuild: 2000,
  integration: 500,
  domainPerYear: 15,
  examplePlatformCost: 300,
  staticHostingRecurringCost: 0,
  costGuaranteeVersion: "2026-08-07",
} as const;

export const websiteMigrationCostGuarantee = {
  comparison: "The customer’s current annual recurring website cost (typically domain, hosting, and CMS/platform fees) compared with the projected annual recurring ownership cost after migration (typically a domain registration, with static hosting at no recurring charge).",
  promise: "If the projected annual recurring ownership cost is not lower than the documented current annual recurring website cost, the Website Migration Program™ fee is not due.",
  exclusions: "The one-time migration fee is separate from this annual-cost comparison. Optional third-party services, integrations, transaction fees, email services, advertising, and costs outside the approved written scope are excluded unless the written scope says otherwise.",
} as const;

export const websiteMigrationTiers = [
  { name: "Standard Migration", price: websiteMigrationPricing.standardMigration, description: "Move your existing site — pages, forms, redirects, and tracking — to its new home, verified end to end." },
  { name: "Full Rebuild", price: websiteMigrationPricing.fullRebuild, description: "Rebuild the site on the new platform while preserving everything that already drives leads and traffic." },
  { name: "Integrations", price: websiteMigrationPricing.integration, suffix: "each", description: "Add booking tools, CRMs, payment processors, or other systems your site needs to run on." },
] as const;

export function migrationOwnershipPaybackYears(annualPlatformCost: number, investment = websiteMigrationPricing.standardMigration) {
  const annualSavings = annualPlatformCost - websiteMigrationPricing.domainPerYear;
  return annualSavings > 0 ? investment / annualSavings : null;
}
