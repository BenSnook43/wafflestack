import Link from "next/link";

const INTEREST_PACKS = [
  {
    label: "Tech",
    emoji: "💻",
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/technology" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/programming" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/MachineLearning" },
      { icon: <span className="font-extrabold bg-orange-600 text-white w-5 h-5 flex items-center justify-center rounded text-[10px]">Y</span>, name: "Hacker News" },
      { icon: "📡", name: "Ars Technica RSS" },
      { icon: "📡", name: "The Verge RSS" },
    ],
    description: "Daily coverage of software, AI breakthroughs, open source, and engineering culture.",
  },
  {
    label: "Investing",
    emoji: "📈",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700",
    sources: [
      { icon: "📈", name: "Stock Tickers (AAPL, TSLA…)" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/investing" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/stocks" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/wallstreetbets" },
      { icon: "📡", name: "MarketWatch RSS" },
      { icon: "📡", name: "Investopedia RSS" },
    ],
    description: "Live market data, earnings recaps, and community takes on the stocks you follow.",
  },
  {
    label: "World News",
    emoji: "🌍",
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/worldnews" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/geopolitics" },
      { icon: "📡", name: "BBC News RSS" },
      { icon: "📡", name: "Reuters RSS" },
      { icon: "📡", name: "The Guardian RSS" },
      { icon: "📡", name: "Al Jazeera RSS" },
    ],
    description: "What happened overnight, without the doomscroll. Concise, sourced, and free of noise.",
  },
  {
    label: "Design",
    emoji: "🎨",
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/design" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/UXDesign" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/graphic_design" },
      { icon: "📡", name: "Smashing Magazine RSS" },
      { icon: "📡", name: "A List Apart RSS" },
      { icon: "📡", name: "CSS-Tricks RSS" },
    ],
    description: "Inspiration, critique, and tools — from product design to visual craft.",
  },
  {
    label: "Science",
    emoji: "🔬",
    color: "bg-teal-50 border-teal-200",
    badgeColor: "bg-teal-100 text-teal-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/science" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/space" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/biology" },
      { icon: "📡", name: "New Scientist RSS" },
      { icon: "📡", name: "ScienceDaily RSS" },
      { icon: "📡", name: "Phys.org RSS" },
    ],
    description: "Peer-reviewed discoveries, space updates, and the breakthroughs you'd actually tell a friend.",
  },
  {
    label: "Crypto",
    emoji: "₿",
    color: "bg-yellow-50 border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/CryptoCurrency" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/Bitcoin" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/ethereum" },
      { icon: "📡", name: "CoinDesk RSS" },
      { icon: "📡", name: "Cointelegraph RSS" },
    ],
    description: "Token moves, protocol updates, and the takes worth reading before the market opens.",
  },
  {
    label: "Health & Fitness",
    emoji: "🏃",
    color: "bg-rose-50 border-rose-200",
    badgeColor: "bg-rose-100 text-rose-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/fitness" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/nutrition" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/running" },
      { icon: "📡", name: "Examine.com RSS" },
      { icon: "📡", name: "Healthline RSS" },
      { icon: "📡", name: "NHS News RSS" },
    ],
    description: "Evidence-based health news, training tips, and the science of feeling good.",
  },
  {
    label: "Gaming",
    emoji: "🎮",
    color: "bg-indigo-50 border-indigo-200",
    badgeColor: "bg-indigo-100 text-indigo-700",
    sources: [
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/gaming" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/gamedev" },
      { icon: <span className="font-black text-orange-500">↑</span>, name: "r/pcgaming" },
      { icon: "📡", name: "Rock Paper Shotgun RSS" },
      { icon: "📡", name: "Eurogamer RSS" },
      { icon: "📡", name: "PC Gamer RSS" },
    ],
    description: "New releases, industry news, and dev diaries — for the people who actually finish games.",
  },
];

const SOURCE_TYPES = [
  { icon: <img src="/icons/reddit.png" alt="Reddit" className="w-7 h-7 object-contain" />, name: "Reddit", description: "Any subreddit, from niche to mainstream" },
  { icon: "📈", name: "Stock Tickers", description: "Live price data and daily moves" },
  { icon: "⛅", name: "Weather", description: "Morning forecast for your city" },
  { icon: <span className="font-extrabold bg-orange-600 text-white w-7 h-7 flex items-center justify-center rounded text-xs">Y</span>, name: "Hacker News", description: "Top stories from the tech community" },
  { icon: "📡", name: "RSS Feeds", description: "Any publication with a feed" },
];

export default function InterestsPage() {
  return (
    <main className="bg-waffle-cream">

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center space-y-4">
        <span className="inline-block bg-waffle-golden/25 text-waffle-brown text-sm font-semibold px-4 py-1.5 rounded-full">
          Build around what you love
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold italic text-waffle-brown leading-tight">
          Your morning, your flavor.
        </h1>
        <p className="text-waffle-brown/55 text-base leading-relaxed max-w-xl mx-auto">
          Mix and match sources from the topics that matter to you. Every digest is
          different because every person is different.
        </p>
      </section>

      {/* ── Source types ── */}
      <section className="bg-waffle-pale py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-xl font-extrabold text-waffle-brown mb-8">Where we pull from</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SOURCE_TYPES.map((src) => (
              <div key={src.name} className="bg-white rounded-2xl p-5 text-center space-y-2 shadow-sm border border-waffle-brown/5">
                <div className="flex justify-center items-center h-8">{typeof src.icon === "string" ? <span className="text-2xl">{src.icon}</span> : src.icon}</div>
                <p className="font-bold text-waffle-brown text-sm">{src.name}</p>
                <p className="text-[11px] text-waffle-brown/45 leading-snug">{src.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interest packs ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-extrabold text-waffle-brown">Example stacks by interest</h2>
          <p className="text-waffle-brown/50 text-sm">
            These are starting points — you can add, remove, or mix anything in the dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {INTEREST_PACKS.map((pack) => (
            <div
              key={pack.label}
              className={`rounded-2xl border p-6 space-y-4 ${pack.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pack.emoji}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${pack.badgeColor}`}>
                  {pack.label}
                </span>
              </div>
              <p className="text-sm text-waffle-brown/65 leading-relaxed">{pack.description}</p>
              <ul className="space-y-1.5">
                {pack.sources.map((src, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-waffle-brown/70">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      {typeof src.icon === "string" ? src.icon : src.icon}
                    </span>
                    <span className="font-medium">{src.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Customise callout ── */}
      <section className="bg-waffle-pale py-14">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-5">
          <h2 className="text-2xl font-extrabold text-waffle-brown">Don&apos;t see your interest?</h2>
          <p className="text-waffle-brown/55 leading-relaxed">
            If it has a subreddit or an RSS feed, you can add it. WaffleStack works with anything — niche
            cooking communities, indie music blogs, local news, academic journals.
          </p>
          <Link
            href="/onboard"
            className="inline-block bg-waffle-orange hover:bg-waffle-orange/90 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
          >
            Build Your Own Stack →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-waffle-espresso py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-extrabold text-waffle-cream text-lg">WaffleStack</Link>
          <div className="flex gap-6 text-sm text-waffle-cream/40">
            <a href="#" className="hover:text-waffle-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-waffle-cream transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-waffle-cream transition-colors">Contact Us</a>
          </div>
          <span className="text-xs text-waffle-cream/25">© 2025 WaffleStack. All rights reserved.</span>
        </div>
      </footer>

    </main>
  );
}
