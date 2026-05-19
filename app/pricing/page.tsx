import Link from "next/link";

const FEATURES = [
  "Up to 15 sources — Reddit, RSS, stocks, Hacker News, weather, and more",
  "Daily AI-written digest, delivered every morning",
  "Google Calendar & Gmail summaries (coming soon)",
  "Referral program — earn free months",
  "Cancel any time, no questions asked",
];

const FAQS = [
  {
    q: "What counts as a source?",
    a: "Each subreddit, RSS feed, stock ticker, or data connector counts as one source. Weather and Hacker News each count as one. 15 is generous — most readers use 5–8.",
  },
  {
    q: "What happens after the two-week trial?",
    a: "We'll show you a prompt to subscribe before your trial ends. Add a card and billing starts at $5/month. If not, your digest pauses — your settings are saved so you can resume any time.",
  },
  {
    q: "Can I cancel?",
    a: "Yes — from your dashboard, any time. You keep access until the end of the billing period. No partial refunds, no runaround.",
  },
  {
    q: "Do you store my card details?",
    a: "No. Payments are handled entirely by Stripe. We never see or store your card number.",
  },
];

export default function PricingPage() {
  return (
    <main className="bg-waffle-cream">

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-6 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold italic text-waffle-brown leading-tight">
          One price. No tiers. No nonsense.
        </h1>
        <p className="text-waffle-brown/55 text-lg max-w-xl mx-auto">
          A personalised morning briefing, written by AI, delivered to your inbox every day.
        </p>
      </section>

      {/* ── Plan card ── */}
      <section className="max-w-md mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-waffle-golden/20 overflow-hidden">

          {/* Trial banner */}
          <div className="bg-waffle-orange px-6 py-3 text-center">
            <p className="text-white font-bold text-sm tracking-wide">
              TWO WEEKS FREE — NO CARD NEEDED
            </p>
          </div>

          <div className="px-8 py-8 space-y-6">

            {/* Price */}
            <div className="text-center space-y-1">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-extrabold text-waffle-brown">$5</span>
                <span className="text-waffle-brown/40 font-semibold pb-2">/ month</span>
              </div>
              <p className="text-sm text-waffle-brown/40">after your free trial</p>
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-waffle-brown/70">
                  <span className="text-waffle-orange font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/onboard"
              className="block w-full text-center bg-waffle-brown hover:bg-waffle-espresso text-waffle-cream font-bold px-6 py-4 rounded-full transition-colors"
            >
              Start your free two weeks →
            </Link>

            <p className="text-xs text-waffle-brown/30 text-center">
              No credit card required to start. Cancel any time.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-2xl font-extrabold text-waffle-brown text-center">Common questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="bg-waffle-pale rounded-2xl px-6 py-5 border border-waffle-golden/30">
              <p className="font-bold text-waffle-brown text-sm mb-1.5">{faq.q}</p>
              <p className="text-waffle-brown/60 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-waffle-brown py-16 mt-4">
        <div className="max-w-xl mx-auto px-6 text-center space-y-5">
          <h2 className="text-3xl font-extrabold text-waffle-cream">
            Ready to reclaim your mornings?
          </h2>
          <p className="text-waffle-cream/50">
            Join readers who start the day informed, not overwhelmed.
          </p>
          <Link
            href="/onboard"
            className="inline-block bg-waffle-orange hover:bg-waffle-orange/90 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
          >
            Get started free →
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
