"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white py-2.5 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--color-primary)] font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
