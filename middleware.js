import { next } from '@vercel/edge';

/**
 * Markdown content negotiation.
 *
 * When a request for a major public page carries `Accept: text/markdown`, serve
 * the pre-generated Markdown rendering (dist/md/<slug>.md, produced by
 * scripts/generate-markdown.mjs) instead of HTML. Every other request — i.e.
 * normal browser traffic — falls through untouched and still receives HTML.
 *
 * Anything that could break (unknown path, missing/empty Markdown file, fetch
 * error) falls back to the standard HTML response rather than erroring.
 */

// request pathname (with and without trailing slash) -> Markdown slug
const MD_BY_PATH = {
  '/': 'index',
  '/website-design': 'website-design',
  '/local-seo': 'local-seo',
  '/website-maintenance': 'website-maintenance',
  '/aboutus.html': 'about',
  '/privacy-policy': 'privacy-policy',
  '/terms-of-service': 'terms-of-service',
  '/accessibility': 'accessibility',
  '/disclaimer': 'disclaimer',
};

// Only run on the content routes above (both slash variants).
export const config = {
  matcher: [
    '/',
    '/website-design',
    '/website-design/',
    '/local-seo',
    '/local-seo/',
    '/website-maintenance',
    '/website-maintenance/',
    '/aboutus.html',
    '/privacy-policy',
    '/privacy-policy/',
    '/terms-of-service',
    '/terms-of-service/',
    '/accessibility',
    '/accessibility/',
    '/disclaimer',
    '/disclaimer/',
  ],
};

function wantsMarkdown(accept) {
  if (!accept) return false;
  return accept
    .split(',')
    .some((part) => part.trim().toLowerCase().startsWith('text/markdown'));
}

export default async function middleware(request) {
  if (!wantsMarkdown(request.headers.get('accept'))) return next();

  const url = new URL(request.url);
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const slug = MD_BY_PATH[pathname];
  if (!slug) return next();

  try {
    const mdResponse = await fetch(new URL(`/md/${slug}.md`, url.origin));
    if (!mdResponse.ok) return next();

    const body = await mdResponse.text();
    if (!body || body.trim().length < 40) return next();

    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'vary': 'Accept',
        'cache-control': 'public, max-age=600',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return next();
  }
}
