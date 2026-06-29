/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "cdn.sceneai.art" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "www.daytongrowth.co" },
      { protocol: "https", hostname: "daytongrowth.co" },
    ],
  },
  async redirects() {
    return [
      { source: "/demo", destination: "/", permanent: false },
      { source: "/website-integration", destination: "/", permanent: false },
      { source: "/workflow-automation", destination: "/", permanent: false },
      { source: "/custom-systems", destination: "/", permanent: false },
      { source: "/pricing", destination: "/", permanent: false },
      { source: "/about", destination: "/aboutus", permanent: true },
      { source: "/aboutus.html", destination: "/aboutus", permanent: true },
      { source: "/contact", destination: "/#cta", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              '</sitemap.xml>; rel="sitemap"; type="application/xml", </md/index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="alternate"; type="text/plain"',
          },
        ],
      },
      {
        source: "/what-we-build/",
        headers: [
          {
            key: "Link",
            value: '</md/what-we-build.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="alternate"; type="text/plain"',
          },
        ],
      },
      {
        source: "/examples/",
        headers: [
          {
            key: "Link",
            value: '</md/examples.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="alternate"; type="text/plain"',
          },
        ],
      },
      {
        source: "/how-it-works/",
        headers: [
          {
            key: "Link",
            value: '</md/how-it-works.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="alternate"; type="text/plain"',
          },
        ],
      },
      {
        source: "/md/(.*)",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=600" },
        ],
      },
      {
        source: "/pricing.md",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=600" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=600" },
        ],
      },
    ];
  },
};

export default nextConfig;
