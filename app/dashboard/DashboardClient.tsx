"use client";

import { useState, useRef, useEffect } from "react";

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
  trialEndsAt: string | null;
  subscriptionStatus: string;
  emailsSent: number;
}

// ── Inspiration data ────────────────────────────────────────────────────────

type InspirationSource =
  | { type: "subreddit"; value: string; label: string }
  | { type: "hacker_news" }
  | { type: "ticker"; value: string; label: string }
  | { type: "rss"; value: string; label: string }
  | { type: "weather" };

interface InspirationPack {
  label: string;
  emoji: string;
  sources: InspirationSource[];
}

const INSPIRATION_PACKS: InspirationPack[] = [
  {
    label: "Tech",
    emoji: "💻",
    sources: [
      { type: "subreddit", value: "technology", label: "r/technology" },
      { type: "subreddit", value: "programming", label: "r/programming" },
      { type: "subreddit", value: "MachineLearning", label: "r/MachineLearning" },
      { type: "hacker_news" },
    ],
  },
  {
    label: "Investing",
    emoji: "📈",
    sources: [
      { type: "ticker", value: "AAPL", label: "AAPL — Apple" },
      { type: "ticker", value: "TSLA", label: "TSLA — Tesla" },
      { type: "ticker", value: "SPY", label: "SPY — S&P 500 ETF" },
      { type: "subreddit", value: "investing", label: "r/investing" },
      { type: "subreddit", value: "stocks", label: "r/stocks" },
    ],
  },
  {
    label: "World News",
    emoji: "🌍",
    sources: [
      { type: "subreddit", value: "worldnews", label: "r/worldnews" },
      { type: "subreddit", value: "geopolitics", label: "r/geopolitics" },
      { type: "rss", value: "https://feeds.bbci.co.uk/news/rss.xml", label: "BBC News" },
      { type: "rss", value: "https://feeds.reuters.com/reuters/topNews", label: "Reuters" },
    ],
  },
  {
    label: "Design",
    emoji: "🎨",
    sources: [
      { type: "subreddit", value: "design", label: "r/design" },
      { type: "subreddit", value: "UXDesign", label: "r/UXDesign" },
      { type: "subreddit", value: "graphic_design", label: "r/graphic_design" },
      { type: "rss", value: "https://www.smashingmagazine.com/feed/", label: "Smashing Magazine" },
    ],
  },
  {
    label: "Science",
    emoji: "🔬",
    sources: [
      { type: "subreddit", value: "science", label: "r/science" },
      { type: "subreddit", value: "space", label: "r/space" },
      { type: "subreddit", value: "biology", label: "r/biology" },
      { type: "rss", value: "https://www.newscientist.com/feed/home/", label: "New Scientist" },
    ],
  },
  {
    label: "Crypto",
    emoji: "₿",
    sources: [
      { type: "subreddit", value: "CryptoCurrency", label: "r/CryptoCurrency" },
      { type: "subreddit", value: "Bitcoin", label: "r/Bitcoin" },
      { type: "ticker", value: "BTC-USD", label: "BTC — Bitcoin" },
      { type: "ticker", value: "ETH-USD", label: "ETH — Ethereum" },
    ],
  },
  {
    label: "Health",
    emoji: "🏃",
    sources: [
      { type: "subreddit", value: "fitness", label: "r/fitness" },
      { type: "subreddit", value: "nutrition", label: "r/nutrition" },
      { type: "subreddit", value: "running", label: "r/running" },
      { type: "rss", value: "https://examine.com/feed/", label: "Examine.com" },
    ],
  },
  {
    label: "Gaming",
    emoji: "🎮",
    sources: [
      { type: "subreddit", value: "gaming", label: "r/gaming" },
      { type: "subreddit", value: "gamedev", label: "r/gamedev" },
      { type: "subreddit", value: "pcgaming", label: "r/pcgaming" },
      { type: "rss", value: "https://www.rockpapershotgun.com/feed/", label: "Rock Paper Shotgun" },
    ],
  },
];

// ── Brandfetch logo component ────────────────────────────────────────────────

const BRANDFETCH_CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID ?? "";

