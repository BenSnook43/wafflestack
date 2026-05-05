"use client";

import { useState } from "react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Please try again.");
        setConfirming(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setConfirming(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-600 transition-colors font-semibold"
      >
        Delete account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="font-extrabold text-waffle-brown text-base">Delete your account?</h2>
            <p className="text-sm text-waffle-brown/60 leading-relaxed">
              This will permanently delete your account, preferences, and cancel any active
              subscription. This cannot be undone.
            </p>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setOpen(false)}
                disabled={confirming}
                className="flex-1 text-sm font-bold text-waffle-brown bg-waffle-cream rounded-xl py-2.5 hover:bg-waffle-brown/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirming}
                className="flex-1 text-sm font-bold text-white bg-red-500 rounded-xl py-2.5 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {confirming ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
