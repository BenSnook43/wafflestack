"use client";

import { useState } from "react";

const CONNECTORS = [
  { id: "weather", label: "Weather", description: "Daily forecast for your location" },
  { id: "reddit", label: "Reddit", description: "Top posts from your chosen subreddits" },
  { id: "stocks", label: "Markets", description: "Price snapshot for your watchlist" },
];

interface Props {
  email: string;
  userId: string;
  active: boolean;
  location: string;
  subreddits: string;
  stocks: string;
  connectors: string[];
}

export default function DashboardClient(props: Props) {
  const [location, setLocation] = useState(props.location);
  const [subreddits, setSubreddits] = useState(props.subreddits);
  const [stocks, setStocks] = useState(props.stocks);
  const [connectors, setConnectors] = useState(props.connectors);
  const [active, setActive] = useState(props.active);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleConnector(id: string) {
    setConnectors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        subreddits: subreddits.split(",").map((s) => s.trim().toLowerCase().replace(/^r\//, "")).filter(Boolean),
        stocks: stocks.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
        settings: { connectors },
      }),
    });

    if (res.ok) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Failed to save. Please try again.");
      setSaveStatus("error");
    }
  }

  async function handleTogglePause() {
    const next = !active;
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (res.ok) setActive(next);
  }

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-3xl">🧇</div>
            <h1 className="text-2xl font-bold tracking-tight">Your briefing</h1>
            <p className="text-sm text-gray-500">{props.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 underline mt-1"
          >
            Sign out
          </button>
        </div>

        {/* Pause toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
          <div>
            <p className="text-sm font-medium">{active ? "Briefings active" : "Briefings paused"}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {active ? "You receive one email every morning." : "No emails until you resume."}
            </p>
          </div>
          <button
            onClick={handleTogglePause}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              active ? "bg-amber-400" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Preferences form */}
        <form onSubmit={handleSave} className="space-y-5">
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

          {saveStatus === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={saveStatus === "loading"}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Saved!" : "Save preferences"}
          </button>
        </form>

        {/* Unsubscribe */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <a
            href={`/unsubscribe?uid=${props.userId}`}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Unsubscribe permanently
          </a>
        </div>
      </div>
    </main>
  );
}
