// Validates subreddit names by format only.
// Reddit subreddit names: 3-21 chars, letters/numbers/underscores only.
// Strips r/ prefix if the user included it.
// Returns list of names that fail format validation.
export async function validateSubreddits(subreddits: string[]): Promise<string[]> {
  const invalid: string[] = [];
  const pattern = /^[A-Za-z0-9_]{3,21}$/;

  for (const raw of subreddits) {
    const name = raw.replace(/^r\//, "").trim();
    if (!pattern.test(name)) {
      invalid.push(raw);
    }
  }

  return invalid;
}
