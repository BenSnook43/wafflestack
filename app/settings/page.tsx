import { redirect } from "next/navigation";
import Link from "next/link";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import SignOutButton from "./SignOutButton";

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "active":    return { text: "Active",      color: "text-green-600" };
    case "trialing":  return { text: "Free trial",  color: "text-waffle-orange" };
    case "past_due":  return { text: "Past due",    color: "text-red-500" };
    case "cancelled": return { text: "Cancelled",   color: "text-waffle-brown/40" };
    default:          return { text: "Unknown",     color: "text-waffle-brown/40" };
  }
}

export default async function SettingsPage() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/login");

  const { data: userRecord } = await supabase
    .from("users")
    .select("email, subscription_status, trial_ends_at, stripe_customer_id, cancelled_at")
    .eq("email", user.email!)
    .single();

  const status = userRecord?.subscription_status ?? "trialing";
  const { text: statusText, color: statusColor } = statusLabel(status);
  const hasStripe = !!userRecord?.stripe_customer_id;

  const trialDaysLeft =
    status === "trialing" && userRecord?.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(userRecord.trial_ends_at).getTime() - Date.now()) / 86_400_000))
      : null;

  return (
    <main className="min-h-screen bg-waffle-cream">
      {/* Header */}
      <div className="bg-waffle-cream border-b border-waffle-brown/8">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-waffle-brown">Account Settings</h1>
            <p className="text-xs text-waffle-brown/40 mt-0.5">{userRecord?.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-waffle-brown/40 hover:text-waffle-brown transition-colors font-semibold"
          >
            ← Back to digest
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Subscription card */}
        <div className="bg-white rounded-2xl border border-waffle-brown/10 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-waffle-brown/8">
            <h2 className="font-bold text-waffle-brown text-sm tracking-wide uppercase">
              Subscription
            </h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Status row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-waffle-brown/60">Status</span>
              <span className={`text-sm font-semibold ${statusColor}`}>{statusText}</span>
            </div>

            {/* Trial detail */}
            {status === "trialing" && trialDaysLeft !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-waffle-brown/60">Trial ends</span>
                <span className="text-sm text-waffle-brown/80 font-medium">
                  {trialDaysLeft === 0
                    ? "Today"
                    : `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining`}
                </span>
              </div>
            )}

            {/* Cancelled detail */}
            {status === "cancelled" && userRecord?.cancelled_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-waffle-brown/60">Cancelled on</span>
                <span className="text-sm text-waffle-brown/80 font-medium">
                  {new Date(userRecord.cancelled_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {/* Plan */}
            {(status === "active" || status === "past_due") && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-waffle-brown/60">Plan</span>
                <span className="text-sm text-waffle-brown/80 font-medium">$5 / month</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-1 space-y-3">
              {status === "active" || status === "past_due" ? (
                /* Manage via Stripe portal */
                <a
                  href="/api/stripe/portal"
                  className="block w-full text-center bg-waffle-brown text-white text-sm font-bold py-2.5 px-4 rounded-xl hover:bg-waffle-brown/90 transition-colors"
                >
                  Manage billing →
                </a>
              ) : status === "trialing" ? (
                /* Upgrade now */
                <Link
                  href="/subscribe"
                  className="block w-full text-center bg-waffle-orange text-white text-sm font-bold py-2.5 px-4 rounded-xl hover:bg-waffle-orange/90 transition-colors"
                >
                  Subscribe for $5/month →
                </Link>
              ) : status === "cancelled" && hasStripe ? (
                /* Reactivate via portal */
                <a
                  href="/api/stripe/portal"
                  className="block w-full text-center bg-waffle-orange text-white text-sm font-bold py-2.5 px-4 rounded-xl hover:bg-waffle-orange/90 transition-colors"
                >
                  Reactivate subscription →
                </a>
              ) : null}

              {(status === "active" || status === "past_due") && (
                <p className="text-xs text-waffle-brown/40 text-center">
                  Cancel, update your card, or view invoices via the billing portal.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account card */}
        <div className="bg-white rounded-2xl border border-waffle-brown/10 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-waffle-brown/8">
            <h2 className="font-bold text-waffle-brown text-sm tracking-wide uppercase">
              Account
            </h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-waffle-brown/60">Email</span>
              <span className="text-sm text-waffle-brown/80 font-medium">{userRecord?.email}</span>
            </div>
            <div className="pt-1">
              <SignOutButton />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
