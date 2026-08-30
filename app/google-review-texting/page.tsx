import { permanentRedirect } from "next/navigation";

export default function LegacyGoogleReviewTextingRoute() {
  permanentRedirect("/google-reviews/");
}
