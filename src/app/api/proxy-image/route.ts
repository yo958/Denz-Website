import { type NextRequest, NextResponse } from 'next/server';

// Allowed origins — only proxy Google CDN images
const ALLOWED_HOSTS = ['lh3.googleusercontent.com', 'lh4.googleusercontent.com', 'lh5.googleusercontent.com'];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new NextResponse('Disallowed host', { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        // Appear to come from Google Maps — satisfies their CDN referrer check
        'Referer': 'https://www.google.com/maps/',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      // 10s timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return new NextResponse('Upstream error', { status: 502 });
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache for 7 days on CDN, 1 day in browser
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse('Fetch failed', { status: 502 });
  }
}
