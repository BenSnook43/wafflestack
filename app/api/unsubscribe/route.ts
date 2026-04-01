import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const uid = body?.uid;

  if (!uid || typeof uid !== "string") {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({ active: false })
    .eq("id", uid);

  if (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to unsubscribe." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
