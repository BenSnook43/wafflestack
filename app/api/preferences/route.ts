import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  // Verify session
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { location, subreddits, stocks, rss_feeds, hacker_news, section_order, active } = body;

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

  // Upsert preferences (creates row if first save after signup)
  const updates: Record<string, unknown> = {
    user_id: userRecord.id,
    updated_at: new Date().toISOString(),
  };
  if (location !== undefined) updates.location = location;
  if (Array.isArray(subreddits)) updates.subreddits = subreddits;
  if (Array.isArray(stocks)) updates.stocks = stocks;
  if (Array.isArray(rss_feeds)) updates.rss_feeds = rss_feeds;
  if (typeof hacker_news === "boolean") updates.hacker_news = hacker_news;
  if (Array.isArray(section_order)) updates.section_order = section_order;

  const { error: prefErr } = await supabase
    .from("preferences")
    .upsert(updates, { onConflict: "user_id" });

  if (prefErr) {
    console.error("Preferences update error:", prefErr);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
