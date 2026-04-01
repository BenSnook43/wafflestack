import { createAuthClient } from "@/lib/supabase-auth";
import Link from "next/link";

export default async function Navbar() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 hover:opacity-80">
          <span>🧇</span>
          <span>WaffleStack</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <form action="/api/auth/sign-out" method="POST">
                <button type="submit" className="text-gray-400 hover:text-gray-600">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Sign up
              </Link>
              <Link
                href="/login"
                className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
