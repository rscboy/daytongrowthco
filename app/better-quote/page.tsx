import { permanentRedirect } from "next/navigation";

export default function BetterQuotePage() {
  permanentRedirect("/quote/");
}
