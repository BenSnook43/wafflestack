import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();
  const supabase = await createAuthClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send magic link." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
