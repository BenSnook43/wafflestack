"use client";

import { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export type BlockType = "weather" | "reddit" | "stocks" | "hacker_news" | "rss" | "separator";

export interface Block {
  id: string;
  type: BlockType;
  config: {
    city?: string;
    subreddits?: string[];
    tickers?: string[];
    feeds?: string[];
  };
}

interface Props {
  email: string;
  userId: string;
  active: boolean;
  blocks: Block[];
}

const PRESET_SUBS = ["technology", "science", "worldnews", "investing", "design", "philosophy"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Derive flat state from blocks array ─────────────────────────────────────

function blocksToState(blocks: Block[]) {
  const weather = blocks.find((b) => b.type === "weather");
  const stocks = blocks.find((b) => b.type === "stocks");
  const reddit = blocks.find((b) => b.type === "reddit");
  const rss = blocks.find((b) => b.type === "rss");
  const hackerNews = blocks.some((b) => b.type === "hacker_news");

  return {
    weather: !!weather,
    weatherCity: weather?.config.city ?? "",
    stocks: !!stocks,
    stockTickers: stocks?.config.tickers?.join(", ") ?? "",
    subreddits: reddit?.config.subreddits ?? [],
    customSub: "",
    hackerNews,
    rss: !!rss,
    feeds: rss?.config.feeds ?? [],
    customFeed: "",
  };
}

type StackState = ReturnType<typeof blocksToState>;

function stateToSavePayload(state: StackState) {
  const sectionOrder: string[] = [];
  if (state.weather) sectionOrder.push("weather");
  if (state.stocks) sectionOrder.push("stocks");
  if (state.subreddits.length > 0) sectionOrder.push("reddit");
  if (state.hackerNews) sectionOrder.push("hacker_news");
  if (state.feeds.length > 0) sectionOrder.push("rss");

  return {
    location: state.weather ? state.weatherCity || null : null,
    subreddits: state.subreddits,
    stocks: state.stocks
      ? state.stockTickers.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
      : [],
    rss_feeds: state.feeds,
    hacker_news: state.hackerNews,
    section_order: sectionOrder,
  };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient(props: Props) {
  const [stack, setStack] = useState<StackState>(() => blocksToState(props.blocks));
  const [active, setActive] = useState(props.active);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");

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

  function addFeed() {
    const url = stack.customFeed.trim();
    if (url && !stack.feeds.includes(url)) {
      setStack((s) => ({ ...s, feeds: [...s.feeds, url], customFeed: "" }));
    }
  }

  const hasAnyBlock =
    stack.weather || stack.stocks || stack.subreddits.length > 0 || stack.hackerNews || stack.feeds.length > 0;

  const stackItems = [
    ...(stack.weather ? [`⛅ Weather — ${stack.weatherCity || "city TBD"}`] : []),
    ...(stack.stocks ? [`📈 Stocks — ${stack.stockTickers || "tickers TBD"}`] : []),
    ...stack.subreddits.map((s) => `↑ r/${s}`),
    ...(stack.hackerNews ? ["🟠 Hacker News"] : []),
    ...stack.feeds.map((f) => `📡 ${f}`),
  ];

  async function handleSave() {
    setSaveStatus("loading");
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stateToSavePayload(stack)),
    });
    if (res.ok) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
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
    <main className="min-h-screen bg-waffle-cream">
      {/* ── Header ── */}
      <div className="bg-waffle-cream border-b border-waffle-brown/8">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-waffle-brown">Your Digest</h1>
            <p className="text-xs text-waffle-brown/40 mt-0.5">{props.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Pause toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-waffle-brown/50">
                {active ? "Active" : "Paused"}
              </span>
              <button
                onClick={handleTogglePause}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  active ? "bg-waffle-orange" : "bg-waffle-brown/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-waffle-brown/40 hover:text-waffle-brown transition-colors font-semibold"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_280px] gap-10 items-start">
        {/* Left: node picker */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold italic text-waffle-brown leading-tight mb-1">
              Edit Your Stack.
            </h2>
            <p className="text-waffle-brown/55 text-sm">
              Toggle nodes on or off. Changes are saved when you hit Save.
            </p>
          </div>

          {/* Live Vitals */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
              <span>📡</span> Live Vitals
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <NodeCard
                active={stack.weather}
                onClick={() => setStack((s) => ({ ...s, weather: !s.weather }))}
                icon="⛅"
                label="Weather"
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
              </NodeCard>

              <NodeCard
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
              </NodeCard>
            </div>
          </section>

          {/* Reddit Nodes */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
              <span className="font-black text-orange-500">↑</span> Reddit Nodes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_SUBS.map((sub) => (
                <NodeCard
                  key={sub}
                  active={stack.subreddits.includes(sub)}
                  onClick={() => toggleSub(sub)}
                  icon={<span className="font-black text-orange-500 text-xl">↑</span>}
                  label={`r/${sub}`}
                />
              ))}
              {/* Show custom subs that aren't in presets */}
              {stack.subreddits
                .filter((s) => !PRESET_SUBS.includes(s))
                .map((sub) => (
                  <NodeCard
                    key={sub}
                    active={true}
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
            <h3 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
              <span>🖥</span> The Deep End
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <NodeCard
                active={stack.hackerNews}
                onClick={() => setStack((s) => ({ ...s, hackerNews: !s.hackerNews }))}
                icon={
                  <span className="font-extrabold bg-orange-600 text-white w-7 h-7 flex items-center justify-center rounded text-xs">
                    Y
                  </span>
                }
                label="Hacker News"
              />
              <NodeCard
                active={stack.rss}
                onClick={() => setStack((s) => ({ ...s, rss: !s.rss, feeds: s.rss ? [] : s.feeds }))}
                icon="📡"
                label="RSS Feeds"
              >
                {stack.rss && (
                  <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {stack.feeds.map((feed) => (
                      <div
                        key={feed}
                        className="flex items-center justify-between gap-1 text-xs text-waffle-brown/60 bg-waffle-pale rounded-lg px-2 py-1.5"
                      >
                        <span className="truncate">{feed}</span>
                        <button
                          onClick={() => setStack((s) => ({ ...s, feeds: s.feeds.filter((f) => f !== feed) }))}
                          className="text-waffle-brown/30 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={stack.customFeed}
                        onChange={(e) => setStack((s) => ({ ...s, customFeed: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addFeed()}
                        onBlur={addFeed}
                        placeholder="Feed URL…"
                        className="flex-1 border-b border-waffle-brown/20 bg-transparent text-xs text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1"
                      />
                      <button onClick={addFeed} className="text-xs font-semibold text-waffle-orange">
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </NodeCard>
            </div>
          </section>
        </div>

        {/* Right: Your Stack sidebar */}
        <aside className="hidden md:block sticky top-8">
          <div className="bg-white rounded-2xl border border-waffle-brown/10 p-6 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-waffle-brown text-lg flex items-center gap-2">
              Your Stack <span>🥞</span>
            </h3>
            {stackItems.length === 0 ? (
              <div className="border-2 border-dashed border-waffle-brown/10 rounded-xl px-4 py-8 text-center text-waffle-brown/25 text-sm">
                Pick some nodes to build your digest…
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

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saveStatus === "loading"}
              className="w-full bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : "Save Stack"}
            </button>
            {saveStatus === "error" && (
              <p className="text-xs text-red-600 text-center">Failed to save. Try again.</p>
            )}

            <p className="text-xs text-waffle-brown/30 text-center">
              Your digest is delivered at 7:00 AM
            </p>
          </div>

          <div className="text-center mt-4">
            <a
              href={`/unsubscribe?uid=${props.userId}`}
              className="text-xs text-waffle-brown/30 hover:text-waffle-brown/60 underline transition-colors"
            >
              Unsubscribe permanently
            </a>
          </div>
        </aside>

        {/* Mobile save button (below the nodes) */}
        <div className="md:hidden space-y-3">
          <button
            onClick={handleSave}
            disabled={saveStatus === "loading"}
            className="w-full bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : "Save Stack"}
          </button>
          {saveStatus === "error" && (
            <p className="text-xs text-red-600 text-center">Failed to save. Try again.</p>
          )}
          <div className="text-center">
            <a
              href={`/unsubscribe?uid=${props.userId}`}
              className="text-xs text-waffle-brown/30 hover:text-waffle-brown/60 underline transition-colors"
            >
              Unsubscribe permanently
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Node Card ──────────────────────────────────────────────────────────────

function NodeCard({
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
