// Per-connector source caps. Single source of truth — iterate these values
// here rather than hardcoding numbers at call sites. See CLAUDE.md
// ("Source counts are capped per connector").

export const SOURCE_LIMITS = {
  subreddits: 8,
  stocks: 8,
  crypto: 8,
  rss: 5,
  substack: 5,
} as const;

export type SourceKind = keyof typeof SOURCE_LIMITS;

export const SOURCE_LABELS: Record<SourceKind, string> = {
  subreddits: "subreddits",
  stocks: "stock tickers",
  crypto: "crypto coins",
  rss: "RSS feeds",
  substack: "Substack newsletters",
};

export type LimitViolation = { kind: SourceKind; limit: number; count: number };

// Server backstop for the persistence routes. `rss_feeds` arrives as a single
// combined array (generic feeds + Substack feeds), so the server enforces the
// combined ceiling; the dashboard enforces the precise per-container split.
export function checkSourceLimits(p: {
  subreddits?: unknown;
  stocks?: unknown;
  crypto?: unknown;
  rss_feeds?: unknown;
}): LimitViolation | null {
  const len = (v: unknown) => (Array.isArray(v) ? v.length : 0);

  if (len(p.subreddits) > SOURCE_LIMITS.subreddits)
    return { kind: "subreddits", limit: SOURCE_LIMITS.subreddits, count: len(p.subreddits) };
  if (len(p.stocks) > SOURCE_LIMITS.stocks)
    return { kind: "stocks", limit: SOURCE_LIMITS.stocks, count: len(p.stocks) };
  if (len(p.crypto) > SOURCE_LIMITS.crypto)
    return { kind: "crypto", limit: SOURCE_LIMITS.crypto, count: len(p.crypto) };

  const rssMax = SOURCE_LIMITS.rss + SOURCE_LIMITS.substack;
  if (len(p.rss_feeds) > rssMax)
    return { kind: "rss", limit: rssMax, count: len(p.rss_feeds) };

  return null;
}
