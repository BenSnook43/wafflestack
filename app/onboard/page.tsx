"use client";

import { useState } from "react";
import Link from "next/link";

export default function OnboardPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    setStatus("loading");
    setErrorMsg("");

    // 1. Create user record with empty preferences
    const subRes = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!subRes.ok) {
      const data = await subRes.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    // 2. Send magic link so they land on the dashboard authenticated
    const linkRes = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!linkRes.ok) {
      setErrorMsg("Account created but we couldn't send the login link. Try signing in.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">📬</div>
          <h1 className="text-2xl font-extrabold text-waffle-brown">Check your inbox</h1>
          <p className="text-waffle-brown/60">
            We sent a magic link to <strong className="text-waffle-brown">{email}</strong>.
            Click it to set up your morning digest.
          </p>
          <p className="text-xs text-waffle-brown/35">
            No password needed. The link expires in 1 hour.
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
            Let&apos;s get you set up.
          </h1>
          <p className="text-waffle-brown/55">
            Enter your email and we&apos;ll send you a link to build your morning digest.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email.includes("@") && handleSubmit()}
            placeholder="you@example.com"
            autoFocus
            className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
          />

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === "loading" || !email.includes("@")}
            className="w-full bg-waffle-brown hover:bg-waffle-espresso disabled:opacity-40 text-waffle-cream font-bold py-3.5 rounded-xl transition-colors"
          >
            {status === "loading" ? "Setting up…" : "Continue →"}
          </button>
        </div>

        <p className="text-xs text-waffle-brown/35 text-center">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-waffle-brown">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
