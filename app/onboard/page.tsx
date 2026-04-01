"use client";

import { useState } from "react";
import Link from "next/link";

const PRESET_SUBS = ["technology", "science", "worldnews", "investing", "design", "philosophy"];

type StackState = {
  weather: boolean;
  weatherCity: string;
  stocks: boolean;
  stockTickers: string;
  subreddits: string[];
  customSub: string;
  hackerNews: boolean;
};

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [stack, setStack] = useState<StackState>({
    weather: false,
    weatherCity: "",
    stocks: false,
    stockTickers: "",
    subreddits: [],
    customSub: "",
    hackerNews: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleSub(sub: string) {
    setStack((s) => ({
      ...s,
      subreddits: s.subreddits.includes(sub)
        ? s.subreddits.filter((r) => r !== sub)
        : [...s.subreddits, sub],
    }));
  }

  function addCustomSub() {
    const cleaned = stack.customSub.trim().toLowerCase().replace(/^r\//, "");
    if (cleaned && !stack.subreddits.includes(cleaned)) {
      setStack((s) => ({ ...s, subreddits: [...s.subreddits, cleaned], customSub: "" }));
    }
  }

  const hasAnyBlock =
    stack.weather || stack.stocks || stack.subreddits.length > 0 || stack.hackerNews;

  const stackItems = [
    ...(stack.weather ? [`⛅ Weather — ${stack.weatherCity || "city TBD"}`] : []),
    ...(stack.stocks ? [`📈 Stocks — ${stack.stockTickers || "tickers TBD"}`] : []),
    ...stack.subreddits.map((s) => `↑ r/${s}`),
    ...(stack.hackerNews ? ["🟠 Hacker News"] : []),
  ];

  async function handleSubmit() {
    setStatus("loading");
    setErrorMsg("");

    const connectors: string[] = [];
    if (stack.weather) connectors.push("weather");
    if (stack.stocks) connectors.push("stocks");
    if (stack.subreddits.length > 0) connectors.push("reddit");
    if (stack.hackerNews) connectors.push("hacker_news");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        location: stack.weatherCity || null,
        subreddits: stack.subreddits,
        stocks: stack.stockTickers
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
        settings: { connectors },
      }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-7xl">🧇</div>
          <h1 className="text-3xl font-extrabold text-waffle-brown">Stack pressed.</h1>
          <p className="text-waffle-brown/60 text-lg leading-relaxed">
            Your first briefing arrives tomorrow at 7:00 AM.<br />Check your inbox.
          </p>
          <span className="inline-block bg-waffle-pale border border-waffle-golden/40 rounded-full px-5 py-2 text-sm font-semibold text-waffle-brown">
            Warm. Fresh. Yours. ✨
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-waffle-cream">
      {/* Progress bar */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm font-semibold text-waffle-orange">Step {step} of 3</span>
          <span className="text-sm text-waffle-brown/40">
            {step === 1 ? "Your details" : step === 2 ? "Building the flavor…" : "Press it"}
          </span>
        </div>
        <div className="h-1.5 bg-waffle-pale rounded-full overflow-hidden">
          <div
            className="h-full bg-waffle-golden rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <div className="max-w-md mx-auto px-6 py-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold italic text-waffle-brown leading-tight">
              Let&apos;s get you<br />set up.
            </h1>
            <p className="text-waffle-brown/55">First, what&apos;s your email?</p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email.includes("@") && setStep(2)}
              placeholder="you@example.com"
              className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
              autoFocus
            />
            <button
              onClick={() => setStep(2)}
              disabled={!email.includes("@")}
              className="w-full bg-waffle-brown hover:bg-waffle-espresso disabled:opacity-40 text-waffle-cream font-bold py-3.5 rounded-xl transition-colors"
            >
              Continue →
            </button>
          </div>
          <p className="text-xs text-waffle-brown/35 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-waffle-brown">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* ── Step 2: Build your stack ── */}
      {step === 2 && (
        <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_300px] gap-10 items-start">
          {/* Left: block picker */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold italic text-waffle-brown leading-tight mb-1">
                Build Your Stack.
              </h1>
              <p className="text-waffle-brown/55 text-sm">
                Pick the nodes that matter most to you. We&apos;ll press them into a crisp daily digest.
              </p>
            </div>

            {/* Live Vitals */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
                <span>📡</span> Live Vitals
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <BlockPickerCard
                  active={stack.weather}
                  onClick={() => setStack((s) => ({ ...s, weather: !s.weather }))}
                  icon="⛅"
                  label="Weather Node"
                >
                  {stack.weather && (
                    <input
                      type="text"
                      value={stack.weatherCity}
                      onChange={(e) => setStack((s) => ({ ...s, weatherCity: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter city…"
                      className="mt-2 w-full border-b border-waffle-brown/20 bg-transparent text-sm text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1"
                    />
                  )}
                </BlockPickerCard>

                <BlockPickerCard
                  active={stack.stocks}
                  onClick={() => setStack((s) => ({ ...s, stocks: !s.stocks }))}
                  icon="📈"
                  label="Stock Ticker"
                >
                  {stack.stocks && (
                    <input
                      type="text"
                      value={stack.stockTickers}
                      onChange={(e) => setStack((s) => ({ ...s, stockTickers: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="AAPL, TSLA…"
                      className="mt-2 w-full border-b border-waffle-brown/20 bg-transparent text-sm text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1"
                    />
                  )}
                </BlockPickerCard>
              </div>
            </section>

            {/* Reddit Nodes */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
                <span className="font-black text-orange-500">↑</span> Reddit Nodes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_SUBS.map((sub) => (
                  <BlockPickerCard
                    key={sub}
                    active={stack.subreddits.includes(sub)}
                    onClick={() => toggleSub(sub)}
                    icon={<span className="font-black text-orange-500 text-xl">↑</span>}
                    label={`r/${sub}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={stack.customSub}
                  onChange={(e) => setStack((s) => ({ ...s, customSub: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSub()}
                  placeholder="+ Add subreddit (e.g. r/cooking)"
                  className="flex-1 border border-waffle-brown/15 rounded-xl px-4 py-2.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
                />
                <button
                  type="button"
                  onClick={addCustomSub}
                  className="px-4 py-2.5 bg-waffle-pale rounded-xl text-waffle-brown font-semibold text-sm hover:bg-waffle-golden/30 transition-colors"
                >
                  Add
                </button>
              </div>
            </section>

            {/* The Deep End */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
                <span>🖥</span> The Deep End
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <BlockPickerCard
                  active={stack.hackerNews}
                  onClick={() => setStack((s) => ({ ...s, hackerNews: !s.hackerNews }))}
                  icon={
                    <span className="font-extrabold bg-orange-600 text-white w-7 h-7 flex items-center justify-center rounded text-xs">
                      Y
                    </span>
                  }
                  label="Hacker News"
                />
                <div className="rounded-2xl border-2 border-dashed border-waffle-brown/10 p-4 flex items-center justify-center text-waffle-brown/25 text-sm font-medium">
                  More coming soon
                </div>
              </div>
            </section>

            <button
              onClick={() => setStep(3)}
              disabled={!hasAnyBlock}
              className="bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-40 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
            >
              Continue to review →
            </button>
          </div>

          {/* Right: Your Stack preview */}
          <aside className="hidden md:block sticky top-24">
            <div className="bg-white rounded-2xl border border-waffle-brown/10 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-waffle-brown text-lg flex items-center gap-2">
                Your Stack <span>🥞</span>
              </h3>
              {stackItems.length === 0 ? (
                <div className="border-2 border-dashed border-waffle-brown/10 rounded-xl px-4 py-8 text-center text-waffle-brown/25 text-sm">
                  Pick more nodes to fill your waffle…
                </div>
              ) : (
                <ul className="space-y-2">
                  {stackItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 bg-waffle-pale rounded-xl px-4 py-3 text-sm font-semibold text-waffle-brown"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {hasAnyBlock && (
                <button
                  onClick={() => setStep(3)}
                  className="w-full bg-waffle-brown hover:bg-waffle-espresso text-waffle-cream font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Press My Digest →
                </button>
              )}
              <p className="text-xs text-waffle-brown/30 text-center">
                *Your daily waffle is pressed at 7:00 AM
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && (
        <div className="max-w-md mx-auto px-6 py-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold italic text-waffle-brown leading-tight">
              Ready to press.
            </h1>
            <p className="text-waffle-brown/55">
              Here&apos;s what&apos;s going in your morning stack.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-waffle-brown/10 p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-waffle-brown/8">
              <span className="text-sm text-waffle-brown/50">Delivering to</span>
              <span className="font-semibold text-waffle-brown text-sm">{email}</span>
            </div>
            {stackItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm font-semibold text-waffle-brown bg-waffle-pale rounded-xl px-4 py-3"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="bg-waffle-golden/15 rounded-2xl p-5 text-center space-y-1">
            <p className="text-2xl">⏰</p>
            <p className="font-bold text-waffle-brown">Delivered at 7:00 AM</p>
            <p className="text-xs text-waffle-brown/45">Every morning, no exceptions.</p>
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || !hasAnyBlock}
              className="w-full bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-base"
            >
              {status === "loading" ? "Pressing your waffle…" : "Press My Digest 🧇"}
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full text-waffle-brown/45 hover:text-waffle-brown font-semibold py-2 text-sm transition-colors"
            >
              ← Back to edit
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ── Shared picker card ──────────────────────────────────────────────────────

function BlockPickerCard({
  active,
  onClick,
  icon,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all select-none ${
        active
          ? "border-waffle-orange bg-waffle-orange/5"
          : "border-waffle-brown/10 bg-white hover:border-waffle-orange/40"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl leading-none">{icon}</span>
        {active && (
          <span className="w-5 h-5 rounded-full bg-waffle-orange flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            ✓
          </span>
        )}
      </div>
      <p className="font-bold text-waffle-brown text-sm">{label}</p>
      {children}
    </div>
  );
}
