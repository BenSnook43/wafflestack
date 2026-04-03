"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleUnsubscribe() {
    if (!uid && !email) return;
    setStatus("loading");

    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uid ? { uid } : { email }),
    });

    setStatus(res.ok ? "done" : "error");
  }

  if (!uid && !email) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">🧇</div>
        <h1 className="text-xl font-semibold">Invalid link</h1>
        <p className="text-gray-600">This unsubscribe link is missing required information.</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">👋</div>
        <h1 className="text-xl font-semibold">You&apos;ve been unsubscribed</h1>
        <p className="text-gray-600">No more emails from WaffleStack. Sorry to see you go.</p>
        <p className="text-sm text-gray-400">Changed your mind? <a href="/" className="underline hover:text-gray-600">Sign up again</a></p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">😬</div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-gray-600">We couldn&apos;t process your request. Please try again or reply to any WaffleStack email.</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-4xl">🧇</div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Unsubscribe from WaffleStack?</h1>
        <p className="text-gray-600">You&apos;ll stop receiving your daily morning briefing.</p>
      </div>
      <div className="space-y-3">
        <button
          onClick={handleUnsubscribe}
          disabled={status === "loading"}
          className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {status === "loading" ? "Unsubscribing…" : "Yes, unsubscribe me"}
        </button>
        <a
          href="/"
          className="block w-full text-center border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          Never mind, keep my briefings
        </a>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <Suspense fallback={<div className="text-center text-gray-400">Loading…</div>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </main>
  );
}
