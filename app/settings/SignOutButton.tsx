"use client";

export default function SignOutButton() {
  async function handleSignOut() {
    const res = await fetch("/api/auth/sign-out", { method: "POST", redirect: "follow" });
    window.location.href = res.url || "/";
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
