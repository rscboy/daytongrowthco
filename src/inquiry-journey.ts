export const inquiryServices = {
  quote: "Better Quote comparison",
  website: "Website migration",
  appointments: "AppointRelay",
  reviews: "Google Review Program",
  other: "Something else / help me choose",
};
export type InquiryService = keyof typeof inquiryServices;
export type InquiryJourney = { service: InquiryService; scenarios: Partial<Record<InquiryService, string>> };
export const emptyInquiryJourney: InquiryJourney = { service: "other", scenarios: {} };
export const inquiryJourneyKey = "dgc:homepage-context:v1";
type JourneyStorage = Pick<Storage, "getItem" | "setItem">;

export function parseInquiryJourney(raw: string | null): InquiryJourney | undefined {
  try {
    const data = JSON.parse(raw || "null");
    if (!data || typeof data.service !== "string" || !Object.prototype.hasOwnProperty.call(inquiryServices, data.service)) return;
    if (!data.scenarios || typeof data.scenarios !== "object" || Array.isArray(data.scenarios)) return;
    return {
      service: data.service,
      scenarios: Object.fromEntries(Object.entries(data.scenarios).filter(([id, value]) =>
        Object.prototype.hasOwnProperty.call(inquiryServices, id) && typeof value === "string" && value.length < 1500,
      )),
    };
  } catch { return; }
}

export function createInquiryJourneyStore(storage: () => JourneyStorage) {
  let current: InquiryJourney = { ...emptyInquiryJourney, scenarios: {} };
  let hydrated = false;
  function read(): InquiryJourney {
    if (!hydrated) {
      hydrated = true;
      try { current = parseInquiryJourney(storage().getItem(inquiryJourneyKey)) || current; } catch { /* Memory remains available. */ }
    }
    return { ...current, scenarios: { ...current.scenarios } };
  }
  function update(next: InquiryJourney) {
    current = next;
    try { storage().setItem(inquiryJourneyKey, JSON.stringify(next)); } catch { /* Keep the entire current-page journey in memory. */ }
    return read();
  }
  return {
    read,
    select(service: InquiryService) { return update({ ...read(), service }); },
    saveScenario(service: InquiryService, text: string) {
      const previous = read();
      return update({ ...previous, scenarios: { ...previous.scenarios, [service]: text } });
    },
  };
}
