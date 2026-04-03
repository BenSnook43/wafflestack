import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import { validateSubreddits } from "@/lib/validate-subreddits";

export async function PATCH(req: NextRequest) {
  // Verify session
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { location, subreddits, stocks, rss_feeds, settings, active } = body;

  // Look up user record by email
  const { data: userRecord, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email!)
    .single();

  if (userErr || !userRecord) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Validate subreddits if provided
  if (Array.isArray(subreddits) && subreddits.length > 0) {
    const invalid = await validateSubreddits(subreddits);
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `These subreddits don't exist: ${invalid.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Update active status on users table if provided
  if (typeof active === "boolean") {
    await supabase
      .from("users")
      .update({ active })
      .eq("id", userRecord.id);
  }

  // Update preferences
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (location !== undefined) updates.location = location;
  if (Array.isArray(subreddits)) updates.subreddits = subreddits;
  if (Array.isArray(stocks)) updates.stocks = stocks;
  if (Array.isArray(rss_feeds)) updates.rss_feeds = rss_feeds;
  if (settings && typeof settings === "object") updates.settings = settings;

  const { error: prefErr } = await supabase
    .from("preferences")
    .update(updates)
    .eq("user_id", userRecord.id);

  if (prefErr) {
    console.error("Preferences update error:", prefErr);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
