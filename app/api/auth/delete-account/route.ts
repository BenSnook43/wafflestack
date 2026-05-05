import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { getSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabase();

  // Cancel active Stripe subscription before deleting the record
  const { data: userRecord } = await db
    .from("users")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (userRecord?.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(userRecord.stripe_subscription_id);
    } catch {
      // Non-fatal — proceed with deletion even if Stripe cancel fails
    }
  }

  // Delete user data (preferences cascade if FK exists, else explicit delete)
  await db.from("preferences").delete().eq("user_id", user.id);
  await db.from("users").delete().eq("id", user.id);

  // Delete the Supabase auth user (service role required)
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
