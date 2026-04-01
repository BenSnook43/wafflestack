import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const authClient = await createAuthClient();
    const { data, error } = await authClient.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      // Provision public.users row if this is the first time this email has logged in
      // (e.g. someone went straight to /login without using the signup form)
      await supabase
        .from("users")
        .upsert({ email: data.user.email.toLowerCase(), active: true }, { onConflict: "email" });

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
