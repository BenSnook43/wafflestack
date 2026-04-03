import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const uid = body?.uid;
  const email = body?.email;

  if ((!uid || typeof uid !== "string") && (!email || typeof email !== "string")) {
    return NextResponse.json({ error: "Missing user ID or email." }, { status: 400 });
  }

  const query = supabase.from("users").update({ active: false });
  const { error } = uid
    ? await query.eq("id", uid)
    : await query.eq("email", email);

  if (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to unsubscribe." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
