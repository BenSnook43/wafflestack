import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { email, location, subreddits, stocks, settings } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // Upsert user — re-submitting updates preferences and reactivates if previously unsubscribed
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ email: email.toLowerCase().trim(), active: true }, { onConflict: "email" })
    .select("id")
    .single();

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
        settings: settings && typeof settings === "object" ? settings : { connectors: ["weather", "reddit", "stocks"] },
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
