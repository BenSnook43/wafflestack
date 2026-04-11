import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateSubreddits } from "@/lib/validate-subreddits";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { email, location, subreddits, stocks, rss_feeds, hacker_news, section_order } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // Validate subreddits before saving
  if (Array.isArray(subreddits) && subreddits.length > 0) {
    const invalid = await validateSubreddits(subreddits);
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `These subreddits don't exist: ${invalid.join(", ")}` },
        { status: 400 }
      );
    }
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .single();

  let user: { id: string } | null = null;
  let userError: unknown = null;

  if (existing) {
    // Reactivation — set active=true but preserve trial/billing state (no trial reset)
    const result = await supabase
      .from("users")
      .update({ active: true })
      .eq("id", existing.id)
      .select("id")
      .single();
    user = result.data;
    userError = result.error;
  } else {
    // New user — start 14-day trial
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const result = await supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        active: true,
        trial_ends_at: trialEndsAt,
        subscription_status: "trialing",
      })
      .select("id")
      .single();
    user = result.data;
    userError = result.error;
  }

  if (userError || !user) {
    console.error("User upsert error:", userError);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }

  // Upsert preferences
  const { error: prefError } = await supabase
    .from("preferences")
    .upsert(
      {
        user_id: user.id,
        location: location ?? null,
        subreddits: Array.isArray(subreddits) ? subreddits : [],
        stocks: Array.isArray(stocks) ? stocks : [],
        rss_feeds: Array.isArray(rss_feeds) ? rss_feeds : [],
        hacker_news: hacker_news === true,
        section_order: Array.isArray(section_order) ? section_order : [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (prefError) {
    console.error("Preferences upsert error:", prefError);
    return NextResponse.json({ error: "Failed to save preferences. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
