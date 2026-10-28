import { NextRequest, NextResponse } from 'next/server';
import {
  RepoFileEntry,
  runRepositoryFolderAudit,
} from '@/lib/deterministic-auditor';

export interface LiveProbeDetail {
  endpoint: string;
  url: string;
  status: number;
  ok: boolean;
  redirected: boolean;
  finalUrl: string;
  contentType: string;
  byteLength: number;
}

const CRAWLER_USER_AGENT =
  'Mozilla/5.0 (compatible; Mediapartners-Google/2.1; +http://www.google.com/bot.html)';

async function fetchEndpointWithFallback(
  origin: string,
  primaryPath: string,
  fallbackPath?: string
): Promise<{
  pathUsed: string;
  url: string;
  status: number;
  ok: boolean;
  redirected: boolean;
  finalUrl: string;
  contentType: string;
  content: string;
}> {
  const tryFetch = async (targetPath: string) => {
    const targetUrl = targetPath.startsWith('http')
      ? targetPath
      : `${origin}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': CRAWLER_USER_AGENT,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(7000),
      });
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      return {
        pathUsed: targetPath,
        url: targetUrl,
        status: res.status,
        ok: res.ok,
        redirected: res.redirected,
        finalUrl: res.url || targetUrl,
        contentType,
        content: text.slice(0, 250000), // cap per-page payload
      };
    } catch (err) {
      return {
        pathUsed: targetPath,
        url: targetUrl,
        status: 0,
        ok: false,
        redirected: false,
        finalUrl: targetUrl,
        contentType: '',
        content: '',
      };
    }
  };

  const primary = await tryFetch(primaryPath);
  if (primary.ok && primary.content.trim().length > 0) {
    return primary;
  }

  if (fallbackPath) {
    const fallback = await tryFetch(fallbackPath);
    if (fallback.ok && fallback.content.trim().length > 0) {
      return fallback;
    }
  }

  return primary;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: 'Please provide a valid production URL (e.g., https://example.com).' },
        { status: 400 }
      );
    }

    const normalizedUrlStr = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrlStr);
    } catch {
      return NextResponse.json(
        { error: `Invalid URL format: "${rawUrl}". Use https://yourdomain.com` },
        { status: 400 }
      );
    }

    const origin = parsedUrl.origin;
    const entryPath =
      parsedUrl.pathname === '/' || !parsedUrl.pathname
        ? '/index.html'
        : parsedUrl.pathname;

    // 1. Crawl core AdSense infrastructure & trust endpoints in parallel
    const [
      homeRes,
      adsTxtRes,
      robotsTxtRes,
      sitemapRes,
      privacyRes,
      aboutRes,
      contactRes,
      termsRes,
      probe404Res,
    ] = await Promise.all([
      fetchEndpointWithFallback(origin, parsedUrl.pathname || '/'),
      fetchEndpointWithFallback(origin, '/ads.txt'),
      fetchEndpointWithFallback(origin, '/robots.txt'),
      fetchEndpointWithFallback(origin, '/sitemap.xml', '/sitemap_index.xml'),
      fetchEndpointWithFallback(origin, '/privacy', '/privacy-policy'),
      fetchEndpointWithFallback(origin, '/about', '/about-us'),
      fetchEndpointWithFallback(origin, '/contact', '/contact-us'),
      fetchEndpointWithFallback(origin, '/terms', '/terms-of-service'),
      fetchEndpointWithFallback(
        origin,
        '/adsense-guard-404-nonexistent-probe-route-99412'
      ),
    ]);

    if (homeRes.status === 0 && !homeRes.content) {
      return NextResponse.json(
        {
          error: `Could not reach ${origin}. Verify that the domain is publicly accessible over HTTPS and not blocking Mediapartners-Google.`,
        },
        { status: 502 }
      );
    }

    const virtualFiles: RepoFileEntry[] = [];
    const probeDetails: LiveProbeDetail[] = [];

    const recordProbe = (
      label: string,
      virtualPath: string,
      res: Awaited<ReturnType<typeof fetchEndpointWithFallback>>,
      includeWhen404 = false
    ) => {
      probeDetails.push({
        endpoint: label,
        url: res.url,
        status: res.status,
        ok: res.ok,
        redirected: res.redirected,
        finalUrl: res.finalUrl,
        contentType: res.contentType,
        byteLength: res.content.length,
      });

      if ((res.ok || includeWhen404) && res.content.trim().length > 0) {
        virtualFiles.push({
          path: virtualPath,
          content: res.content,
        });
      }
    };

    recordProbe('Target Entry Page', entryPath === '/' ? 'app/page.tsx' : entryPath, homeRes, true);

    // Check ads.txt (Watch out for soft-404 HTML returned instead of plain text)
    const adsTxtLooksLikeHtml = /<!DOCTYPE\s+html|<html[\s>]/i.test(adsTxtRes.content);
    if (adsTxtRes.ok && !adsTxtLooksLikeHtml) {
      recordProbe('/ads.txt', 'public/ads.txt', adsTxtRes);
    } else {
      probeDetails.push({
        endpoint: '/ads.txt',
        url: adsTxtRes.url,
        status: adsTxtLooksLikeHtml ? Soft404Status(adsTxtRes.status) : adsTxtRes.status,
        ok: false,
        redirected: adsTxtRes.redirected,
        finalUrl: adsTxtRes.finalUrl,
        contentType: adsTxtRes.contentType,
        byteLength: adsTxtRes.content.length,
      });
    }

    // Check robots.txt
    const robotsLooksLikeHtml = /<!DOCTYPE\s+html|<html[\s>]/i.test(robotsTxtRes.content);
    if (robotsTxtRes.ok && !robotsLooksLikeHtml) {
      recordProbe('/robots.txt', 'public/robots.txt', robotsTxtRes);
    } else {
      probeDetails.push({
        endpoint: '/robots.txt',
        url: robotsTxtRes.url,
        status: robotsTxtRes.status,
        ok: false,
        redirected: robotsTxtRes.redirected,
        finalUrl: robotsTxtRes.finalUrl,
        contentType: robotsTxtRes.contentType,
        byteLength: robotsTxtRes.content.length,
      });
    }

    // Check sitemap.xml
    if (sitemapRes.ok && /<urlset|<sitemapindex/i.test(sitemapRes.content)) {
      recordProbe('/sitemap.xml', 'public/sitemap.xml', sitemapRes);
    } else {
      probeDetails.push({
        endpoint: '/sitemap.xml',
        url: sitemapRes.url,
        status: sitemapRes.status,
        ok: false,
        redirected: sitemapRes.redirected,
        finalUrl: sitemapRes.finalUrl,
        contentType: sitemapRes.contentType,
        byteLength: sitemapRes.content.length,
      });
    }

    // Mandatory Trust Pages
    recordProbe('/privacy', 'app/privacy/page.tsx', privacyRes);
    recordProbe('/about', 'app/about/page.tsx', aboutRes);
    recordProbe('/contact', 'app/contact/page.tsx', contactRes);
    recordProbe('/terms', 'app/terms/page.tsx', termsRes);

    // 404 Probe Route (Even if status is 404, we include its HTML as `app/not-found.tsx` so the auditor verifies zero `<ins class="adsbygoogle">` on 404 pages!)
    if (probe404Res.content.trim().length > 0) {
      recordProbe('404 Error Page Probe', 'app/not-found.tsx', probe404Res, true);
    }

    // 2. Discover up to 4 internal content/guide pages from sitemap.xml or homepage <a href> links
    const candidatePaths = new Set<string>();
    const excludedRegex =
      /^\/(privacy|privacy-policy|about|about-us|contact|contact-us|terms|terms-of-service|login|signup|register|admin|api|cart|checkout|ads\.txt|robots\.txt|sitemap\.xml)(\/|$)/i;

    if (sitemapRes.ok && sitemapRes.content) {
      const locMatches = Array.from(
        sitemapRes.content.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi)
      );
      for (const match of locMatches) {
        try {
          const u = new URL(match[1]);
          if (
            u.origin === origin &&
            u.pathname !== '/' &&
            u.pathname !== parsedUrl.pathname &&
            !excludedRegex.test(u.pathname)
          ) {
            candidatePaths.add(u.pathname);
          }
        } catch {
          // ignore invalid URL
        }
        if (candidatePaths.size >= 4) break;
      }
    }

    // Fallback to internal <a href="/..."> links from homepage if sitemap had fewer than 4 content URLs
    if (candidatePaths.size < 4 && homeRes.content) {
      const hrefMatches = Array.from(
        homeRes.content.matchAll(/href=["'](\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+)["']/g)
      );
      for (const match of hrefMatches) {
        const p = match[1].split('#')[0].split('?')[0];
        if (
          p &&
          p !== '/' &&
          p !== parsedUrl.pathname &&
          !excludedRegex.test(p) &&
          !/\.(css|js|png|jpg|jpeg|svg|webp|ico|xml|txt|json)$/i.test(p)
        ) {
          candidatePaths.add(p);
        }
        if (candidatePaths.size >= 4) break;
      }
    }

    const sampledPaths = Array.from(candidatePaths).slice(0, 4);
    if (sampledPaths.length > 0) {
      const sampledResults = await Promise.all(
        sampledPaths.map((p) => fetchEndpointWithFallback(origin, p))
      );
      for (const sRes of sampledResults) {
        if (sRes.ok && sRes.content.trim().length > 0) {
          const cleanPath = sRes.pathUsed.replace(/^\/+/, '');
          recordProbe(
            `Sampled Route (${sRes.pathUsed})`,
            `app/${cleanPath}/page.tsx`,
            sRes
          );
        }
      }
    }

    // 3. Run unified Repository & Multi-Endpoint Auditor
    const repositoryReport = runRepositoryFolderAudit(virtualFiles);

    return NextResponse.json({
      targetOrigin: origin,
      crawledAt: new Date().toISOString(),
      probeDetails,
      repositoryReport,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to crawl live URL.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function Soft404Status(originalStatus: number): number {
  return originalStatus === 200 ? 404 : originalStatus;
}
