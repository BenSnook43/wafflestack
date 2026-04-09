const FORMAT = /^[A-Za-z0-9_]{3,21}$/;

export async function checkSubredditExists(
  name: string
): Promise<{ exists: boolean; canonical?: string }> {
  const cleaned = name.replace(/^r\//, "").trim();
  if (!FORMAT.test(cleaned)) return { exists: false };

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(cleaned)}/about.json`,
      {
        headers: { "User-Agent": "wafflestack:v1.0 (by /u/wafflestack)" },
        signal: AbortSignal.timeout(3000),
        redirect: "error",
      }
    );

    if (!res.ok) return { exists: true, canonical: cleaned.toLowerCase() };

    const json = await res.json();
    const display = json?.data?.display_name;
    if (!display) return { exists: false };

    return { exists: true, canonical: display.toLowerCase() };
  } catch {
    // Network error or timeout — fail open so we don't block users
    // when Reddit is down. Server-side validation will catch it on save.
    return { exists: true, canonical: cleaned.toLowerCase() };
  }
}