function TickerLogo({ symbol, size = 24 }: { symbol: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed || !BRANDFETCH_CLIENT_ID) {
    return <span className="flex-shrink-0 text-sm">📈</span>;
  }
  return (
    <img
      src={`https://cdn.brandfetch.io/${symbol.toUpperCase()}/w/${size}/h/${size}?c=${BRANDFETCH_CLIENT_ID}`}
      alt={symbol}
      width={size}
      height={size}
      className="rounded flex-shrink-0 object-contain"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}

function sourceIcon(src: InspirationSource) {
  if (src.type === "hacker_news") {
    return (
      <span className="font-extrabold bg-orange-600 text-white w-5 h-5 flex items-center justify-center rounded text-[10px] flex-shrink-0">
        Y
      </span>
    );
  }
  if (src.type === "subreddit") {
    return <span className="font-black text-orange-500 text-base leading-none flex-shrink-0">↑</span>;
  }
  if (src.type === "ticker") return <TickerLogo symbol={src.value} size={20} />;
  if (src.type === "rss") return <span className="flex-shrink-0">📡</span>;
  if (src.type === "weather") return <span className="flex-shrink-0">⛅</span>;
}

function sourceLabel(src: InspirationSource) {
  if (src.type === "hacker_news") return "Hacker News";
  if (src.type === "weather") return "Weather";
  return src.label;
}

// ── Badge ────────────────────────────────────────────────────────────────────

function subscriptionBadge(status: string, trialEndsAt: string | null): { label: string; color: string } {
  if (status === "active") return { label: "Subscribed", color: "text-green-600" };
  if (status === "cancelled") return { label: "Cancelled", color: "text-waffle-brown/40" };
  if (status === "past_due") return { label: "Trial ended", color: "text-red-500" };
  if (trialEndsAt) {
    const days = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000));
    return { label: `${days} day${days !== 1 ? "s" : ""} left in trial`, color: "text-waffle-orange" };
  }
  return { label: "Free trial", color: "text-waffle-orange" };
}

const PRESET_SUBS = ["technology", "science", "worldnews", "investing", "design", "philosophy"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Derive flat state from blocks array ─────────────────────────────────────

const DEFAULT_SECTION_ORDER = ["weather", "stocks", "reddit", "hacker_news", "rss"];

function blocksToState(blocks: Block[]) {
  const weather = blocks.find((b) => b.type === "weather");
  const stocks = blocks.find((b) => b.type === "stocks");
  const reddit = blocks.find((b) => b.type === "reddit");
  const rss = blocks.find((b) => b.type === "rss");
  const hackerNews = blocks.some((b) => b.type === "hacker_news");

  // Derive order from blocks (which already respect DB section_order), then append missing
  const fromBlocks = blocks.map((b) => b.type).filter((t) => DEFAULT_SECTION_ORDER.includes(t as string));
  const missing = DEFAULT_SECTION_ORDER.filter((t) => !fromBlocks.includes(t as BlockType));
  const sectionOrder = [...fromBlocks, ...missing];

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
    sectionOrder,
  };
}

type StackState = ReturnType<typeof blocksToState>;

