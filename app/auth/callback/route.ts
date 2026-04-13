import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // next param lets us redirect somewhere other than dashboard after auth (e.g. reset-password)
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const authClient = await createAuthClient();
    const { data, error } = await authClient.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const email = data.user.email.toLowerCase();

      // Check if user already exists in public.users
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        // Returning user — ensure active
        await supabase.from("users").update({ active: true }).eq("id", existing.id);
      } else {
        // New user (e.g. first-time Google OAuth) — start 14-day trial
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            email,
            active: true,
            trial_ends_at: trialEndsAt,
            subscription_status: "trialing",
          })
          .select("id")
          .single();

        if (newUser) {
          // Initialise empty preferences row
          await supabase.from("preferences").upsert(
            {
              user_id: newUser.id,
              subreddits: [],
              stocks: [],
              rss_feeds: [],
              hacker_news: false,
              section_order: [],
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
