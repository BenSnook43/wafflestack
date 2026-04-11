import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>;
}) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRecord } = await supabase
    .from("users")
    .select("id, email, active, trial_ends_at, subscription_status, emails_sent, stripe_customer_id, stripe_subscription_id")
    .eq("email", user.email!)
    .single();

  // When redirected back from Stripe checkout, sync subscription status directly
  // in case the webhook hasn't fired yet.
  const params = await searchParams;
  if (params.subscribed === "1" && userRecord?.subscription_status !== "active") {
    try {
      const stripe = getStripe();
      let subId = userRecord?.stripe_subscription_id;
      // Fall back to listing the customer's subscriptions if we don't have the ID yet
      if (!subId && userRecord?.stripe_customer_id) {
        const subs = await stripe.subscriptions.list({
          customer: userRecord.stripe_customer_id,
          status: "active",
          limit: 1,
        });
        subId = subs.data[0]?.id ?? null;
      }
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        if (sub.status === "active") {
          await supabase
            .from("users")
            .update({
              subscription_status: "active",
              stripe_subscription_id: sub.id,
            })
            .eq("id", userRecord!.id);
          // Re-fetch so the page reflects updated state
          userRecord!.subscription_status = "active";
        }
      }
    } catch (e) {
      console.error("Post-checkout Stripe sync failed:", e);
    }
  }

  // Trial expired and not a paying subscriber → paywall
  const trialExpired =
    userRecord?.trial_ends_at && new Date(userRecord.trial_ends_at) < new Date();
  const isSubscribed = userRecord?.subscription_status === "active";
  if (trialExpired && !isSubscribed) redirect("/subscribe");

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
      trialEndsAt={userRecord?.trial_ends_at ?? null}
      subscriptionStatus={userRecord?.subscription_status ?? "trialing"}
      emailsSent={userRecord?.emails_sent ?? 0}
    />
  );
}
