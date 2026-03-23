"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const TYPES = [
  { value: "PATYA", label: "पाटी / Patya" },
  { value: "UKHANE", label: "उखाणे / Ukhane" },
  { value: "MEME", label: "मीम / Meme" },
]

const CATEGORIES = [
  { value: "HUMOROUS", label: "विनोदी / Humorous" },
  { value: "ROMANTIC", label: "रोमँटिक / Romantic" },
  { value: "PHILOSOPHICAL", label: "तत्वज्ञान / Philosophical" },
  { value: "SARCASTIC", label: "उपरोधिक / Sarcastic" },
  { value: "GENERAL", label: "सामान्य / General" },
]

const LANGUAGES = [
  { value: "MARATHI", label: "मराठी / Marathi" },
  { value: "ENGLISH", label: "English" },
  { value: "BOTH", label: "दोन्ही / Both" },
]

export default function CreatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<"manual" | "ai">("manual")
  const [type, setType] = useState("PATYA")
  const [category, setCategory] = useState("HUMOROUS")
  const [language, setLanguage] = useState("BOTH")
  const [textMarathi, setTextMarathi] = useState("")
  const [textEnglish, setTextEnglish] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [aiGenerated, setAiGenerated] = useState<{ textMarathi: string | null; textEnglish: string | null } | null>(null)
  const [remainingUsage, setRemainingUsage] = useState<number | null>(null)

  async function handleAIGenerate() {
    if (!session) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError("")
    setAiGenerated(null)

    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, category, language }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      setAiGenerated(data.generated)
      setTextMarathi(data.generated.textMarathi || "")
      setTextEnglish(data.generated.textEnglish || "")
      setRemainingUsage(data.remainingUsage)
    }
    setLoading(false)
  }

  async function handleSubmit() {
    if (!session) {
      router.push("/login")
      return
    }

    if (!textMarathi && !textEnglish) {
      setError("Please enter content in at least one language")
      return
    }

    setLoading(true)
    setError("")

    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        category,
        language,
        textMarathi: textMarathi || null,
        textEnglish: textEnglish || null,
        isAIGenerated: mode === "ai" && aiGenerated !== null,
      }),
    })

    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Failed to create content")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Content</h1>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("manual"); setAiGenerated(null); setTextMarathi(""); setTextEnglish("") }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "manual"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          Write your own
        </button>
        <button
          onClick={() => { setMode("ai"); setAiGenerated(null); setTextMarathi(""); setTextEnglish("") }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "ai"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          Generate with AI
        </button>
      </div>

      {mode === "ai" && !session && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          You need to <a href="/login" className="underline font-medium">login</a> to use AI generation.
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Generate button */}
      {mode === "ai" && (
        <div>
          <button
            onClick={handleAIGenerate}
            disabled={loading || !session}
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Generating..." : "Generate with AI"}
          </button>
          {remainingUsage !== null && (
            <span className="text-xs text-[var(--color-text-muted)] ml-3">
              {remainingUsage} generations remaining today
            </span>
          )}
        </div>
      )}

      {/* Text inputs */}
      <div className="space-y-4">
        {(language === "MARATHI" || language === "BOTH") && (
          <div>
            <label className="block text-sm font-medium mb-1">मराठी मजकूर (Marathi text)</label>
            <textarea
              value={textMarathi}
              onChange={(e) => setTextMarathi(e.target.value)}
              placeholder="तुमची पुणेरी पाटी / उखाणे इथे लिहा..."
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm resize-none"
              readOnly={mode === "ai" && aiGenerated !== null}
            />
          </div>
        )}
        {(language === "ENGLISH" || language === "BOTH") && (
          <div>
            <label className="block text-sm font-medium mb-1">English text</label>
            <textarea
              value={textEnglish}
              onChange={(e) => setTextEnglish(e.target.value)}
              placeholder="Write your Puneri Patya / Ukhane here..."
              rows={3}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm resize-none"
              readOnly={mode === "ai" && aiGenerated !== null}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || (!textMarathi && !textEnglish)}
        className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
      >
        {loading ? "Posting..." : "Post Content"}
      </button>
    </div>
  )
}
