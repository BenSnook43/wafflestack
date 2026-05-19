import Link from "next/link";

const STEPS = [
  {
    step: "01",
    label: "Enter your email",
    description:
      "No account setup, no credit card. Just drop in your email and you're in the door in seconds.",
  },
  {
    step: "02",
    label: "Curate your feed",
    description:
      "Toggle on the sources that matter to you — subreddits, stock tickers, weather, Hacker News, RSS feeds. Your stack, your rules.",
  },
  {
    step: "03",
    label: "Save and wait for the mail",
    description:
      "Hit save. Every morning at 7 AM, your personalised digest lands in your inbox — written by AI, tailored to you.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-waffle-cream">

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center space-y-4">
        <span className="inline-block bg-waffle-golden/25 text-waffle-brown text-sm font-semibold px-4 py-1.5 rounded-full">
          Three simple steps
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold italic text-waffle-brown leading-tight">
          From signup to inbox<br />in under a minute.
        </h1>
        <p className="text-waffle-brown/55 text-base leading-relaxed max-w-xl mx-auto">
          No complicated setup. No noise. Just pick your sources, save your stack,
          and let us do the rest every morning.
        </p>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20 space-y-24">

        {/* Step 1 — Enter email */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-5xl font-extrabold text-waffle-brown/10">01</span>
            <h2 className="text-2xl font-extrabold text-waffle-brown -mt-2">{STEPS[0].label}</h2>
            <p className="text-waffle-brown/55 leading-relaxed">{STEPS[0].description}</p>
            <Link
              href="/onboard"
              className="inline-block bg-waffle-brown hover:bg-waffle-espresso text-waffle-cream font-semibold px-6 py-3 rounded-full transition-colors text-sm"
            >
              Get started free →
            </Link>
          </div>

          {/* Mock email signup */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-waffle-brown/5 p-8 space-y-5">
              <div className="text-center space-y-1">
                <span className="text-3xl">🧇</span>
                <p className="font-extrabold text-waffle-brown text-lg">WaffleStack</p>
                <p className="text-xs text-waffle-brown/40">Your morning digest, built around you.</p>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-waffle-brown/50 uppercase tracking-wider">Email address</label>
                <div className="border-2 border-waffle-orange/50 rounded-xl px-4 py-3 bg-waffle-orange/5 flex items-center gap-2">
                  <span className="text-sm text-waffle-brown font-medium">you@example.com</span>
                  <span className="ml-auto w-2 h-4 bg-waffle-orange animate-pulse rounded-sm" />
                </div>
                <div className="w-full bg-waffle-orange rounded-xl py-3 text-center text-white font-bold text-sm">
                  Build My Stack →
                </div>
              </div>
              <p className="text-[11px] text-waffle-brown/30 text-center">No password. No credit card. Free to start.</p>
            </div>
          </div>
        </div>

        {/* Step 2 — Curate your feed */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mock dashboard — shown first on mobile, second on desktop */}
          <div className="order-2 md:order-1 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-waffle-brown/5 overflow-hidden">
              {/* Mini dashboard header */}
              <div className="bg-waffle-cream border-b border-waffle-brown/8 px-5 py-3.5">
                <p className="font-extrabold text-waffle-brown text-sm">Edit Your Stack.</p>
                <p className="text-[11px] text-waffle-brown/40">Toggle nodes on or off.</p>
              </div>
              <div className="p-4 space-y-3">
                {/* Section label */}
                <p className="text-[10px] font-bold text-waffle-brown/35 uppercase tracking-widest">📡 Live Vitals</p>
                <div className="grid grid-cols-2 gap-2">
                  <MockNode active icon="⛅" label="Weather" />
                  <MockNode active={false} icon="📈" label="Stock Ticker" />
                </div>
                <p className="text-[10px] font-bold text-waffle-brown/35 uppercase tracking-widest pt-1">↑ Reddit Nodes</p>
                <div className="grid grid-cols-2 gap-2">
                  <MockNode active icon={<span className="font-black text-orange-500 text-base">↑</span>} label="r/technology" />
                  <MockNode active icon={<span className="font-black text-orange-500 text-base">↑</span>} label="r/investing" />
                  <MockNode active={false} icon={<span className="font-black text-orange-500 text-base">↑</span>} label="r/science" />
                  <MockNode active={false} icon={<span className="font-black text-orange-500 text-base">↑</span>} label="r/design" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-4">
            <span className="text-5xl font-extrabold text-waffle-brown/10">02</span>
            <h2 className="text-2xl font-extrabold text-waffle-brown -mt-2">{STEPS[1].label}</h2>
            <p className="text-waffle-brown/55 leading-relaxed">{STEPS[1].description}</p>
            <ul className="space-y-2 text-sm text-waffle-brown/55">
              <li className="flex items-center gap-2"><span className="text-waffle-orange font-bold">✓</span> Subreddits — any community on Reddit</li>
              <li className="flex items-center gap-2"><span className="text-waffle-orange font-bold">✓</span> Stock tickers — live market data</li>
              <li className="flex items-center gap-2"><span className="text-waffle-orange font-bold">✓</span> Weather for your city</li>
              <li className="flex items-center gap-2"><span className="text-waffle-orange font-bold">✓</span> Hacker News top stories</li>
              <li className="flex items-center gap-2"><span className="text-waffle-orange font-bold">✓</span> RSS feeds from any publication</li>
            </ul>
          </div>
        </div>

        {/* Step 3 — Inbox */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-5xl font-extrabold text-waffle-brown/10">03</span>
            <h2 className="text-2xl font-extrabold text-waffle-brown -mt-2">{STEPS[2].label}</h2>
            <p className="text-waffle-brown/55 leading-relaxed">{STEPS[2].description}</p>
            <p className="text-sm text-waffle-brown/40 italic">
              Delivered every morning. Change your stack any time.
            </p>
          </div>

          {/* Mock email */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-waffle-brown/5 overflow-hidden">
              <div className="bg-waffle-cream px-5 py-3 border-b border-waffle-brown/8 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white border border-waffle-golden/30 flex items-center justify-center text-xl flex-shrink-0">
                  🧇
                </div>
                <div>
                  <p className="text-sm font-bold text-waffle-brown">WaffleStack</p>
                  <p className="text-[11px] text-waffle-brown/40">Your morning digest — today</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm font-semibold text-waffle-brown">Good morning! ☀️</p>
                <p className="text-[12px] text-waffle-brown/60 leading-relaxed">
                  Sunny and 18°C in <span className="font-semibold text-waffle-brown">London</span> today. Grab a coffee — here&apos;s your stack.
                </p>
                <div className="bg-waffle-cream/70 rounded-xl px-4 py-2.5 border border-waffle-golden/20">
                  <p className="text-[10px] font-bold text-waffle-orange uppercase tracking-wide mb-1">r/technology</p>
                  <p className="text-[12px] text-waffle-brown/65 leading-relaxed">
                    The top story this morning: a new open-source LLM just topped every benchmark...
                  </p>
                </div>
                <div className="bg-waffle-cream/70 rounded-xl px-4 py-2.5 border border-waffle-golden/20">
                  <p className="text-[10px] font-bold text-waffle-orange uppercase tracking-wide mb-1">Hacker News</p>
                  <p className="text-[12px] text-waffle-brown/65 leading-relaxed">
                    "Ask HN: What&apos;s the best way to learn systems programming in 2026?" — 400 comments...
                  </p>
                </div>
                <p className="text-[11px] text-waffle-brown/25 text-center pt-1">— Your personalised digest —</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── CTA ── */}
      <section className="bg-waffle-brown py-20">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-waffle-cream leading-snug">
            Ready to build your stack?
          </h2>
          <p className="text-waffle-cream/50">Takes less than a minute. Your first digest arrives tomorrow morning.</p>
          <Link
            href="/onboard"
            className="inline-block bg-waffle-orange hover:bg-waffle-orange/90 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
          >
            Get Started Free →
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

function MockNode({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className={`rounded-xl border-2 px-3 py-2.5 flex items-center gap-2 ${
        active
          ? "border-waffle-orange bg-waffle-orange/5"
          : "border-waffle-brown/10 bg-waffle-pale/50"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-xs font-bold text-waffle-brown truncate">{label}</span>
      {active && (
        <span className="ml-auto w-4 h-4 rounded-full bg-waffle-orange flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
          ✓
        </span>
      )}
    </div>
  );
}
