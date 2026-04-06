import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: userRecord } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("email", user.email)
    .single();

  if (!userRecord?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: userRecord.stripe_customer_id,
    return_url: `${siteUrl}/dashboard`,
  });

  return NextResponse.redirect(session.url);
}
