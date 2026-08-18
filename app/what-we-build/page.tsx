import { permanentRedirect } from "next/navigation";

export default function WhatWeBuildPage() {
  permanentRedirect("/products/");
}
