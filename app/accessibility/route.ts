import { legacyHtmlResponse } from "../_legacy/html";

export function GET() {
  return legacyHtmlResponse("accessibility/index.html");
}
