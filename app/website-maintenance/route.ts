import { legacyHtmlResponse } from "../_legacy/html";

export function GET() {
  return legacyHtmlResponse("website-maintenance/index.html");
}
