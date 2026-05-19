"use client";

import { useState, useRef, useEffect } from "react";
import { SOURCE_LIMITS } from "@/lib/source-limits";

// ── Types ───────────────────────────────────────────────────────────────────

export type BlockType = "weather" | "reddit" | "stocks" | "crypto" | "hacker_news" | "rss" | "substack" | "separator";

export interface Block {
  id: string;
  type: BlockType;
  config: {
    city?: string;
    subreddits?: string[];
    tickers?: string[];
    coins?: string[];
    feeds?: string[];
  };
}

interface Props {
  email: string;
  userId: string;
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
  | { type: "crypto"; value: string; label: string }
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
      { type: "rss", value: "https://feeds.arstechnica.com/arstechnica/index", label: "Ars Technica" },
      { type: "rss", value: "https://www.theverge.com/rss/index.xml", label: "The Verge" },
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
      { type: "rss", value: "https://feeds.marketwatch.com/marketwatch/topstories/", label: "MarketWatch" },
      { type: "rss", value: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", label: "CNBC Finance" },
    ],
  },
  {
    label: "World News",
    emoji: "🌍",
    sources: [
      { type: "subreddit", value: "worldnews", label: "r/worldnews" },
      { type: "subreddit", value: "geopolitics", label: "r/geopolitics" },
      { type: "rss", value: "https://feeds.bbci.co.uk/news/rss.xml", label: "BBC News" },
      { type: "rss", value: "https://feeds.npr.org/1001/rss.xml", label: "NPR News" },
      { type: "rss", value: "https://www.theguardian.com/world/rss", label: "The Guardian" },
      { type: "rss", value: "https://www.aljazeera.com/xml/rss/all.xml", label: "Al Jazeera" },
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
      { type: "rss", value: "https://alistapart.com/main/feed/", label: "A List Apart" },
      { type: "rss", value: "https://css-tricks.com/feed/", label: "CSS-Tricks" },
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
      { type: "rss", value: "https://www.sciencedaily.com/rss/all.xml", label: "ScienceDaily" },
      { type: "rss", value: "https://phys.org/rss-feed/", label: "Phys.org" },
    ],
  },
  {
    label: "Crypto",
    emoji: "₿",
    sources: [
      { type: "subreddit", value: "CryptoCurrency", label: "r/CryptoCurrency" },
      { type: "subreddit", value: "Bitcoin", label: "r/Bitcoin" },
      { type: "crypto", value: "BTC", label: "BTC — Bitcoin" },
      { type: "crypto", value: "ETH", label: "ETH — Ethereum" },
      { type: "crypto", value: "SOL", label: "SOL — Solana" },
      { type: "rss", value: "https://www.coindesk.com/arc/outboundfeeds/rss/", label: "CoinDesk" },
      { type: "rss", value: "https://cointelegraph.com/rss", label: "Cointelegraph" },
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
      { type: "rss", value: "https://newsnetwork.mayoclinic.org/feed/", label: "Mayo Clinic" },
      { type: "rss", value: "https://www.who.int/rss-feeds/news-english.xml", label: "WHO News" },
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
      { type: "rss", value: "https://www.eurogamer.net/feed", label: "Eurogamer" },
      { type: "rss", value: "https://www.pcgamer.com/rss/", label: "PC Gamer" },
    ],
  },
];

// ── Curated RSS feeds ────────────────────────────────────────────────────────

interface CuratedFeed {
  name: string;
  url: string;
  domain: string;
  description: string;
  category: string;
}

