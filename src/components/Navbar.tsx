"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[var(--color-primary)]">
          बोल पुणेरी
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/create"
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            + Create
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-muted)]">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
