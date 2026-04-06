import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe sends the raw body — Next.js must not parse it
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(sub);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("users")
        .update({
          subscription_status: "cancelled",
          stripe_subscription_id: sub.id,
          cancelled_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", sub.customer as string);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase
        .from("users")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", invoice.customer as string);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // Only flip to active once a real payment has gone through (not trial start)
      if ((invoice.amount_paid ?? 0) > 0) {
        await supabase
          .from("users")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", invoice.customer as string);
      }
      break;
    }

    default:
      // Unhandled event — acknowledge receipt so Stripe doesn't retry
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription) {
  const status = stripeStatusToLocal(sub.status);
  await supabase
    .from("users")
    .update({
      subscription_status: status,
      stripe_subscription_id: sub.id,
      // Keep trial_ends_at in sync with what Stripe actually set
      ...(sub.trial_end
        ? { trial_ends_at: new Date(sub.trial_end * 1000).toISOString() }
        : {}),
    })
    .eq("stripe_customer_id", sub.customer as string);
}

function stripeStatusToLocal(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "trialing":    return "trialing";
    case "active":      return "active";
    case "past_due":    return "past_due";
    case "canceled":    return "cancelled"; // Stripe uses "canceled", we use "cancelled"
    case "unpaid":      return "past_due";
    default:            return "past_due";
  }
}
