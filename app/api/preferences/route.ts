import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import { checkSourceLimits, SOURCE_LABELS } from "@/lib/source-limits";

export async function PATCH(req: NextRequest) {
  // Verify session
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { location, subreddits, stocks, crypto, rss_feeds, hacker_news, section_order, settings, active } = body;

  const violation = checkSourceLimits({ subreddits, stocks, crypto, rss_feeds });
  if (violation) {
    return NextResponse.json(
      { error: `Too many ${SOURCE_LABELS[violation.kind]} (${violation.count}). The limit is ${violation.limit}.` },
      { status: 400 }
    );
  }

  // Look up user record by email
  const { data: userRecord, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email!)
    .single();

  if (userErr || !userRecord) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Update active status on users table if provided
  if (typeof active === "boolean") {
    await supabase
      .from("users")
      .update({ active })
      .eq("id", userRecord.id);
  }

  // If settings was sent, shallow-merge with the existing row so we don't clobber
  // unrelated top-level keys (the dashboard only owns feed_topics / subreddit_topics
  // today, but settings is reserved per CLAUDE.md for any future non-connector prefs).
  let mergedSettings: Record<string, unknown> | null = null;
  if (settings && typeof settings === "object") {
    const { data: existing } = await supabase
      .from("preferences")
      .select("settings")
      .eq("user_id", userRecord.id)
      .single();
    const current = (existing?.settings ?? {}) as Record<string, unknown>;
    mergedSettings = { ...current, ...(settings as Record<string, unknown>) };
  }

  // Upsert preferences (creates row if first save after signup)
  const updates: Record<string, unknown> = {
    user_id: userRecord.id,
    updated_at: new Date().toISOString(),
  };
  if (location !== undefined) updates.location = location;
  if (Array.isArray(subreddits)) updates.subreddits = subreddits;
  if (Array.isArray(stocks)) updates.stocks = stocks;
  if (Array.isArray(crypto)) updates.crypto = crypto;
  if (Array.isArray(rss_feeds)) updates.rss_feeds = rss_feeds;
  if (typeof hacker_news === "boolean") updates.hacker_news = hacker_news;
  if (Array.isArray(section_order)) updates.section_order = section_order;
  if (mergedSettings) updates.settings = mergedSettings;

  const { error: prefErr } = await supabase
    .from("preferences")
    .upsert(updates, { onConflict: "user_id" });

  if (prefErr) {
    console.error("Preferences update error:", prefErr);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
