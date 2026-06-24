import { legacyHtmlResponse } from "../_legacy/html";

export function GET() {
  return legacyHtmlResponse("404.html");
}