function stateToSavePayload(state: StackState) {
  const sectionOrder = state.sectionOrder.filter((key) => {
    if (key === "weather") return state.weather;
    if (key === "stocks") return state.stocks;
    if (key === "reddit") return state.subreddits.length > 0;
    if (key === "hacker_news") return state.hackerNews;
    if (key === "rss") return state.feeds.length > 0;
    return false;
  });

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

// ── Check if a source is already in the stack ────────────────────────────────

function isInStack(src: InspirationSource, s: StackState): boolean {
  switch (src.type) {
    case "subreddit":
      return s.subreddits.map((r) => r.toLowerCase()).includes(src.value.toLowerCase());
    case "hacker_news":
      return s.hackerNews;
    case "ticker": {
      const tickers = s.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
      return tickers.includes(src.value.toUpperCase());
    }
    case "rss":
      return s.feeds.includes(src.value);
    case "weather":
      return s.weather;
  }
}

// ── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient(props: Props) {
  const [stack, setStack] = useState<StackState>(() => blocksToState(props.blocks));
  const [active, setActive] = useState(props.active);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [subCheck, setSubCheck] = useState<"idle" | "checking" | "invalid">("idle");
  const [inspiredOpen, setInspiredOpen] = useState(false);
  const [tickerQuery, setTickerQuery] = useState("");
  const [tickerResults, setTickerResults] = useState<{ symbol: string; description: string }[]>([]);
  const [tickerSearching, setTickerSearching] = useState(false);
  const [tickerDropdownOpen, setTickerDropdownOpen] = useState(false);
  const [tickerError, setTickerError] = useState(false);
  const tickerDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickerInputRef = useRef<HTMLInputElement>(null);
  const dragKey = useRef<string | null>(null);
  const dragPosition = useRef<"before" | "after" | null>(null);
  const [dragOver, setDragOver] = useState<{ key: string; position: "before" | "after" } | null>(null);

  function toggleSub(sub: string) {
    setStack((s) => ({
      ...s,
      subreddits: s.subreddits.includes(sub)
        ? s.subreddits.filter((r) => r !== sub)
        : [...s.subreddits, sub],
    }));
  }

  async function addCustomSub() {
    const cleaned = stack.customSub.trim().toLowerCase().replace(/^r\//, "");
    if (!cleaned || stack.subreddits.includes(cleaned)) return;

    setSubCheck("checking");
    try {
      const res = await fetch(`/api/validate-subreddit?name=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (data.exists) {
        const name = data.canonical ?? cleaned;
        setStack((s) => ({ ...s, subreddits: [...s.subreddits, name], customSub: "" }));
        setSubCheck("idle");
      } else {
        setSubCheck("invalid");
      }
    } catch {
      // Network error — allow adding anyway, server will validate on save
      setStack((s) => ({ ...s, subreddits: [...s.subreddits, cleaned], customSub: "" }));
      setSubCheck("idle");
    }
  }

  function searchTicker(q: string) {
    setTickerQuery(q);
    if (tickerDebounce.current) clearTimeout(tickerDebounce.current);
    if (!q.trim()) {
      setTickerResults([]);
      setTickerDropdownOpen(false);
      setTickerError(false);
      return;
    }
    tickerDebounce.current = setTimeout(async () => {
      setTickerSearching(true);
      setTickerError(false);
      try {
        const res = await fetch(`/api/search-ticker?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        if (!res.ok) {
          setTickerResults([]);
          setTickerError(true);
          setTickerDropdownOpen(true);
          return;
        }
        const currentTickers = stack.stockTickers
          .split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
        const filtered = (data.results ?? []).filter(
          (r: { symbol: string }) => !currentTickers.includes(r.symbol.toUpperCase())
        );
        setTickerResults(filtered);
        setTickerDropdownOpen(filtered.length > 0);
      } catch {
        setTickerResults([]);
        setTickerError(true);
        setTickerDropdownOpen(true);
      } finally {
        setTickerSearching(false);
      }
    }, 300);
  }

  function addTicker(symbol: string) {
    const upper = symbol.toUpperCase();
    const existing = stack.stockTickers
      .split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (existing.includes(upper)) return;
    setStack((s) => ({
      ...s,
      stocks: true,
      stockTickers: [...existing, upper].join(", "),
    }));
    setTickerQuery("");
    setTickerResults([]);
    setTickerDropdownOpen(false);
    tickerInputRef.current?.focus();
  }

  function removeTicker(symbol: string) {
    const upper = symbol.toUpperCase();
    setStack((s) => {
      const remaining = s.stockTickers
        .split(",").map((t) => t.trim().toUpperCase()).filter((t) => t && t !== upper);
      return { ...s, stockTickers: remaining.join(", "), stocks: remaining.length > 0 };
    });
  }

  function handleDragStart(key: string) {
    dragKey.current = key;
  }

  function handleDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    if (!dragKey.current || dragKey.current === key) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    dragPosition.current = position;
    setDragOver({ key, position });
  }

  function handleDrop(key: string) {
    const from = dragKey.current;
    const position = dragPosition.current;
    setDragOver(null);
    dragKey.current = null;
    dragPosition.current = null;
    if (!from || from === key || !position) return;
    setStack((s) => {
      const order = [...s.sectionOrder];
      const fromIdx = order.indexOf(from);
      if (fromIdx < 0) return s;
      order.splice(fromIdx, 1);
      const toIdx = order.indexOf(key);
      if (toIdx < 0) return s;
      order.splice(position === "before" ? toIdx : toIdx + 1, 0, from);
      return { ...s, sectionOrder: order };
    });
  }

  function handleDragEnd() {
    dragKey.current = null;
    dragPosition.current = null;
    setDragOver(null);
  }

  function removeSection(key: string) {
    setStack((s) => {
      switch (key) {
        case "weather": return { ...s, weather: false, weatherCity: "" };
        case "stocks": return { ...s, stocks: false, stockTickers: "" };
        case "reddit": return { ...s, subreddits: [] };
        case "hacker_news": return { ...s, hackerNews: false };
        case "rss": return { ...s, rss: false, feeds: [] };
        default: return s;
      }
    });
  }

  // Clean up debounce on unmount
  useEffect(() => () => { if (tickerDebounce.current) clearTimeout(tickerDebounce.current); }, []);

  function addFeed() {
    const url = stack.customFeed.trim();
    if (url && !stack.feeds.includes(url)) {
      setStack((s) => ({ ...s, feeds: [...s.feeds, url], customFeed: "" }));
    }
  }

  function addFromInspiration(src: InspirationSource) {
    setStack((s) => {
      switch (src.type) {
        case "subreddit": {
          if (s.subreddits.map((r) => r.toLowerCase()).includes(src.value.toLowerCase())) return s;
          return { ...s, subreddits: [...s.subreddits, src.value] };
        }
        case "hacker_news":
          return { ...s, hackerNews: true };
        case "ticker": {
          const existing = s.stockTickers
            ? s.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean)
            : [];
          if (existing.includes(src.value.toUpperCase())) return s;
          return { ...s, stocks: true, stockTickers: [...existing, src.value.toUpperCase()].join(", ") };
        }
        case "rss":
          if (s.feeds.includes(src.value)) return s;
          return { ...s, rss: true, feeds: [...s.feeds, src.value] };
        case "weather":
          return { ...s, weather: true };
      }
    });
  }

  const hasAnyBlock =
    stack.weather || stack.stocks || stack.subreddits.length > 0 || stack.hackerNews || stack.feeds.length > 0;

  // Active sections in user-defined order
  const activeSectionOrder = stack.sectionOrder.filter((key) => {
    if (key === "weather") return stack.weather;
    if (key === "stocks") return stack.stocks;
    if (key === "reddit") return stack.subreddits.length > 0;
    if (key === "hacker_news") return stack.hackerNews;
    if (key === "rss") return stack.rss && stack.feeds.length > 0;
    return false;
  });

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

  const badge = subscriptionBadge(props.subscriptionStatus, props.trialEndsAt);

  return (
    <main className="min-h-screen bg-waffle-cream">
      {/* ── Header ── */}
      <div className="bg-waffle-cream border-b border-waffle-brown/8">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-waffle-brown">Your Digest</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-waffle-brown/40">{props.email}</p>
              <span className={`text-xs font-semibold ${badge.color}`}>{badge.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Inspiration toggle */}
            <button
              onClick={() => setInspiredOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-waffle-brown/50 hover:text-waffle-brown border border-waffle-brown/15 hover:border-waffle-brown/40 px-3 py-1.5 rounded-full transition-colors"
            >
              <span>✨</span> Get Inspired
            </button>
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
                onClick={() => {
                  const next = !stack.stocks;
                  setStack((s) => ({ ...s, stocks: next }));
                  if (next) setTimeout(() => tickerInputRef.current?.focus(), 50);
                }}
                icon="📈"
                label="Stock Ticker"
              >
                {stack.stocks && (
                  <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {/* Ticker chips */}
                    {stack.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stack.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).map((ticker) => (
                          <span
                            key={ticker}
                            className="flex items-center gap-1 bg-waffle-pale rounded-lg px-2 py-0.5 text-xs font-semibold text-waffle-brown"
                          >
                            <TickerLogo symbol={ticker} size={16} />
                            {ticker}
                            <button
                              type="button"
                              onClick={() => removeTicker(ticker)}
                              className="ml-0.5 text-waffle-brown/40 hover:text-waffle-brown leading-none"
                              aria-label={`Remove ${ticker}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Search input */}
                    <div className="relative">
                      <input
                        ref={tickerInputRef}
                        type="text"
                        value={tickerQuery}
                        onChange={(e) => searchTicker(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tickerResults.length > 0) {
                            addTicker(tickerResults[0].symbol);
                          }
                          if (e.key === "Escape") {
                            setTickerDropdownOpen(false);
                          }
                        }}
                        onFocus={() => tickerResults.length > 0 && setTickerDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setTickerDropdownOpen(false), 150)}
                        placeholder={tickerSearching ? "Searching…" : "Search ticker or company…"}
                        className="w-full border-b border-waffle-brown/20 bg-transparent text-sm text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1"
                      />
                      {tickerDropdownOpen && (
                        <ul className="absolute left-0 right-0 top-full z-50 bg-white border border-waffle-brown/15 rounded-xl shadow-lg overflow-hidden mt-1">
                          {tickerResults.map((r) => (
                            <li key={r.symbol}>
                              <button
                                type="button"
                                onMouseDown={() => addTicker(r.symbol)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-waffle-pale text-left transition-colors"
                              >
                                <TickerLogo symbol={r.symbol} size={20} />
                                <span className="font-semibold text-sm text-waffle-brown">{r.symbol}</span>
                                <span className="text-xs text-waffle-brown/50 truncate">{r.description}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
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
            <div className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={stack.customSub}
                  onChange={(e) => {
                    setStack((s) => ({ ...s, customSub: e.target.value }));
                    if (subCheck === "invalid") setSubCheck("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSub()}
                  placeholder="+ Add subreddit (e.g. r/cooking)"
                  disabled={subCheck === "checking"}
                  className="flex-1 border border-waffle-brown/15 rounded-xl px-4 py-2.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addCustomSub}
                  disabled={subCheck === "checking"}
                  className="px-4 py-2.5 bg-waffle-pale rounded-xl text-waffle-brown font-semibold text-sm hover:bg-waffle-golden/30 transition-colors disabled:opacity-50"
                >
                  {subCheck === "checking" ? "Checking…" : "Add"}
                </button>
              </div>
              {subCheck === "invalid" && (
                <p className="text-xs text-red-500 px-1">
                  r/{stack.customSub.trim().toLowerCase().replace(/^r\//, "")} doesn&apos;t exist on Reddit
                </p>
              )}
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
            {activeSectionOrder.length === 0 ? (
              <div className="border-2 border-dashed border-waffle-brown/10 rounded-xl px-4 py-8 text-center text-waffle-brown/25 text-sm">
                Pick some nodes to build your digest…
              </div>
            ) : (
              <ul className="space-y-2">
                {activeSectionOrder.map((key) => {
                  const sectionMeta: Record<string, { icon: string; label: string }> = {
                    weather: { icon: "⛅", label: `Weather${stack.weatherCity ? ` — ${stack.weatherCity}` : ""}` },
                    stocks: { icon: "📈", label: "Stocks" },
                    reddit: { icon: "↑", label: "Reddit" },
                    hacker_news: { icon: "🟠", label: "Hacker News" },
                    rss: { icon: "📡", label: "RSS Feeds" },
                  };
                  const meta = sectionMeta[key];

                  const subItems: { key: string; label: string; onRemove: () => void }[] = [];
                  if (key === "stocks") {
                    stack.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).forEach((ticker) => {
                      subItems.push({ key: ticker, label: ticker, onRemove: () => removeTicker(ticker) });
                    });
                  }
                  if (key === "reddit") {
                    stack.subreddits.forEach((sub) => {
                      subItems.push({ key: sub, label: `r/${sub}`, onRemove: () => toggleSub(sub) });
                    });
                  }
                  if (key === "rss") {
                    stack.feeds.forEach((feed) => {
                      const short = feed.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
                      subItems.push({
                        key: feed,
                        label: short,
                        onRemove: () => setStack((s) => ({ ...s, feeds: s.feeds.filter((f) => f !== feed) })),
                      });
                    });
                  }

                  const isDropBefore = dragOver?.key === key && dragOver.position === "before";
                  const isDropAfter = dragOver?.key === key && dragOver.position === "after";

                  return (
                    <li
                      key={key}
                      draggable
                      onDragStart={() => handleDragStart(key)}
                      onDragOver={(e) => handleDragOver(e, key)}
                      onDrop={() => handleDrop(key)}
                      onDragEnd={handleDragEnd}
                      className={`bg-waffle-pale rounded-xl overflow-hidden border-y-2 transition-colors ${
                        isDropBefore
                          ? "border-t-waffle-orange border-b-transparent"
                          : isDropAfter
                          ? "border-b-waffle-orange border-t-transparent"
                          : "border-y-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        {/* Drag handle */}
                        <span className="cursor-grab active:cursor-grabbing text-waffle-brown/25 hover:text-waffle-brown/50 flex-shrink-0 transition-colors" aria-hidden>
                          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                            <rect y="1.5" width="10" height="1.5" rx="0.75"/>
                            <rect y="6" width="10" height="1.5" rx="0.75"/>
                            <rect y="10.5" width="10" height="1.5" rx="0.75"/>
                          </svg>
                        </span>
                        <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>
                        <span className="flex-1 text-sm font-semibold text-waffle-brown truncate">{meta.label}</span>
                        <button
                          onClick={() => removeSection(key)}
                          className="text-waffle-brown/25 hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none ml-1"
                          aria-label={`Remove ${meta.label}`}
                        >×</button>
                      </div>
                      {subItems.length > 0 && (
                        <div className="border-t border-waffle-brown/8 px-3 pb-2 pt-1.5 space-y-1">
                          {subItems.map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-1">
                              <span className="text-xs text-waffle-brown/55 truncate">{item.label}</span>
                              <button
                                onClick={item.onRemove}
                                className="text-waffle-brown/25 hover:text-red-400 transition-colors text-sm leading-none flex-shrink-0"
                                aria-label={`Remove ${item.label}`}
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
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
            {props.emailsSent > 0 && (
              <p className="text-xs text-waffle-brown/30 text-center">
                {props.emailsSent} digest{props.emailsSent !== 1 ? "s" : ""} sent so far
              </p>
            )}
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

      {/* ── Inspiration drawer ── */}
      {inspiredOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setInspiredOpen(false)}
          />
          {/* Panel */}
          <aside className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-waffle-brown/10 flex-shrink-0">
              <div>
                <p className="font-extrabold text-waffle-brown text-base">✨ Inspiration</p>
                <p className="text-xs text-waffle-brown/40 mt-0.5">Tap any source to add it to your stack</p>
              </div>
              <button
                onClick={() => setInspiredOpen(false)}
                className="text-waffle-brown/30 hover:text-waffle-brown transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {INSPIRATION_PACKS.map((pack) => (
                <InspirationPackSection
                  key={pack.label}
                  pack={pack}
                  stack={stack}
                  onAdd={addFromInspiration}
                />
              ))}
            </div>
          </aside>
        </>
      )}
    </main>
  );
}

// ── Inspiration Pack Section ─────────────────────────────────────────────────

function InspirationPackSection({
  pack,
  stack,
  onAdd,
}: {
  pack: InspirationPack;
  stack: StackState;
  onAdd: (src: InspirationSource) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-waffle-brown/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-waffle-pale hover:bg-waffle-golden/20 transition-colors text-left"
      >
        <span className="flex items-center gap-2 font-bold text-waffle-brown text-sm">
          <span>{pack.emoji}</span>
          <span>{pack.label}</span>
        </span>
        <span className="text-waffle-brown/30 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="divide-y divide-waffle-brown/5">
          {pack.sources.map((src, i) => {
            const added = isInStack(src, stack);
            return (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {sourceIcon(src)}
                </div>
                <span className="flex-1 text-xs font-medium text-waffle-brown/70 truncate">
                  {sourceLabel(src)}
                </span>
                <button
                  onClick={() => !added && onAdd(src)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    added
                      ? "bg-waffle-orange/15 text-waffle-orange cursor-default"
                      : "bg-waffle-brown/8 hover:bg-waffle-orange hover:text-white text-waffle-brown/40"
                  }`}
                >
                  {added ? "✓" : "+"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
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
