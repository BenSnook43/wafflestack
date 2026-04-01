// Validates subreddits by hitting the Reddit public API.
// Returns list of names that don't exist or are private.
// No API key required for public subreddit lookups.
export async function validateSubreddits(subreddits: string[]): Promise<string[]> {
  const invalid: string[] = [];

  await Promise.all(
    subreddits.map(async (name) => {
      try {
        const res = await fetch(`https://www.reddit.com/r/${encodeURIComponent(name)}/about.json`, {
          headers: { "User-Agent": "WaffleStack/1.0" },
          signal: AbortSignal.timeout(5000),
        });
        // 404 = doesn't exist, 403 = private/banned
        if (res.status === 404 || res.status === 403) {
          invalid.push(name);
        }
      } catch {
        // Network error — skip validation for this one rather than blocking the user
      }
    })
  );

  return invalid;
}
