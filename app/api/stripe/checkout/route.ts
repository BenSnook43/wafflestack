import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: userRecord } = await supabase
    .from("users")
    .select("id, email, stripe_customer_id, subscription_status")
    .eq("email", user.email)
    .single();

  if (!userRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (userRecord.subscription_status === "active") {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  const stripe = getStripe();

  // Create Stripe customer if not yet created
  let customerId = userRecord.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: userRecord.email });
    customerId = customer.id;
    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", userRecord.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // No Stripe trial — WaffleStack handles the free trial period without a card.
  // When the user hits this flow, the trial is over and billing starts immediately.
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?subscribed=1`,
    cancel_url: `${siteUrl}/subscribe`,
    allow_promotion_codes: true,
    metadata: { user_id: userRecord.id },
  });

  return NextResponse.json({ url: session.url });
}
