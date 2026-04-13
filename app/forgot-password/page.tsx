"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/reset-password`,
      }
    );

    if (error) {
      setErrorMsg("Couldn't send reset email. Please try again.");
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">📬</div>
          <h1 className="text-2xl font-extrabold text-waffle-brown">Check your inbox</h1>
          <p className="text-waffle-brown/60">
            We sent a password reset link to{" "}
            <strong className="text-waffle-brown">{email}</strong>.
          </p>
          <Link href="/login" className="text-xs text-waffle-brown/35 underline hover:text-waffle-brown">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-2">
          <div className="text-4xl">🔑</div>
          <h1 className="text-3xl font-extrabold italic text-waffle-brown">
            Reset your password.
          </h1>
          <p className="text-waffle-brown/55">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
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
            {status === "loading" ? "Sending…" : "Send reset link →"}
          </button>
        </form>

        <p className="text-xs text-waffle-brown/35 text-center">
          <Link href="/login" className="underline hover:text-waffle-brown">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
