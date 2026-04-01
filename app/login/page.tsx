"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">📬</div>
          <h1 className="text-2xl font-extrabold text-waffle-brown">Check your inbox</h1>
          <p className="text-waffle-brown/60">
            We sent a magic link to <strong className="text-waffle-brown">{email}</strong>.
            Click it to access your dashboard.
          </p>
          <p className="text-xs text-waffle-brown/35">
            No password required. Link expires in 1 hour.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-2">
          <div className="text-4xl">🧇</div>
          <h1 className="text-3xl font-extrabold italic text-waffle-brown">
            Welcome back.
          </h1>
          <p className="text-waffle-brown/55">
            Enter your email and we&apos;ll send you a magic link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
          />

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-waffle-brown hover:bg-waffle-espresso disabled:opacity-50 text-waffle-cream font-bold py-3.5 rounded-xl transition-colors"
          >
            {status === "loading" ? "Sending…" : "Send magic link →"}
          </button>
        </form>

        <p className="text-xs text-waffle-brown/35 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/onboard" className="underline hover:text-waffle-brown">
            Build your stack
          </Link>
        </p>
      </div>
    </main>
  );
}
