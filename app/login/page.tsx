"use client";

import { useState } from "react";

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
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">📬</div>
          <h1 className="text-2xl font-semibold">Check your inbox</h1>
          <p className="text-gray-600">
            We sent a magic link to <strong>{email}</strong>. Click it to access your dashboard.
          </p>
          <p className="text-xs text-gray-400">No password required. Link expires in 1 hour.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-2">
          <div className="text-4xl">🧇</div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to WaffleStack</h1>
          <p className="text-gray-600">Enter your email and we&apos;ll send you a magic link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {status === "loading" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          Not signed up yet?{" "}
          <a href="/" className="underline hover:text-gray-600">Get your daily briefing</a>
        </p>
      </div>
    </main>
  );
}
