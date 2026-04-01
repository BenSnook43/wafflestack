import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import DashboardClient, { type Block } from "./DashboardClient";

function deriveBlocks(prefs: {
  location?: string | null;
  subreddits?: string[] | null;
  stocks?: string[] | null;
  settings?: { connectors?: string[]; blocks?: Block[] } | null;
}): Block[] {
  // If blocks already stored, use them
  if (prefs.settings?.blocks?.length) return prefs.settings.blocks;

  // Otherwise derive from flat fields for existing users
  const connectors = prefs.settings?.connectors ?? [];
  const blocks: Block[] = [];

  if (connectors.includes("weather") && prefs.location) {
    blocks.push({ id: "w1", type: "weather", config: { city: prefs.location } });
  }
  if (connectors.includes("reddit") && prefs.subreddits?.length) {
    blocks.push({ id: "r1", type: "reddit", config: { subreddits: prefs.subreddits } });
  }
  if (connectors.includes("stocks") && prefs.stocks?.length) {
    blocks.push({ id: "s1", type: "stocks", config: { tickers: prefs.stocks } });
  }
  if (connectors.includes("hacker_news")) {
    blocks.push({ id: "hn1", type: "hacker_news", config: {} });
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
    .select("location, subreddits, stocks, settings")
    .eq("user_id", userRecord?.id)
    .single();

  const blocks = deriveBlocks({
    location: prefs?.location,
    subreddits: prefs?.subreddits,
    stocks: prefs?.stocks,
    settings: prefs?.settings as { connectors?: string[]; blocks?: Block[] } | null,
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
