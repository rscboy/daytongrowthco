import { NextResponse } from 'next/server';

/**
 * Markdown content negotiation.
 *
 * When a request for a major public page carries `Accept: text/markdown`, serve
 * the pre-generated Markdown rendering (public/md/<slug>.md) instead of HTML.
 * Every other request, meaning normal browser traffic, falls through untouched.
 */

const MD_BY_PATH = {
  '/': 'index',
  '/website-design': 'website-design',
  '/local-seo': 'local-seo',
  '/website-maintenance': 'website-maintenance',
  '/aboutus': 'about',
  '/aboutus.html': 'about',
  '/privacy-policy': 'privacy-policy',
  '/terms-of-service': 'terms-of-service',
  '/accessibility': 'accessibility',
  '/disclaimer': 'disclaimer',
};

export const config = {
  matcher: [
    '/',
    '/website-design',
    '/website-design/',
    '/local-seo',
    '/local-seo/',
    '/website-maintenance',
    '/website-maintenance/',
    '/aboutus',
    '/aboutus/',
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

export async function proxy(request) {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase();
  const pathname = new URL(request.url).pathname;

  // The bookings subdomain is reserved for active funnels. Keep the main
  // marketing site on the primary domain while sending a bare bookings visit
  // to the current HVAC funnel entry point.
  if (hostname === 'bookings.daytongrowth.co' && pathname === '/') {
    return NextResponse.redirect(new URL('/hvac/', request.url));
  }

  if (!wantsMarkdown(request.headers.get('accept'))) return NextResponse.next();

  const url = new URL(request.url);
  let normalizedPathname = url.pathname;
  if (normalizedPathname.length > 1 && normalizedPathname.endsWith('/')) {
    normalizedPathname = normalizedPathname.slice(0, -1);
  }

  const slug = MD_BY_PATH[normalizedPathname];
  if (!slug) return NextResponse.next();

  try {
    const mdResponse = await fetch(new URL(`/md/${slug}.md`, url.origin));
    if (!mdResponse.ok) return NextResponse.next();

    const body = await mdResponse.text();
    if (!body || body.trim().length < 40) return NextResponse.next();

    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        vary: 'Accept',
        'cache-control': 'public, max-age=600',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.next();
  }
}
