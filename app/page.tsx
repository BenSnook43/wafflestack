import Link from "next/link";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Choose your sources",
    body: "Pick from Reddit, Hacker News, RSS feeds, stock tickers, weather, and more. Only follow what matters to you.",
  },
  {
    step: "2",
    title: "We summarise overnight",
    body: "Each morning, AI reads through your sources and writes a concise, human-sounding briefing — no walls of links.",
  },
  {
    step: "3",
    title: "Check your inbox at 7 AM",
    body: "One email, every morning. Everything you care about, nothing you don't. Ready before your first coffee.",
  },
];

const INTERESTS = ["Tech", "World News", "Finance", "Science", "Design", "Health", "Crypto", "Gaming"];

export default function Home() {
  return (
    <main className="bg-waffle-cream">

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-7">
          <span className="inline-block bg-waffle-golden/25 text-waffle-brown text-sm font-semibold px-4 py-1.5 rounded-full">
            Freshly Prepared Every Morning
          </span>
          <h1 className="text-5xl md:text-[3.75rem] font-extrabold italic text-waffle-brown leading-[1.08] tracking-tight">
            A Morning Digest,<br />
            Prepared Just <br />
            For You.
            
          </h1>
          <p className="text-lg text-waffle-brown/60 max-w-md leading-relaxed not-italic">
            Build a morning newsletter suited to your taste. Select the sources and
            topics you want to stay current on, and we&apos;ll deliver it to your inbox
            each morning.
          </p>
          <div className="flex flex-wrap gap-3 not-italic">
            <Link
              href="/onboard"
              className="bg-waffle-brown hover:bg-waffle-espresso text-waffle-cream font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              Get Started
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center gap-2 border-2 border-waffle-brown/20 hover:border-waffle-brown/50 text-waffle-brown font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Mock email preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-waffle-brown/5">
            {/* Email header */}
            <div className="bg-waffle-cream px-5 py-3 border-b border-waffle-brown/8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-waffle-golden/30 flex items-center justify-center text-2xl flex-shrink-0">
                🧇
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-waffle-brown leading-tight">WaffleStack</p>
                <p className="text-[11px] text-waffle-brown/40 truncate">Your morning digest — Apr 3, 2026</p>
              </div>
            </div>
            {/* Email body */}
            <div className="px-5 py-4 space-y-3.5">
              <p className="text-sm text-waffle-brown font-semibold">Good morning, Sarah! ☀️</p>
              <p className="text-[13px] text-waffle-brown/65 leading-relaxed">
                Beautiful day ahead in <span className="font-semibold text-waffle-brown">San Francisco</span> — 68°F and sunny.
                Perfect coffee-on-the-patio weather.
              </p>
              <div className="bg-waffle-cream/60 rounded-xl px-4 py-3 border border-waffle-golden/20">
                <p className="text-[11px] font-bold text-waffle-orange uppercase tracking-wide mb-1">AI &amp; Tech</p>
                <p className="text-[13px] text-waffle-brown/70 leading-relaxed">
                  Big updates in the world of AI last night — OpenAI just shipped a new reasoning model,
                  and Google DeepMind published a breakthrough in protein folding...
                </p>
              </div>
              <div className="bg-waffle-cream/60 rounded-xl px-4 py-3 border border-waffle-golden/20">
                <p className="text-[11px] font-bold text-waffle-orange uppercase tracking-wide mb-1">Markets</p>
                <p className="text-[13px] text-waffle-brown/70 leading-relaxed">
                  <span className="font-semibold">AAPL</span> up 2.3% after earnings beat.{" "}
                  <span className="font-semibold">TSLA</span> holding steady. S&amp;P closed at all-time highs...
                </p>
              </div>
              <div className="bg-waffle-cream/60 rounded-xl px-4 py-3 border border-waffle-golden/20">
                <p className="text-[11px] font-bold text-waffle-orange uppercase tracking-wide mb-1">r/technology</p>
                <p className="text-[13px] text-waffle-brown/70 leading-relaxed">
                  The EU just passed sweeping right-to-repair legislation — manufacturers must provide
                  spare parts for 10 years. Meanwhile, a solo dev&apos;s open-source project hit #1 on GitHub...
                </p>
              </div>
              <p className="text-[11px] text-waffle-brown/30 text-center pt-1">
                — Your personalised digest, every morning —
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-waffle-pale py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl font-extrabold text-waffle-brown">How we make your morning.</h2>
            <p className="text-waffle-brown/50 text-base">A simple recipe for staying informed without the noise.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="bg-white rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-waffle-orange/10 flex items-center justify-center text-sm font-extrabold text-waffle-orange">
                  {step.step}
                </div>
                <h3 className="font-bold text-waffle-brown text-lg">{step.title}</h3>
                <p className="text-waffle-brown/55 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Your flavor ── */}
      <section id="interests" className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-5">
          <h2 className="text-3xl font-extrabold text-waffle-brown">Your morning, your flavor.</h2>
          <p className="text-waffle-brown/60 leading-relaxed">
            Choose from micro-interests and live data feeds. Whether you&apos;re into coding, regional cuisine,
            or market trends — we build a digest that matches your specific palette.
          </p>
          <ul className="space-y-2 text-sm text-waffle-brown/60 font-medium">
            <li>● Personalised ranking algorithms</li>
            <li>● Deep-dive weekend editions</li>
            <li>● One-click interest swapping</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          {INTERESTS.map((interest) => (
            <span
              key={interest}
              className="bg-waffle-pale border border-waffle-golden/40 text-waffle-brown font-semibold px-5 py-2.5 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-waffle-brown py-20">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-waffle-cream leading-snug">
            The best part of waking up<br />is in your inbox.
          </h2>
          <p className="text-waffle-cream/50">Join readers who start their day with a fresh stack of insights.</p>
          <Link
            href="/onboard"
            className="inline-block bg-waffle-orange hover:bg-waffle-orange/90 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
          >
            Start Building Now →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-waffle-espresso py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-waffle-cream text-lg">WaffleStack</span>
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
