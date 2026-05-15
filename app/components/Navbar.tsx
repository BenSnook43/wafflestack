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

        <div className="flex items-center gap-8 text-sm font-semibold">
          <div className="hidden md:flex items-center gap-8 text-waffle-brown/60">
            <Link href="/how-it-works" className="hover:text-waffle-brown transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-waffle-brown transition-colors">Pricing</Link>
          </div>

          {user ? (
            <>
              <Link href="/dashboard" className="text-waffle-brown/70 hover:text-waffle-brown transition-colors">
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-waffle-brown/10 hover:bg-waffle-brown/20 transition-colors"
                aria-label="Account settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-waffle-brown/70">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </Link>
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