const CURATED_FEEDS: CuratedFeed[] = [
  // Tech
  { name: "Ars Technica",       url: "https://feeds.arstechnica.com/arstechnica/index",                                                    domain: "arstechnica.com",      description: "In-depth tech news and analysis",              category: "Tech" },
  { name: "The Verge",          url: "https://www.theverge.com/rss/index.xml",                                                             domain: "theverge.com",         description: "Tech, science, and culture",                   category: "Tech" },
  { name: "Wired",              url: "https://www.wired.com/feed/rss",                                                                     domain: "wired.com",            description: "The latest tech news from WIRED",              category: "Tech" },
  { name: "TechCrunch",         url: "https://techcrunch.com/feed/",                                                                       domain: "techcrunch.com",       description: "Startup and tech industry news",               category: "Tech" },
  // Investing
  { name: "MarketWatch",        url: "https://feeds.marketwatch.com/marketwatch/topstories/",                                              domain: "marketwatch.com",      description: "Top financial stories and market data",        category: "Investing" },
  { name: "CNBC Finance",        url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",           domain: "cnbc.com",             description: "Top financial news and market analysis",       category: "Investing" },
  { name: "Seeking Alpha",      url: "https://seekingalpha.com/market_currents.xml",                                                       domain: "seekingalpha.com",     description: "Stock market analysis and commentary",         category: "Investing" },
  { name: "The Motley Fool",    url: "https://www.fool.com/feeds/index.aspx",                                                              domain: "fool.com",             description: "Stock picks and investing advice",             category: "Investing" },
  // World News
  { name: "BBC News",           url: "https://feeds.bbci.co.uk/news/rss.xml",                                                             domain: "bbc.co.uk",            description: "Top stories from BBC News",                    category: "World News" },
  { name: "NPR News",            url: "https://feeds.npr.org/1001/rss.xml",                                                                 domain: "npr.org",              description: "Breaking news from around the world",          category: "World News" },
  { name: "The Guardian",       url: "https://www.theguardian.com/world/rss",                                                              domain: "theguardian.com",      description: "World news from The Guardian",                 category: "World News" },
  { name: "Al Jazeera",         url: "https://www.aljazeera.com/xml/rss/all.xml",                                                          domain: "aljazeera.com",        description: "News from a global perspective",               category: "World News" },
  // Design
  { name: "Smashing Magazine",  url: "https://www.smashingmagazine.com/feed/",                                                             domain: "smashingmagazine.com", description: "Web design and development articles",          category: "Design" },
  { name: "A List Apart",       url: "https://alistapart.com/main/feed/",                                                                  domain: "alistapart.com",       description: "Articles for people who make websites",        category: "Design" },
  { name: "CSS-Tricks",         url: "https://css-tricks.com/feed/",                                                                       domain: "css-tricks.com",       description: "Tips and tricks on CSS front-end dev",         category: "Design" },
  { name: "Sidebar",            url: "https://sidebar.io/feed.xml",                                                                        domain: "sidebar.io",           description: "Five design links every weekday",              category: "Design" },
  // Science
  { name: "New Scientist",      url: "https://www.newscientist.com/feed/home/",                                                            domain: "newscientist.com",     description: "Science news and discoveries",                 category: "Science" },
  { name: "ScienceDaily",       url: "https://www.sciencedaily.com/rss/all.xml",                                                           domain: "sciencedaily.com",     description: "Latest research from universities worldwide",  category: "Science" },
  { name: "Phys.org",           url: "https://phys.org/rss-feed/",                                                                         domain: "phys.org",             description: "Physics, tech, and science news",              category: "Science" },
  { name: "NASA News",          url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",                                                     domain: "nasa.gov",             description: "Breaking news from NASA",                      category: "Science" },
  // Crypto
  { name: "CoinDesk",           url: "https://www.coindesk.com/arc/outboundfeeds/rss/",                                                    domain: "coindesk.com",         description: "Crypto and blockchain news",                   category: "Crypto" },
  { name: "Cointelegraph",      url: "https://cointelegraph.com/rss",                                                                      domain: "cointelegraph.com",    description: "Cryptocurrency market and analysis",           category: "Crypto" },
  { name: "Decrypt",            url: "https://decrypt.co/feed",                                                                            domain: "decrypt.co",           description: "Web3, DeFi, and NFT coverage",                 category: "Crypto" },
  { name: "The Block",          url: "https://www.theblock.co/rss.xml",                                                                    domain: "theblock.co",          description: "Institutional crypto research and news",       category: "Crypto" },
  // Health
  { name: "Examine.com",        url: "https://examine.com/feed/",                                                                          domain: "examine.com",          description: "Evidence-based nutrition and supplement info", category: "Health" },
  { name: "Mayo Clinic",         url: "https://newsnetwork.mayoclinic.org/feed/",                                                            domain: "mayoclinic.org",       description: "Health news from Mayo Clinic experts",         category: "Health" },
  { name: "WHO News",            url: "https://www.who.int/rss-feeds/news-english.xml",                                                    domain: "who.int",              description: "Global health news from the WHO",              category: "Health" },
  { name: "MedPage Today",      url: "https://www.medpagetoday.com/rss/headlines.xml",                                                     domain: "medpagetoday.com",     description: "Medical news for healthcare professionals",    category: "Health" },
  // Gaming
  { name: "Rock Paper Shotgun", url: "https://www.rockpapershotgun.com/feed/",                                                             domain: "rockpapershotgun.com", description: "PC gaming news and reviews",                   category: "Gaming" },
  { name: "Eurogamer",          url: "https://www.eurogamer.net/feed",                                                                     domain: "eurogamer.net",        description: "Game reviews, news, and guides",               category: "Gaming" },
  { name: "PC Gamer",           url: "https://www.pcgamer.com/rss/",                                                                       domain: "pcgamer.com",          description: "PC gaming features and hardware reviews",      category: "Gaming" },
  { name: "Kotaku",             url: "https://kotaku.com/rss",                                                                             domain: "kotaku.com",           description: "Gaming culture, reviews, and commentary",      category: "Gaming" },
];

const CURATED_CATEGORIES = ["All", "Tech", "Investing", "World News", "Design", "Science", "Crypto", "Health", "Gaming"];

const CURATED_FEEDS_INITIAL_COUNT = 6;

// Lazy-built at module init after all curated data is defined
function feedLabel(url: string): string {
  for (const f of CURATED_FEEDS) {
    if (f.url === url) return f.name;
  }
  for (const pack of INSPIRATION_PACKS) {
    for (const s of pack.sources) {
      if (s.type === "rss" && s.value === url) return s.label;
    }
  }
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

const CATEGORY_EMOJI: Record<string, string> = {
  "All": "⚡",
  "Tech": "💻",
  "Investing": "📈",
  "World News": "🌍",
  "Design": "🎨",
  "Science": "🔬",
  "Crypto": "₿",
  "Health": "🏃",
  "Gaming": "🎮",
};

// ── Curated Substacks ────────────────────────────────────────────────────────

interface CuratedSubstack {
  slug: string;
  name: string;
  description: string;
  category: string;
  feedUrl?: string;      // override for custom-domain Substacks
  faviconDomain?: string; // override favicon domain when slug.substack.com is wrong
}

const CURATED_SUBSTACKS: CuratedSubstack[] = [
  // Tech
  { slug: "pragmaticengineer",  name: "The Pragmatic Engineer",  description: "Inside big tech and high-growth startups",            category: "Tech" },
  { slug: "bigtechnology",      name: "Big Technology",          description: "Reporting on the most powerful companies in tech",    category: "Tech" },
  { slug: "platformer",         name: "Platformer",              description: "Platform policy, social media, and Big Tech",         category: "Tech" },
  // AI
  { slug: "bensbites",           name: "Ben's Bites",             description: "Daily AI news and what it means for you",            category: "AI" },
  { slug: "importai",           name: "Import AI",               description: "AI research analysis from Jack Clark",               category: "AI" },
  { slug: "theneuron",           name: "The Neuron",              description: "Practical AI tools and use cases, daily",            category: "AI" },
  // Tech (cont.)
  { slug: "semianalysis",       name: "SemiAnalysis",            description: "Deep-dive semiconductor and AI chip industry analysis", category: "Tech" },
  // Startups
  { slug: "lennysnewsletter",   name: "Lenny's Newsletter",      description: "Product, growth, and career advice for builders",    category: "Startups" },
  { slug: "notboring",          name: "Not Boring",              description: "Business strategy and company deep-dives",           category: "Startups" },
  { slug: "cjgustafson",         name: "Mostly Metrics",          description: "SaaS metrics, benchmarks, and growth insights",     category: "Startups" },
  { slug: "profgalloway",       name: "No Mercy / No Malice",    description: "Scott Galloway on business, tech, and society",     category: "Startups", feedUrl: "https://www.profgmedia.com/feed", faviconDomain: "profgmedia.com" },
  { slug: "a16z",               name: "a16z",                    description: "Tech and startup insights from Andreessen Horowitz", category: "Startups", feedUrl: "https://www.a16z.news/feed", faviconDomain: "a16z.news" },
  // Finance
  { slug: "thediff",            name: "The Diff",                description: "Finance and tech trends for long-term thinkers",    category: "Finance" },
  { slug: "netinterest",        name: "Net Interest",            description: "Deep dives into fintech and financial services",     category: "Finance" },
  { slug: "doomberg",           name: "Doomberg",                description: "Energy markets and macro through a contrarian lens", category: "Finance" },
  { slug: "chamath",            name: "Chamath Palihapitiya",    description: "Macro investing, tech, and VC perspectives",        category: "Finance" },
  { slug: "raydalio",           name: "Ray Dalio",               description: "Macro economics and principles from Ray Dalio",     category: "Finance" },
  // Ideas
  { slug: "astralcodexten",     name: "Astral Codex Ten",        description: "Rationalism, psychiatry, and big ideas",            category: "Ideas" },
  { slug: "worksinprogress",    name: "Works in Progress",       description: "Long-form pieces on progress and innovation",       category: "Ideas" },
  { slug: "cremieux",           name: "Cremieux Recueil",        description: "Data-driven takes on social science research",      category: "Ideas" },
  // Culture
  { slug: "annehelen",          name: "Culture Study",           description: "Essays on culture, work, and how we live now",      category: "Culture" },
  { slug: "heathercoxrichardson", name: "Letters from an American", description: "Daily history and politics from a historian",   category: "Culture" },
  { slug: "thebrowser",         name: "The Browser",             description: "Five outstanding articles curated daily",           category: "Culture" },
];

const SUBSTACK_CATEGORIES = ["All", "Tech", "AI", "Startups", "Finance", "Ideas", "Culture"];

const SUBSTACK_CATEGORY_EMOJI: Record<string, string> = {
  "All":      "⭐",
  "Tech":     "💻",
  "AI":       "🤖",
  "Startups": "🚀",
  "Finance":  "📈",
  "Ideas":    "🧠",
  "Culture":  "🎭",
};

const CURATED_SUBSTACKS_INITIAL_COUNT = 6;

const CURATED_SUBSTACK_FEED_URLS = new Set(
  CURATED_SUBSTACKS.map((item) => item.feedUrl ?? `https://${item.slug}.substack.com/feed`)
);

function isSubstackFeedUrl(url: string) {
  return url.includes(".substack.com") || CURATED_SUBSTACK_FEED_URLS.has(url);
}

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

function rssFaviconDomain(feedUrl: string): string {
  try {
    let h = new URL(feedUrl).hostname;
    h = h.replace(/^(feeds?|www|rss|search|newsnetwork)\./i, "");
    if (h === "bbci.co.uk") h = "bbc.co.uk";
    return h;
  } catch {
    return "";
  }
}

function sourceIcon(src: InspirationSource) {
  if (src.type === "hacker_news") {
    return <img src="/icons/hacker-news.png" width={20} height={20} alt="Hacker News" className="rounded flex-shrink-0" />;
  }
  if (src.type === "subreddit") {
    return <img src="/icons/reddit.png" width={20} height={20} alt="Reddit" className="rounded-full flex-shrink-0" />;
  }
  if (src.type === "ticker") return <TickerLogo symbol={src.value} size={20} />;
  if (src.type === "crypto") return <span className="flex-shrink-0 text-sm font-bold">₿</span>;
  if (src.type === "rss") {
    const domain = rssFaviconDomain(src.value);
    if (domain) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} width={20} height={20} alt="" className="rounded-sm flex-shrink-0" />;
    }
    return <span className="flex-shrink-0">📡</span>;
  }
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

const DEFAULT_SECTION_ORDER = ["weather", "stocks", "crypto", "reddit", "hacker_news", "rss", "substack"];

function blocksToState(blocks: Block[]) {
  const weather = blocks.find((b) => b.type === "weather");
  const stocks = blocks.find((b) => b.type === "stocks");
  const crypto = blocks.find((b) => b.type === "crypto");
  const reddit = blocks.find((b) => b.type === "reddit");
  const rss = blocks.find((b) => b.type === "rss");
  const hackerNews = blocks.some((b) => b.type === "hacker_news");

  // Split rss_feeds into Substack vs generic by URL pattern
  const allFeeds = rss?.config.feeds ?? [];
  const substackFeeds = allFeeds.filter(isSubstackFeedUrl);
  const genericFeeds = allFeeds.filter((url) => !isSubstackFeedUrl(url));

  // Derive order from blocks (which already respect DB section_order), then append missing
  const fromBlocks = blocks.map((b) => b.type).filter((t) => DEFAULT_SECTION_ORDER.includes(t as string));
  const missing = DEFAULT_SECTION_ORDER.filter((t) => !fromBlocks.includes(t as BlockType));
  const sectionOrder = [...fromBlocks, ...missing];

  return {
    weather: !!weather,
    weatherCity: weather?.config.city ?? "",
    stocks: !!stocks,
    stockTickers: stocks?.config.tickers?.join(", ") ?? "",
    crypto: !!crypto,
    cryptoCoins: crypto?.config.coins?.join(", ") ?? "",
    subreddits: reddit?.config.subreddits ?? [],
    customSub: "",
    hackerNews,
    rss: genericFeeds.length > 0,
    feeds: genericFeeds,
    customFeed: "",
    substackFeeds,
    sectionOrder,
  };
}

type StackState = ReturnType<typeof blocksToState>;

function stateToSavePayload(state: StackState) {
  const sectionOrder = state.sectionOrder.filter((key) => {
    if (key === "weather") return state.weather;
    if (key === "stocks") return state.stocks;
    if (key === "crypto") return state.crypto;
    if (key === "reddit") return state.subreddits.length > 0;
    if (key === "hacker_news") return state.hackerNews;
    if (key === "rss") return state.feeds.length > 0;
    if (key === "substack") return state.substackFeeds.length > 0;
    return false;
  });

  return {
    location: state.weather ? state.weatherCity || null : null,
    subreddits: state.subreddits,
    stocks: state.stocks
      ? state.stockTickers.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
      : [],
    crypto: state.crypto
      ? state.cryptoCoins.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
      : [],
    rss_feeds: [...state.feeds, ...state.substackFeeds],
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
    case "crypto": {
      const coins = s.cryptoCoins.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
      return coins.includes(src.value.toUpperCase());
    }
    case "rss":
      return s.feeds.includes(src.value);
    case "weather":
      return s.weather;
  }
}

// ── Source limit badge ───────────────────────────────────────────────────────

function LimitBadge({ count, max, full }: { count: number; max: number; full: boolean }) {
  return (
    <span
      className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
        full ? "bg-waffle-orange/15 text-waffle-orange" : "bg-waffle-pale text-waffle-brown/40"
      }`}
      title={full ? `Limit reached — remove one to add another` : `${max - count} more allowed`}
    >
      {count}/{max}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient(props: Props) {
  const [stack, setStack] = useState<StackState>(() => blocksToState(props.blocks));
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [hasSaved, setHasSaved] = useState(props.emailsSent > 0);
  const lastSavedStack = useRef<StackState>(stack);
  const [subCheck, setSubCheck] = useState<"idle" | "checking" | "invalid">("idle");
  const [substackInput, setSubstackInput] = useState("");
  const [substackCheck, setSubstackCheck] = useState<"idle" | "checking" | "invalid">("idle");
  const [inspiredOpen, setInspiredOpen] = useState(false);
  const [tickerQuery, setTickerQuery] = useState("");
  const [tickerResults, setTickerResults] = useState<{ symbol: string; description: string }[]>([]);
  const [tickerSearching, setTickerSearching] = useState(false);
  const [tickerDropdownOpen, setTickerDropdownOpen] = useState(false);
  const [tickerError, setTickerError] = useState(false);
  const tickerDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickerInputRef = useRef<HTMLInputElement>(null);
  const [cityQuery, setCityQuery] = useState(() => blocksToState(props.blocks).weatherCity);
  const [cityResults, setCityResults] = useState<{ name: string; state?: string; country: string; label: string }[]>([]);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cryptoCoinInput, setCryptoCoinInput] = useState("");
  const dragKey = useRef<string | null>(null);
  const dragPosition = useRef<"before" | "after" | null>(null);
  const [dragOver, setDragOver] = useState<{ key: string; position: "before" | "after" } | null>(null);
  const [feedValidation, setFeedValidation] = useState<{
    status: "idle" | "loading" | "valid" | "invalid";
    feedUrl?: string;
    title?: string;
  }>({ status: "idle" });
  const [curatedCategory, setCuratedCategory] = useState<string>("All");
  const [showAllCuratedFeeds, setShowAllCuratedFeeds] = useState(false);
  const [substackCategory, setSubstackCategory] = useState<string>("All");
  const [showAllSubstacks, setShowAllSubstacks] = useState(false);
  const feedDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggleSub(sub: string) {
    setStack((s) => {
      if (s.subreddits.includes(sub)) {
        return { ...s, subreddits: s.subreddits.filter((r) => r !== sub) };
      }
      if (s.subreddits.length >= SOURCE_LIMITS.subreddits) return s;
      return { ...s, subreddits: [...s.subreddits, sub] };
    });
  }

  async function addCustomSub() {
    const cleaned = stack.customSub.trim().toLowerCase().replace(/^r\//, "");
    if (!cleaned || stack.subreddits.includes(cleaned)) return;
    if (stack.subreddits.length >= SOURCE_LIMITS.subreddits) return;

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

  async function addSubstack() {
    const raw = substackInput.trim();
    if (!raw) return;

    // Strip full URL to slug, accept bare slug
    const urlMatch = raw.match(/^https?:\/\/([^.]+)\.substack\.com/i);
    const slug = urlMatch ? urlMatch[1].toLowerCase() : raw.toLowerCase();
    const feedUrl = `https://${slug}.substack.com/feed`;

    if (stack.substackFeeds.includes(feedUrl)) return;
    if (stack.substackFeeds.length >= SOURCE_LIMITS.substack) return;

    setSubstackCheck("checking");
    try {
      const res = await fetch(`/api/validate-substack?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.valid) {
        setStack((s) => ({ ...s, substackFeeds: [...s.substackFeeds, data.url] }));
        setSubstackInput("");
        setSubstackCheck("idle");
      } else {
        setSubstackCheck("invalid");
      }
    } catch {
      // Fail open on network error
      setStack((s) => ({ ...s, substackFeeds: [...s.substackFeeds, feedUrl] }));
      setSubstackInput("");
      setSubstackCheck("idle");
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

  function searchCity(q: string) {
    setCityQuery(q);
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (!q.trim()) {
      setCityResults([]);
      setCityDropdownOpen(false);
      setStack((s) => ({ ...s, weatherCity: "" }));
      return;
    }
    cityDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        if (!res.ok) return;
        setCityResults(data.results ?? []);
        setCityDropdownOpen((data.results ?? []).length > 0);
      } catch {
        setCityResults([]);
      }
    }, 300);
  }

  function selectCity(result: { name: string; label: string }) {
    setStack((s) => ({ ...s, weatherCity: result.name }));
    setCityQuery(result.label);
    setCityResults([]);
    setCityDropdownOpen(false);
  }

  function addTicker(symbol: string) {
    const upper = symbol.toUpperCase();
    const existing = stack.stockTickers
      .split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (existing.includes(upper)) return;
    if (existing.length >= SOURCE_LIMITS.stocks) return;
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

  function addCoin(symbol: string) {
    const upper = symbol.toUpperCase();
    const existing = stack.cryptoCoins.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
    if (existing.includes(upper)) return;
    if (existing.length >= SOURCE_LIMITS.crypto) return;
    setStack((s) => ({
      ...s,
      crypto: true,
      cryptoCoins: [...existing, upper].join(", "),
    }));
  }

  function removeCoin(symbol: string) {
    const upper = symbol.toUpperCase();
    setStack((s) => {
      const remaining = s.cryptoCoins
        .split(",").map((c) => c.trim().toUpperCase()).filter((c) => c && c !== upper);
      return { ...s, cryptoCoins: remaining.join(", "), crypto: remaining.length > 0 };
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
        case "weather": setCityQuery(""); return { ...s, weather: false, weatherCity: "" };
        case "stocks": return { ...s, stocks: false, stockTickers: "" };
        case "crypto": return { ...s, crypto: false, cryptoCoins: "" };
        case "reddit": return { ...s, subreddits: [] };
        case "hacker_news": return { ...s, hackerNews: false };
        case "rss": return { ...s, rss: false, feeds: [] };
        case "substack": return { ...s, substackFeeds: [] };
        default: return s;
      }
    });
  }

  // Clean up debounces on unmount
  useEffect(() => () => {
    if (tickerDebounce.current) clearTimeout(tickerDebounce.current);
    if (feedDebounce.current) clearTimeout(feedDebounce.current);
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
  }, []);

  useEffect(() => {
    const dirty =
      JSON.stringify(stateToSavePayload(stack)) !==
      JSON.stringify(stateToSavePayload(lastSavedStack.current));
    setIsDirty(dirty);
  }, [stack]);

  function addValidatedFeed() {
    const url = feedValidation.feedUrl;
    if (!url || stack.feeds.includes(url)) return;
    if (stack.feeds.length >= SOURCE_LIMITS.rss) return;
    setStack((s) => ({ ...s, feeds: [...s.feeds, url], customFeed: "" }));
    setFeedValidation({ status: "idle" });
  }

  function addFeedUrl(url: string) {
    if (!url || stack.feeds.includes(url)) return;
    if (stack.feeds.length >= SOURCE_LIMITS.rss) return;
    setStack((s) => ({ ...s, feeds: [...s.feeds, url] }));
  }

  function handleFeedInputChange(value: string) {
    setStack((s) => ({ ...s, customFeed: value }));
    if (feedDebounce.current) clearTimeout(feedDebounce.current);
    if (!value.trim()) {
      setFeedValidation({ status: "idle" });
      return;
    }
    setFeedValidation({ status: "idle" });
    feedDebounce.current = setTimeout(async () => {
      const trimmed = value.trim();
      if (!trimmed.includes(".")) return;
      setFeedValidation({ status: "loading" });
      try {
        const res = await fetch(`/api/validate-feed?url=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.valid) {
          setFeedValidation({ status: "valid", feedUrl: data.feedUrl, title: data.title });
        } else {
          setFeedValidation({ status: "invalid" });
        }
      } catch {
        setFeedValidation({ status: "invalid" });
      }
    }, 400);
  }

  function addFromInspiration(src: InspirationSource) {
    setStack((s) => {
      switch (src.type) {
        case "subreddit": {
          if (s.subreddits.map((r) => r.toLowerCase()).includes(src.value.toLowerCase())) return s;
          if (s.subreddits.length >= SOURCE_LIMITS.subreddits) return s;
          return { ...s, subreddits: [...s.subreddits, src.value] };
        }
        case "hacker_news":
          return { ...s, hackerNews: true };
        case "ticker": {
          const existing = s.stockTickers
            ? s.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean)
            : [];
          if (existing.includes(src.value.toUpperCase())) return s;
          if (existing.length >= SOURCE_LIMITS.stocks) return s;
          return { ...s, stocks: true, stockTickers: [...existing, src.value.toUpperCase()].join(", ") };
        }
        case "crypto": {
          const existing = s.cryptoCoins
            ? s.cryptoCoins.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean)
            : [];
          if (existing.includes(src.value.toUpperCase())) return s;
          if (existing.length >= SOURCE_LIMITS.crypto) return s;
          return { ...s, crypto: true, cryptoCoins: [...existing, src.value.toUpperCase()].join(", ") };
        }
        case "rss":
          if (s.feeds.includes(src.value)) return s;
          if (s.feeds.length >= SOURCE_LIMITS.rss) return s;
          return { ...s, rss: true, feeds: [...s.feeds, src.value] };
        case "weather":
          return { ...s, weather: true };
      }
    });
  }

  const hasAnyBlock =
    stack.weather || stack.stocks || stack.crypto || stack.subreddits.length > 0 || stack.hackerNews || stack.feeds.length > 0 || stack.substackFeeds.length > 0;

  const tickerCount = stack.stockTickers.split(",").map((t) => t.trim()).filter(Boolean).length;
  const coinCount = stack.cryptoCoins.split(",").map((c) => c.trim()).filter(Boolean).length;
  const limits = {
    subreddits: { count: stack.subreddits.length, max: SOURCE_LIMITS.subreddits, full: stack.subreddits.length >= SOURCE_LIMITS.subreddits },
    stocks: { count: tickerCount, max: SOURCE_LIMITS.stocks, full: tickerCount >= SOURCE_LIMITS.stocks },
    crypto: { count: coinCount, max: SOURCE_LIMITS.crypto, full: coinCount >= SOURCE_LIMITS.crypto },
    rss: { count: stack.feeds.length, max: SOURCE_LIMITS.rss, full: stack.feeds.length >= SOURCE_LIMITS.rss },
    substack: { count: stack.substackFeeds.length, max: SOURCE_LIMITS.substack, full: stack.substackFeeds.length >= SOURCE_LIMITS.substack },
  };

  // Active sections in user-defined order
  const activeSectionOrder = stack.sectionOrder.filter((key) => {
    if (key === "weather") return stack.weather;
    if (key === "stocks") return stack.stocks;
    if (key === "crypto") return stack.crypto;
    if (key === "reddit") return stack.subreddits.length > 0;
    if (key === "hacker_news") return stack.hackerNews;
    if (key === "rss") return stack.rss && stack.feeds.length > 0;
    if (key === "substack") return stack.substackFeeds.length > 0;
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
      lastSavedStack.current = stack;
      setIsDirty(false);
      setHasSaved(true);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      setSaveStatus("error");
    }
  }


  const badge = subscriptionBadge(props.subscriptionStatus, props.trialEndsAt);

  const daysLeft = props.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(props.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;
  const showTrialBanner =
    props.subscriptionStatus === "trialing" && daysLeft !== null && daysLeft <= 5;

  return (
    <main className="min-h-screen bg-waffle-cream">
      {/* ── Trial expiry banner ── */}
      {showTrialBanner && (
        <div className="bg-waffle-orange text-white text-sm font-semibold text-center py-2 px-4 flex items-center justify-center gap-4">
          <span>
            {daysLeft === 0
              ? "Your free trial ends today."
              : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in your free trial.`}
          </span>
          <a
            href="/subscribe"
            className="underline underline-offset-2 hover:no-underline"
          >
            Subscribe for $5/mo →
          </a>
        </div>
      )}
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
            <button
              onClick={() => setInspiredOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-waffle-brown/50 hover:text-waffle-brown border border-waffle-brown/15 hover:border-waffle-brown/40 px-3 py-1.5 rounded-full transition-colors"
            >
              <span>✨</span> Get Inspired
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
              {activeSectionOrder.length === 0 ? "Build Your Stack." : "Edit Your Stack."}
            </h2>
            <p className="text-waffle-brown/55 text-sm">
              {activeSectionOrder.length === 0
                ? "Pick sources below, or tap ✨ Get Inspired for curated starter packs."
                : "Toggle nodes on or off. Changes are saved when you hit Save."}
            </p>
          </div>

          {activeSectionOrder.length === 0 && (
            <div className="bg-waffle-orange/8 border border-waffle-orange/20 rounded-2xl px-5 py-5 flex items-start gap-4">
              <span className="text-3xl leading-none mt-0.5">🧇</span>
              <div className="space-y-2">
                <p className="font-bold text-waffle-brown">Welcome to WaffleStack!</p>
                <p className="text-sm text-waffle-brown/65 leading-relaxed">
                  Your digest is empty. Toggle a source below to get started, or use{" "}
                  <button
                    onClick={() => setInspiredOpen(true)}
                    className="text-waffle-orange font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    ✨ Get Inspired
                  </button>{" "}
                  to add a curated set of sources in one tap.
                </p>
              </div>
            </div>
          )}

          {/* Compact sources */}
          <section className="grid sm:grid-cols-2 gap-3 items-stretch">
            <NodeCard
              active={stack.weather}
              onClick={() => setStack((s) => ({ ...s, weather: !s.weather }))}
              icon="⛅"
              label="Weather"
              compact
            >
              {stack.weather && (
                <div className="relative mt-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => searchCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setCityDropdownOpen(false);
                      if (e.key === "Enter" && cityResults.length > 0) selectCity(cityResults[0]);
                    }}
                    onFocus={() => cityResults.length > 0 && setCityDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCityDropdownOpen(false), 150)}
                    placeholder="Search city…"
                    className="w-full border-b border-waffle-brown/20 bg-transparent text-sm text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1"
                  />
                  {cityDropdownOpen && (
                    <ul className="absolute left-0 right-0 top-full z-50 bg-white border border-waffle-brown/15 rounded-xl shadow-lg overflow-hidden mt-1">
                      {cityResults.map((r) => (
                        <li key={r.label}>
                          <button
                            type="button"
                            onMouseDown={() => selectCity(r)}
                            className="w-full px-3 py-2 hover:bg-waffle-pale text-left transition-colors"
                          >
                            <span className="text-sm text-waffle-brown">{r.name}</span>
                            {(r.state || r.country) && (
                              <span className="text-xs text-waffle-brown/50 ml-1.5">
                                {[r.state, r.country].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
              compact
            >
              {stack.stocks && (
                <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                      <LimitBadge {...limits.stocks} />
                    </div>
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
                    {limits.stocks.full ? (
                      <p className="text-[11px] text-waffle-orange/80 py-1">
                        Ticker limit reached ({limits.stocks.max}). Remove one to add another.
                      </p>
                    ) : (
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
                    )}
                </div>
              )}
            </NodeCard>

            <NodeCard
              active={stack.crypto}
              onClick={() => setStack((s) => ({ ...s, crypto: !s.crypto }))}
              icon="₿"
              label="Crypto"
              compact
            >
              {stack.crypto && (
                <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                      <LimitBadge {...limits.crypto} />
                    </div>
                    {/* Coin chips */}
                    {stack.cryptoCoins.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stack.cryptoCoins.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean).map((coin) => (
                          <span
                            key={coin}
                            className="flex items-center gap-1 bg-waffle-pale rounded-lg px-2 py-0.5 text-xs font-semibold text-waffle-brown"
                          >
                            <span className="text-[10px]">₿</span>
                            {coin}
                            <button
                              type="button"
                              onClick={() => removeCoin(coin)}
                              className="ml-0.5 text-waffle-brown/40 hover:text-waffle-brown leading-none"
                              aria-label={`Remove ${coin}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Coin input */}
                    {limits.crypto.full ? (
                      <p className="text-[11px] text-waffle-orange/80 py-1">
                        Coin limit reached ({limits.crypto.max}). Remove one to add another.
                      </p>
                    ) : (<>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cryptoCoinInput}
                        onChange={(e) => setCryptoCoinInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const sym = cryptoCoinInput.trim().replace(/,$/, "");
                            if (sym) { addCoin(sym); setCryptoCoinInput(""); }
                          }
                        }}
                        placeholder="Add coin (e.g. BTC, ETH, SOL)"
                        className="flex-1 border-b border-waffle-brown/20 bg-transparent text-sm text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const sym = cryptoCoinInput.trim();
                          if (sym) { addCoin(sym); setCryptoCoinInput(""); }
                        }}
                        className="text-xs font-semibold text-waffle-orange"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-[10px] text-waffle-brown/30">Enter symbol (BTC, ETH, SOL…) and press Enter or Add</p>
                    </>)}
                </div>
              )}
            </NodeCard>

            <NodeCard
              active={stack.hackerNews}
              onClick={() => setStack((s) => ({ ...s, hackerNews: !s.hackerNews }))}
              icon={<img src="/icons/hacker-news.png" width={20} height={20} alt="Hacker News" className="rounded" />}
              label="Hacker News"
              compact
            />
          </section>

          {/* Reddit Nodes */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-waffle-brown/40 uppercase tracking-widest flex items-center gap-2">
              <img src="/icons/reddit.png" width={14} height={14} alt="Reddit" className="rounded-full" /> Reddit Nodes
              <span className="ml-auto"><LimitBadge {...limits.subreddits} /></span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_SUBS.map((sub) => (
                <NodeCard
                  key={sub}
                  active={stack.subreddits.includes(sub)}
                  onClick={() => toggleSub(sub)}
                  icon={<img src="/icons/reddit.png" width={18} height={18} alt="Reddit" className="rounded-full" />}
                  label={`r/${sub}`}
                  compact
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
                    icon={<img src="/icons/reddit.png" width={18} height={18} alt="Reddit" className="rounded-full" />}
                    label={`r/${sub}`}
                    compact
                  />
                ))}
            </div>
            <div className="space-y-1">
              {limits.subreddits.full ? (
                <p className="text-[11px] text-waffle-orange/80 px-1">
                  Subreddit limit reached ({limits.subreddits.max}). Remove one to add another.
                </p>
              ) : (
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
              )}
              {subCheck === "invalid" && (
                <p className="text-xs text-red-500 px-1">
                  r/{stack.customSub.trim().toLowerCase().replace(/^r\//, "")} doesn&apos;t exist on Reddit
                </p>
              )}
            </div>
          </section>

          {/* Full-width sources */}
          <section className="space-y-3">
            <NodeCard
                active={stack.rss}
                onClick={() => {
                  const wasOn = stack.rss;
                  setStack((s) => ({ ...s, rss: !s.rss, feeds: s.rss ? [] : s.feeds, customFeed: "" }));
                  if (wasOn) {
                    setFeedValidation({ status: "idle" });
                    setShowAllCuratedFeeds(false);
                  }
                }}
                icon={<img src="/icons/rss_icon.png" width={20} height={20} alt="RSS" />}
                label="RSS Feeds"
              >
                {stack.rss && (
                  <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>

                    <div className="flex justify-end">
                      <LimitBadge {...limits.rss} />
                    </div>

                    {/* Already-added feed chips */}
                    {stack.feeds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stack.feeds.map((feed) => {
                          const label = feedLabel(feed);
                          const domain = (() => { try { return new URL(feed).hostname.replace(/^www\./, ""); } catch { return feed; } })();
                          return (
                            <span
                              key={feed}
                              className="flex items-center gap-1.5 bg-waffle-pale rounded-lg px-2 py-1 text-xs text-waffle-brown/70 max-w-[160px]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                                width={12}
                                height={12}
                                alt=""
                                className="flex-shrink-0 rounded-sm"
                              />
                              <span className="truncate">{label}</span>
                              <button
                                onClick={() => setStack((s) => ({ ...s, feeds: s.feeds.filter((f) => f !== feed) }))}
                                className="text-waffle-brown/30 hover:text-red-500 transition-colors flex-shrink-0 leading-none"
                                aria-label={`Remove ${label}`}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* URL input with validation */}
                    {limits.rss.full ? (
                      <p className="text-[11px] text-waffle-orange/80 px-1">
                        Feed limit reached ({limits.rss.max}). Remove one to add another.
                      </p>
                    ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={stack.customFeed}
                            onChange={(e) => handleFeedInputChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && feedValidation.status === "valid" && addValidatedFeed()}
                            placeholder="Paste a feed or website URL…"
                            className="w-full border border-waffle-brown/15 rounded-xl px-3 py-2 text-xs text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange bg-white pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {feedValidation.status === "loading" && (
                              <svg className="animate-spin w-3.5 h-3.5 text-waffle-brown/40" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                            )}
                            {feedValidation.status === "valid" && <span className="text-green-500 text-xs font-bold">✓</span>}
                            {feedValidation.status === "invalid" && <span className="text-red-400 text-xs font-bold">✕</span>}
                          </span>
                        </div>
                        {feedValidation.status === "valid" && (
                          <button
                            onClick={addValidatedFeed}
                            className="px-3 py-2 bg-waffle-orange text-white text-xs font-semibold rounded-xl hover:bg-waffle-orange/90 transition-colors flex-shrink-0"
                          >
                            Add
                          </button>
                        )}
                      </div>
                      {feedValidation.status === "valid" && (
                        <p className="text-[11px] text-green-600 px-1 truncate">
                          Feed found{feedValidation.title ? `: ${feedValidation.title}` : ""}
                        </p>
                      )}
                      {feedValidation.status === "invalid" && (
                        <p className="text-[11px] text-red-500 px-1">No RSS feed found at this URL</p>
                      )}
                    </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-waffle-brown/10" />

                    {/* Popular feeds */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-waffle-brown/35 uppercase tracking-widest">Popular feeds</p>

                      {/* Category tabs */}
                      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                        {CURATED_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setCuratedCategory(cat); setShowAllCuratedFeeds(false); }}
                            className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              curatedCategory === cat
                                ? "bg-waffle-orange text-white"
                                : "bg-waffle-pale text-waffle-brown/55 hover:bg-waffle-golden/30"
                            }`}
                          >
                            <span>{CATEGORY_EMOJI[cat]}</span>
                            <span>{cat}</span>
                          </button>
                        ))}
                      </div>

                      {/* Feed grid */}
                      {(() => {
                        const filtered = CURATED_FEEDS.filter(
                          (f) => curatedCategory === "All" || f.category === curatedCategory
                        );
                        const visible = showAllCuratedFeeds
                          ? filtered
                          : filtered.slice(0, CURATED_FEEDS_INITIAL_COUNT);
                        return (
                          <>
                            <div className="grid grid-cols-3 gap-1.5">
                              {visible.map((feed) => {
                                const alreadyAdded = stack.feeds.includes(feed.url);
                                return (
                                  <button
                                    key={feed.url}
                                    onClick={() => {
                                      if (alreadyAdded) {
                                        setStack((s) => ({ ...s, feeds: s.feeds.filter((f) => f !== feed.url) }));
                                      } else {
                                        addFeedUrl(feed.url);
                                      }
                                    }}
                                    className={`flex flex-col gap-1.5 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                                      alreadyAdded
                                        ? "border-waffle-orange/40 bg-waffle-orange/5 hover:border-waffle-orange/60 hover:bg-waffle-orange/10"
                                        : "border-waffle-brown/10 bg-white hover:border-waffle-orange/30 hover:bg-waffle-pale"
                                    }`}
                                    aria-label={alreadyAdded ? `Remove ${feed.name}` : `Add ${feed.name}`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={`https://www.google.com/s2/favicons?domain=${feed.domain}&sz=32`}
                                        width={16}
                                        height={16}
                                        alt=""
                                        className="rounded-sm flex-shrink-0"
                                      />
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                                          alreadyAdded
                                            ? "bg-waffle-orange/15 text-waffle-orange"
                                            : "bg-waffle-brown/8 text-waffle-brown/40 group-hover:bg-waffle-orange group-hover:text-white"
                                        }`}
                                      >
                                        {alreadyAdded ? "✓" : "+"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-waffle-brown leading-tight truncate">{feed.name}</p>
                                    <p className="text-[10px] text-waffle-brown/45 leading-tight line-clamp-2">{feed.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                            {filtered.length > CURATED_FEEDS_INITIAL_COUNT && (
                              <button
                                onClick={() => setShowAllCuratedFeeds((v) => !v)}
                                className="w-full text-[11px] font-semibold text-waffle-brown/45 hover:text-waffle-orange transition-colors py-1.5 rounded-lg hover:bg-waffle-pale"
                              >
                                {showAllCuratedFeeds ? "Show less" : `Show all ${filtered.length} feeds`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>

                  </div>
                )}
            </NodeCard>

              <NodeCard
                active={stack.substackFeeds.length > 0}
                onClick={() => {
                  if (stack.substackFeeds.length > 0) {
                    setStack((s) => ({ ...s, substackFeeds: [] }));
                  }
                }}
                icon={<img src="/icons/substack.png" width={20} height={20} alt="Substack" />}
                label="Substack"
              >
                <div className="mt-2 space-y-3" onClick={(e) => e.stopPropagation()}>

                  <div className="flex justify-end">
                    <LimitBadge {...limits.substack} />
                  </div>

                  {/* Popular newsletters */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-waffle-brown/35 uppercase tracking-widest">Popular newsletters</p>

                    {/* Category tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                      {SUBSTACK_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setSubstackCategory(cat); setShowAllSubstacks(false); }}
                          className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            substackCategory === cat
                              ? "bg-waffle-orange text-white"
                              : "bg-waffle-pale text-waffle-brown/55 hover:bg-waffle-golden/30"
                          }`}
                        >
                          <span>{SUBSTACK_CATEGORY_EMOJI[cat]}</span>
                          <span>{cat}</span>
                        </button>
                      ))}
                    </div>

                    {/* Newsletter grid */}
                    {(() => {
                      const filtered = CURATED_SUBSTACKS.filter(
                        (s) => substackCategory === "All" || s.category === substackCategory
                      );
                      const visible = showAllSubstacks
                        ? filtered
                        : filtered.slice(0, CURATED_SUBSTACKS_INITIAL_COUNT);
                      const defaultFeedUrl = (slug: string) => `https://${slug}.substack.com/feed`;
                      return (
                        <>
                          <div className="grid grid-cols-3 gap-1.5">
                            {visible.map((item) => {
                              const url = item.feedUrl ?? defaultFeedUrl(item.slug);
                              const alreadyAdded = stack.substackFeeds.includes(url);
                              return (
                                <button
                                  key={item.slug}
                                  onClick={() => {
                                    if (alreadyAdded) {
                                      setStack((s) => ({ ...s, substackFeeds: s.substackFeeds.filter((f) => f !== url) }));
                                    } else {
                                      setStack((s) =>
                                        s.substackFeeds.length >= SOURCE_LIMITS.substack
                                          ? s
                                          : { ...s, substackFeeds: [...s.substackFeeds, url] }
                                      );
                                    }
                                  }}
                                  className={`flex flex-col gap-1.5 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                                    alreadyAdded
                                      ? "border-waffle-orange/40 bg-waffle-orange/5 hover:border-waffle-orange/60 hover:bg-waffle-orange/10"
                                      : "border-waffle-brown/10 bg-white hover:border-waffle-orange/30 hover:bg-waffle-pale"
                                  }`}
                                  aria-label={alreadyAdded ? `Remove ${item.name}` : `Add ${item.name}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={`https://www.google.com/s2/favicons?domain=${item.faviconDomain ?? `${item.slug}.substack.com`}&sz=32`}
                                      width={16}
                                      height={16}
                                      alt=""
                                      className="rounded-sm flex-shrink-0"
                                    />
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                                        alreadyAdded
                                          ? "bg-waffle-orange/15 text-waffle-orange"
                                          : "bg-waffle-brown/8 text-waffle-brown/40"
                                      }`}
                                    >
                                      {alreadyAdded ? "✓" : "+"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-bold text-waffle-brown leading-tight truncate">{item.name}</p>
                                  <p className="text-[10px] text-waffle-brown/45 leading-tight line-clamp-2">{item.description}</p>
                                </button>
                              );
                            })}
                          </div>
                          {filtered.length > CURATED_SUBSTACKS_INITIAL_COUNT && (
                            <button
                              onClick={() => setShowAllSubstacks((v) => !v)}
                              className="w-full text-[11px] font-semibold text-waffle-brown/45 hover:text-waffle-orange transition-colors py-1.5 rounded-lg hover:bg-waffle-pale"
                            >
                              {showAllSubstacks ? "Show less" : `Show all ${filtered.length} newsletters`}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Manual entry */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-waffle-brown/35 uppercase tracking-widest">Add your own</p>
                    {stack.substackFeeds.map((url) => {
                      const slug = url.match(/https?:\/\/([^.]+)\.substack\.com/)?.[1] ?? url;
                      // Only show custom ones (not in the curated list)
                      const isCurated = CURATED_SUBSTACKS.some(
                        (s) => s.feedUrl === url || s.slug === slug
                      );
                      if (isCurated) return null;
                      return (
                        <div
                          key={url}
                          className="flex items-center justify-between gap-1 text-xs text-waffle-brown/60 bg-waffle-pale rounded-lg px-2 py-1.5"
                        >
                          <span className="truncate font-medium">{slug}</span>
                          <button
                            onClick={() => setStack((s) => ({ ...s, substackFeeds: s.substackFeeds.filter((f) => f !== url) }))}
                            className="text-waffle-brown/30 hover:text-red-500 transition-colors flex-shrink-0 leading-none"
                            aria-label={`Remove ${slug}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {limits.substack.full ? (
                      <p className="text-[11px] text-waffle-orange/80 px-0.5">
                        Newsletter limit reached ({limits.substack.max}). Remove one to add another.
                      </p>
                    ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={substackInput}
                        onChange={(e) => {
                          setSubstackInput(e.target.value);
                          if (substackCheck === "invalid") setSubstackCheck("idle");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && addSubstack()}
                        disabled={substackCheck === "checking"}
                        placeholder="e.g. paulgraham"
                        className="flex-1 border-b border-waffle-brown/20 bg-transparent text-xs text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:border-waffle-orange py-1 disabled:opacity-50"
                      />
                      <button
                        onClick={addSubstack}
                        disabled={substackCheck === "checking"}
                        className="text-xs font-semibold text-waffle-orange disabled:opacity-50"
                      >
                        {substackCheck === "checking" ? "Checking…" : "Add"}
                      </button>
                    </div>
                    )}
                    {substackCheck === "invalid" && (
                      <p className="text-xs text-red-500 px-0.5">
                        No Substack found at {substackInput.trim().toLowerCase().replace(/^https?:\/\//, "").split(".")[0]}.substack.com
                      </p>
                    )}
                  </div>

                </div>
              </NodeCard>
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
                  const sectionMeta: Record<string, { icon: React.ReactNode; label: string }> = {
                    weather: { icon: "⛅", label: `Weather${stack.weatherCity ? ` — ${stack.weatherCity}` : ""}` },
                    stocks: { icon: "📈", label: "Stocks" },
                    crypto: { icon: "₿", label: "Crypto" },
                    reddit: { icon: <img src="/icons/reddit.png" width={16} height={16} alt="Reddit" className="rounded-full" />, label: "Reddit" },
                    hacker_news: { icon: <img src="/icons/hacker-news.png" width={16} height={16} alt="Hacker News" className="rounded" />, label: "Hacker News" },
                    rss: { icon: <img src="/icons/rss_icon.png" width={16} height={16} alt="RSS" />, label: "RSS Feeds" },
                    substack: { icon: <img src="/icons/substack.png" width={16} height={16} alt="Substack" />, label: "Substack" },
                  };
                  const meta = sectionMeta[key];

                  const subItems: { key: string; label: string; onRemove: () => void }[] = [];
                  if (key === "stocks") {
                    stack.stockTickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).forEach((ticker) => {
                      subItems.push({ key: ticker, label: ticker, onRemove: () => removeTicker(ticker) });
                    });
                  }
                  if (key === "crypto") {
                    stack.cryptoCoins.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean).forEach((coin) => {
                      subItems.push({ key: coin, label: coin, onRemove: () => removeCoin(coin) });
                    });
                  }
                  if (key === "reddit") {
                    stack.subreddits.forEach((sub) => {
                      subItems.push({ key: sub, label: `r/${sub}`, onRemove: () => toggleSub(sub) });
                    });
                  }
                  if (key === "rss") {
                    stack.feeds.forEach((feed) => {
                      subItems.push({
                        key: feed,
                        label: feedLabel(feed),
                        onRemove: () => setStack((s) => ({ ...s, feeds: s.feeds.filter((f) => f !== feed) })),
                      });
                    });
                  }
                  if (key === "substack") {
                    stack.substackFeeds.forEach((url) => {
                      const slug = url.match(/https?:\/\/([^.]+)\.substack\.com/)?.[1] ?? url;
                      subItems.push({
                        key: url,
                        label: slug,
                        onRemove: () => setStack((s) => ({ ...s, substackFeeds: s.substackFeeds.filter((f) => f !== url) })),
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
                        <span className="leading-none flex-shrink-0 flex items-center">{meta.icon}</span>
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
              className={`w-full bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm ${isDirty ? "ring-2 ring-waffle-orange ring-offset-2" : ""}`}
            >
              {saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : isDirty ? "Save Changes →" : "Save Stack"}
            </button>
            {saveStatus === "error" && (
              <p className="text-xs text-red-600 text-center">Failed to save. Try again.</p>
            )}

            {hasSaved && props.emailsSent === 0 ? (
              <p className="text-xs text-green-600 font-semibold text-center">
                ✓ Your first digest arrives tomorrow morning
              </p>
            ) : (
              <p className="text-xs text-waffle-brown/30 text-center">
                Your digest is delivered each morning
              </p>
            )}
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
            className={`w-full bg-waffle-orange hover:bg-waffle-orange/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors ${isDirty ? "ring-2 ring-waffle-orange ring-offset-2" : ""}`}
          >
            {saveStatus === "loading" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : isDirty ? "Save Changes →" : "Save Stack"}
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
  compact,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`h-full rounded-2xl border-2 cursor-pointer transition-all select-none ${
        compact ? "p-3" : "p-4"
      } ${
        active
          ? "border-waffle-orange bg-waffle-orange/5"
          : "border-waffle-brown/10 bg-white hover:border-waffle-orange/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`leading-none flex-shrink-0 flex items-center ${!compact ? "text-xl" : ""}`}>{icon}</span>
        <p className="flex-1 font-bold text-waffle-brown text-sm truncate">{label}</p>
        {active && (
          <span className="w-5 h-5 rounded-full bg-waffle-orange flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            ✓
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
