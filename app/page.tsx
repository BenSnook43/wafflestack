"use client";

import { useState } from "react";

type Connector = string;

const CONNECTORS: { id: Connector; label: string; description: string }[] = [
  { id: "weather", label: "Weather", description: "Daily forecast for your location" },
  { id: "reddit", label: "Reddit", description: "Top posts from your chosen subreddits" },
  { id: "stocks", label: "Markets", description: "Price snapshot for your watchlist" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [stocks, setStocks] = useState("");
  const [connectors, setConnectors] = useState<Connector[]>(["weather", "reddit", "stocks"]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleConnector(id: Connector) {
    setConnectors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        location,
        subreddits: subreddits.split(",").map((s) => s.trim().toLowerCase().replace(/^r\//, "")).filter(Boolean),
        stocks: stocks.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
        settings: { connectors },
      }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">🧇</div>
          <h1 className="text-2xl font-semibold">You&apos;re on the list.</h1>
          <p className="text-gray-600">Your first briefing arrives tomorrow morning. Check your inbox around 6:30am.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full space-y-8">
        <div className="space-y-2">
          <div className="text-4xl">🧇</div>
          <h1 className="text-3xl font-bold tracking-tight">WaffleStack</h1>
          <p className="text-gray-600">Your personalised morning briefing — weather, markets, and the posts you care about, in one email every day.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="London"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="subreddits">
              Subreddits <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              id="subreddits"
              type="text"
              value={subreddits}
              onChange={(e) => setSubreddits(e.target.value)}
              placeholder="technology, investing, worldnews"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="stocks">
              Stock watchlist <span className="text-gray-400 font-normal">(comma-separated tickers)</span>
            </label>
            <input
              id="stocks"
              type="text"
              value={stocks}
              onChange={(e) => setStocks(e.target.value)}
              placeholder="AAPL, TSLA, NVDA"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <p className="block text-sm font-medium mb-2">Include in my briefing</p>
            <div className="space-y-2">
              {CONNECTORS.map(({ id, label, description }) => (
                <label key={id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={connectors.includes(id)}
                    onChange={() => toggleConnector(id)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-gray-500 ml-1.5">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {status === "loading" ? "Signing you up…" : "Get my daily briefing"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          No spam. One email per day. Unsubscribe any time.
        </p>
      </div>
    </main>
  );
}
