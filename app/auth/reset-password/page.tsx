"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg("Failed to update password. The link may have expired.");
      setStatus("error");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-waffle-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-2">
          <div className="text-4xl">🔑</div>
          <h1 className="text-3xl font-extrabold italic text-waffle-brown">
            Set a new password.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            autoFocus
            className="w-full border border-waffle-brown/15 rounded-xl px-4 py-3.5 text-sm bg-white text-waffle-brown placeholder-waffle-brown/30 focus:outline-none focus:ring-2 focus:ring-waffle-orange"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
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
            {status === "loading" ? "Updating…" : "Update password →"}
          </button>
        </form>
      </div>
    </main>
  );
}
