import type { SVGProps } from "react";

type BrandIconProps = SVGProps<SVGSVGElement>;

function LinkedinIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M6.94 8.72H3.56V20h3.38V8.72ZM7.16 5.24C7.16 4.15 6.28 3.3 5.2 3.3c-1.1 0-1.98.85-1.98 1.94 0 1.07.86 1.94 1.93 1.94h.02c1.1 0 1.99-.87 1.99-1.94ZM20.78 13.53c0-3.32-1.77-4.86-4.13-4.86-1.9 0-2.75 1.05-3.23 1.78V8.72h-3.38c.05 1.06 0 11.28 0 11.28h3.38v-6.3c0-.34.02-.67.12-.91.27-.67.88-1.37 1.9-1.37 1.34 0 1.88 1.03 1.88 2.53V20h3.38l.08-6.47Z" />
    </svg>
  );
}

function InstagramIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M7.8 2.9h8.4c2.7 0 4.9 2.2 4.9 4.9v8.4c0 2.7-2.2 4.9-4.9 4.9H7.8c-2.7 0-4.9-2.2-4.9-4.9V7.8c0-2.7 2.2-4.9 4.9-4.9Zm0 1.9a3 3 0 0 0-3 3v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm4.2 3a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm0 1.9a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Zm5.62-2.12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  );
}

function FacebookIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M14.02 21v-7.48h2.5l.38-2.92h-2.88V8.74c0-.84.24-1.42 1.45-1.42h1.54V4.7a20.7 20.7 0 0 0-2.25-.12c-2.23 0-3.75 1.36-3.75 3.86v2.16H8.5v2.92h2.51V21h3.01Z" />
    </svg>
  );
}

function GoogleIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M21.35 12.22c0-.72-.06-1.25-.2-1.8h-8.93v3.47h5.24c-.1.86-.68 2.16-1.96 3.04l-.02.12 2.84 2.15.2.02c1.83-1.65 2.83-4.08 2.83-7Z" />
      <path d="M12.22 21.25c2.62 0 4.82-.84 6.42-2.3l-3.06-2.33c-.82.56-1.92.95-3.36.95a5.84 5.84 0 0 1-5.52-3.95l-.11.01-2.95 2.23-.04.1a9.7 9.7 0 0 0 8.62 5.29Z" />
      <path d="M6.7 13.62a5.85 5.85 0 0 1-.32-1.9c0-.66.12-1.3.3-1.9v-.12L3.7 7.43l-.1.05a9.48 9.48 0 0 0 0 8.48l3.1-2.34Z" />
      <path d="M12.22 5.87c1.82 0 3.05.77 3.75 1.42l2.73-2.6c-1.68-1.53-3.86-2.47-6.48-2.47A9.7 9.7 0 0 0 3.6 7.48l3.08 2.34a5.86 5.86 0 0 1 5.54-3.95Z" />
    </svg>
  );
}

export const socialLinks = [
  { label: "LinkedIn", Icon: LinkedinIcon, href: "https://www.linkedin.com/company/daytongrowthco/" },
  { label: "Instagram", Icon: InstagramIcon, href: "https://www.instagram.com/daytongrowthco/" },
  { label: "Facebook", Icon: FacebookIcon, href: "https://www.facebook.com/profile.php?id=61582225267724" },
  { label: "Google Business Profile", Icon: GoogleIcon, href: "https://share.google/KMUawpdd5QY9yhbBB" },
];
