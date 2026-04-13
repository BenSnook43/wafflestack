import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";

export async function POST(request: Request) {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
