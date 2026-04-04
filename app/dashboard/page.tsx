import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import DashboardClient, { type Block } from "./DashboardClient";

function deriveBlocks(prefs: {
  location?: string | null;
  subreddits?: string[] | null;
  stocks?: string[] | null;
  rss_feeds?: string[] | null;
  hacker_news?: boolean | null;
  section_order?: string[] | null;
}): Block[] {
  const available: Record<string, Block> = {};

  if (prefs.location) {
    available.weather = { id: "w1", type: "weather", config: { city: prefs.location } };
  }
  if (prefs.subreddits?.length) {
    available.reddit = { id: "r1", type: "reddit", config: { subreddits: prefs.subreddits } };
  }
  if (prefs.stocks?.length) {
    available.stocks = { id: "s1", type: "stocks", config: { tickers: prefs.stocks } };
  }
  if (prefs.rss_feeds?.length) {
    available.rss = { id: "rss1", type: "rss", config: { feeds: prefs.rss_feeds } };
  }
  if (prefs.hacker_news) {
    available.hacker_news = { id: "hn1", type: "hacker_news", config: {} };
  }

  // Respect section_order if provided, then append any remaining
  const order = prefs.section_order ?? [];
  const blocks: Block[] = [];
  const seen = new Set<string>();

  for (const key of order) {
    if (available[key]) {
      blocks.push(available[key]);
      seen.add(key);
    }
  }
  for (const [key, block] of Object.entries(available)) {
    if (!seen.has(key)) blocks.push(block);
  }

  return blocks;
}

export default async function DashboardPage() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRecord } = await supabase
    .from("users")
    .select("id, email, active")
    .eq("email", user.email!)
    .single();

  const { data: prefs } = await supabase
    .from("preferences")
    .select("location, subreddits, stocks, rss_feeds, hacker_news, section_order")
    .eq("user_id", userRecord?.id)
    .single();

  const blocks = deriveBlocks({
    location: prefs?.location,
    subreddits: prefs?.subreddits,
    stocks: prefs?.stocks,
    rss_feeds: prefs?.rss_feeds,
    hacker_news: prefs?.hacker_news,
    section_order: prefs?.section_order,
  });

  return (
    <DashboardClient
      email={user.email!}
      userId={userRecord?.id ?? ""}
      active={userRecord?.active ?? true}
      blocks={blocks}
    />
  );
}
