"use client";

export default function SignOutButton() {
  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-waffle-brown/40 hover:text-waffle-brown transition-colors font-semibold"
    >
      Sign out
    </button>
  );
}
