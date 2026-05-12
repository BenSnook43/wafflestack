"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function OnboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Passwords don't match.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const supabase = createSupabaseBrowser();
    const normalizedEmail = email.toLowerCase().trim();

    // Create auth user
    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (signUpError) {
      setErrorMsg(signUpError.message ?? "Failed to create account.");
      setStatus("error");
      return;
    }

    // Provision public.users row with trial
    const subRes = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    if (!subRes.ok) {
      const data = await subRes.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Account created but setup failed. Try signing in.");
      setStatus("error");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignUp() {
    setStatus("loading");
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });
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
            14-day free trial, then $5/month. No credit card required.
          </p>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-3 border border-waffle-brown/20 bg-white hover:bg-waffle-brown/5 disabled:opacity-50 text-waffle-brown font-semibold py-3.5 rounded-xl transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-waffle-brown/30 text-xs">
          <div className="flex-1 h-px bg-waffle-brown/15" />
          or
          <div className="flex-1 h-px bg-waffle-brown/15" />
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
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
            {status === "loading" ? "Setting up…" : "Create account →"}
          </button>
        </form>

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
