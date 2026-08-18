export type BetterQuoteQualification = "qualified" | "manual-review" | "disqualified";

export type BetterQuoteQualificationInput = {
  amount?: string | number | null;
  hasQuote?: string | null;
  timeline?: string | null;
  status?: string | null;
};

export function classifyBetterQuoteRequest(
  input: BetterQuoteQualificationInput,
  minimumQuoteAmount = 1000,
): BetterQuoteQualification {
  const amount = Number(input.amount);
  const hasWrittenQuote = String(input.hasQuote || "").trim().toLowerCase() === "yes";
  const timeline = String(input.timeline || "").trim().toLowerCase();
  const status = String(input.status || "").trim().toLowerCase();

  if (!Number.isFinite(amount) || amount < minimumQuoteAmount || !hasWrittenQuote) return "disqualified";
  if (timeline === "immediately / emergency" || status === "the work is complete") return "disqualified";
  if (status && status !== "no") return "manual-review";
  return "qualified";
}
