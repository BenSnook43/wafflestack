import { checkSubredditExists } from "./reddit";

// Validates subreddit names by checking Reddit's API.
// Strips r/ prefix if the user included it.
// Returns list of names that don't exist on Reddit.
export async function validateSubreddits(subreddits: string[]): Promise<string[]> {
  const invalid: string[] = [];

  await Promise.all(
    subreddits.map(async (raw) => {
      const result = await checkSubredditExists(raw);
      if (!result.exists) invalid.push(raw);
    })
  );

  return invalid;
}
