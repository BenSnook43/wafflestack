import { NextRequest, NextResponse } from "next/server";

const SLUG_RE = /^[a-z0-9-]{1,100}$/i;

function extractSlug(input: string): string | null {
  const trimmed = input.trim();
  // Accept full URLs: https://paulgraham.substack.com or https://paulgraham.substack.com/feed
  const urlMatch = trimmed.match(/^https?:\/\/([^.]+)\.substack\.com/i);
  if (urlMatch) return urlMatch[1].toLowerCase();
  // Accept bare slugs: paulgraham
  if (SLUG_RE.test(trimmed)) return trimmed.toLowerCase();
  return null;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slug");
  if (!raw) {
    return NextResponse.json({ error: "Missing slug parameter." }, { status: 400 });
  }

  const slug = extractSlug(raw);
  if (!slug) {
    return NextResponse.json({ valid: false, slug: raw, url: "" });
  }

  const url = `https://${slug}.substack.com/feed`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "WaffleStack/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ valid: false, slug, url });
    }

    const text = await res.text();
    // Extract <title> from RSS — handles both plain text and CDATA
    const titleMatch = text.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? slug;

    return NextResponse.json({ valid: true, slug, title, url });
  } catch {
    // Fail open on network error — don't block users if Substack is slow
    return NextResponse.json({ valid: true, slug, title: slug, url });
  }
}
