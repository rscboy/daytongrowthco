import { legacyHtmlResponse } from "../_legacy/html";

export function GET() {
  return legacyHtmlResponse("disclaimer/index.html");
}
