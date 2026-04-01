import Link from "next/link";

const HOW_IT_WORKS = [
  {
    emoji: "🧴",
    title: "Pick your Syrup",
    body: "Select your topics — Tech, Finance, Cooking, whatever. We build a briefing around your unique curiosity.",
  },
  {
    emoji: "⚡",
    title: "We do the Pressing",
    body: "Our AI sweeps across the web for the most relevant, high-quality content, filtering out the noise.",
  },
  {
    emoji: "📬",
    title: "Served at 7:00 AM",
    body: "Every morning, a perfectly formatted digest lands in your inbox. No fluff. Just great content.",
  },
];

const INTERESTS = ["Tech", "Cooking", "Finance", "Music", "Design", "Health", "Cinema", "Travel"];

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
            The Most<br />
            Golden Way<br />
            to Start Your<br />
            Work.
          </h1>
          <p className="text-lg text-waffle-brown/60 max-w-md leading-relaxed not-italic">
            Say goodbye to sterile grids. WaffleStack brings the warmth of an artisanal kitchen to your
            digital workflow. Layered, rich, and syrupy smooth.
          </p>
          <div className="flex flex-wrap gap-3 not-italic">
            <Link
              href="/onboard"
              className="bg-waffle-brown hover:bg-waffle-espresso text-waffle-cream font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              Start Building Now
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 border-2 border-waffle-brown/20 hover:border-waffle-brown/50 text-waffle-brown font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              <span className="text-[10px]">▶</span> See the Magic
            </a>
          </div>
        </div>

        {/* Waffle card */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-xs aspect-square bg-white rounded-3xl shadow-lg flex items-center justify-center select-none">
            <span className="text-[140px] leading-none" role="img" aria-label="Waffle">🧇</span>
            <div className="absolute -bottom-5 right-4 bg-white shadow-md rounded-full px-4 py-2 text-sm font-semibold text-waffle-brown italic border border-waffle-golden/20">
              &ldquo;Crispy UI, Fluffy UX&rdquo;
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
                <div className="text-4xl">{step.emoji}</div>
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
