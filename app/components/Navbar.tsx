import { createAuthClient } from "@/lib/supabase-auth";
import Link from "next/link";

export default async function Navbar() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-waffle-cream px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl text-waffle-brown hover:opacity-80 tracking-tight">
          WaffleStack
        </Link>

        {!user && (
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-waffle-brown/60">
            <Link href="/how-it-works" className="hover:text-waffle-brown transition-colors">How it Works</Link>
            <Link href="/interests" className="hover:text-waffle-brown transition-colors">Interests</Link>
            <Link href="/pricing" className="hover:text-waffle-brown transition-colors">Pricing</Link>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm font-semibold">
          {user ? (
            <>
              <Link href="/dashboard" className="text-waffle-brown/70 hover:text-waffle-brown transition-colors">
                Dashboard
              </Link>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="text-waffle-brown/40 hover:text-waffle-brown transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-waffle-brown/70 hover:text-waffle-brown transition-colors">
                Sign in
              </Link>
              <Link
                href="/onboard"
                className="bg-waffle-orange hover:bg-waffle-orange/90 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
              >
                Get Your Stack
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
