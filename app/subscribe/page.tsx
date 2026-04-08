"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Logo / wordmark */}
        <div>
          <Link href="/" className="text-2xl font-extrabold italic text-waffle-brown">
            WaffleStack
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-waffle-golden/20 overflow-hidden">

          <div className="bg-waffle-brown px-6 py-4 text-center">
            <p className="text-white font-bold text-sm tracking-wide">
              YOUR FREE TRIAL HAS ENDED
            </p>
          </div>

          <div className="px-8 py-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-extrabold text-waffle-brown">$5</span>
                <span className="text-waffle-brown/50 mb-2">/month</span>
              </div>
              <p className="text-waffle-brown/60 text-sm">
                Your personalised morning briefing — weather, Reddit, markets, and more.
              </p>
            </div>

            <ul className="text-left space-y-2 text-sm text-waffle-brown/70">
              {[
                "Daily AI-written digest, delivered at 7 AM",
                "Up to 15 sources — Reddit, RSS, stocks, Hacker News, weather",
                "Cancel any time, no questions asked",
                "Payments secured by Stripe — we never see your card",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-waffle-orange mt-0.5 flex-shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-waffle-orange hover:bg-waffle-orange/90 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? "Redirecting to checkout…" : "Subscribe for $5/month →"}
            </button>

            <p className="text-xs text-waffle-brown/40">
              Billed monthly. Cancel from your dashboard any time.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 text-xs text-waffle-brown/40">
          <Link href="/dashboard" className="hover:text-waffle-brown transition-colors">
            Back to dashboard
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/sign-out", { method: "POST" });
              window.location.href = "/";
            }}
            className="hover:text-waffle-brown transition-colors"
          >
            Sign out
          </button>
        </div>

      </div>
    </main>
  );
}
