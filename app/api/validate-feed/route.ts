import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ valid: false, error: "Missing url parameter." });
  }

  // Normalise: if the user typed a bare domain like "theverge.com", prefix https://
  const normalised = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  let url: string;
  try {
    url = new URL(normalised).toString();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid URL." });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "WaffleStack/1.0 RSS Validator" },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return NextResponse.json({ valid: false, error: `HTTP ${res.status}` });
    }

    const contentType = res.headers.get("content-type") ?? "";
    const FEED_TYPES = [
      "application/rss+xml",
      "application/atom+xml",
      "application/xml",
      "text/xml",
    ];
    const isFeedDirect = FEED_TYPES.some((t) => contentType.includes(t));

    const text = await res.text();

    if (isFeedDirect || looksLikeFeed(text)) {
      const title = extractFeedTitle(text);
      return NextResponse.json({ valid: true, feedUrl: url, title });
    }

    if (contentType.includes("text/html")) {
      const discovered = discoverFeedUrl(text, url);
      if (!discovered) {
        return NextResponse.json({ valid: false, error: "No RSS feed found at this URL." });
      }

      try {
        const feedRes = await fetch(discovered, {
          headers: { "User-Agent": "WaffleStack/1.0 RSS Validator" },
        });
        if (!feedRes.ok) {
          // URL discovered but unreachable — return it anyway without title
          return NextResponse.json({ valid: true, feedUrl: discovered, title: "" });
        }
        const feedText = await feedRes.text();
        const title = extractFeedTitle(feedText);
        return NextResponse.json({ valid: true, feedUrl: discovered, title });
      } catch {
        return NextResponse.json({ valid: true, feedUrl: discovered, title: "" });
      }
    }

    return NextResponse.json({ valid: false, error: "URL does not appear to be an RSS feed." });
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json({
      valid: false,
      error: isAbort ? "Request timed out." : "Could not reach URL.",
    });
  }
}

/** Quick heuristic: does the text body look like RSS/Atom XML even if Content-Type was wrong? */
function looksLikeFeed(text: string): boolean {
  const snippet = text.trimStart().slice(0, 500);
  return /<(rss|feed|channel)\b/i.test(snippet);
}

/** Search HTML for <link rel="alternate" type="application/rss+xml" href="..."> */
function discoverFeedUrl(html: string, baseUrl: string): string | null {
  const linkTagRegex = /<link[^>]+>/gi;
  const linkTags = html.match(linkTagRegex) ?? [];

  for (const tag of linkTags) {
    const isAlternate = /rel=["']alternate["']/i.test(tag);
    const isFeedType = /type=["']application\/(rss|atom)\+xml["']/i.test(tag);
    if (isAlternate && isFeedType) {
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        try {
          return new URL(hrefMatch[1], baseUrl).toString();
        } catch {
          return hrefMatch[1];
        }
      }
    }
  }
  return null;
}

/** Extract the feed title from RSS/Atom XML */
function extractFeedTitle(xml: string): string {
  const match = xml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  if (match) {
    return match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }
  return "";
}
