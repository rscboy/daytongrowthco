export const betterQuotePricing = {
  version: "2026-08-07",
  meaningfulSavingsThreshold: 199,
  minimumSuccessFee: 99,
  firstTierLimit: 2500,
  firstTierRate: 0.2,
  secondTierRate: 0.1,
} as const;

export type BetterQuoteSavingsState =
  | "no-savings"
  | "free-savings"
  | "minimum-fee"
  | "first-tier"
  | "progressive";

export function calculateBetterQuoteSavings(currentQuote: number, betterQuote: number) {
  const current = Math.max(0, Number.isFinite(currentQuote) ? currentQuote : 0);
  const better = Math.max(0, Number.isFinite(betterQuote) ? betterQuote : 0);
  const grossSavings = Math.max(0, current - better);
  let fee = 0;
  let state: BetterQuoteSavingsState = "no-savings";

  if (grossSavings <= 0) {
    state = "no-savings";
  } else if (grossSavings < betterQuotePricing.meaningfulSavingsThreshold) {
    state = "free-savings";
  } else if (grossSavings < 495) {
    fee = betterQuotePricing.minimumSuccessFee;
    state = "minimum-fee";
  } else if (grossSavings <= betterQuotePricing.firstTierLimit) {
    fee = grossSavings * betterQuotePricing.firstTierRate;
    state = "first-tier";
  } else {
    fee =
      betterQuotePricing.firstTierLimit * betterQuotePricing.firstTierRate +
      (grossSavings - betterQuotePricing.firstTierLimit) * betterQuotePricing.secondTierRate;
    state = "progressive";
  }

  fee = Math.round(fee * 100) / 100;
  return {
    currentQuote: current,
    betterQuote: better,
    grossSavings,
    fee,
    netSavings: Math.max(0, Math.round((grossSavings - fee) * 100) / 100),
    state,
  };
}
