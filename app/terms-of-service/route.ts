import { legacyHtmlResponse } from "../_legacy/html";

export function GET() {
  return legacyHtmlResponse("terms-of-service/index.html");
}
