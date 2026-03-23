"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ContentCardProps {
  content: {
    id: string
    type: string
    category: string
    language: string
    textMarathi: string | null
    textEnglish: string | null
    isAIGenerated: boolean
    likesCount: number
    dislikesCount: number
    sharesCount: number
    author: { id: string; name: string | null; image: string | null }
    createdAt: string
  }
  userReaction?: string | null
}

const TYPE_LABELS: Record<string, string> = {
  PATYA: "पाटी / Patya",
  UKHANE: "उखाणे / Ukhane",
  MEME: "मीम / Meme",
}

const CATEGORY_COLORS: Record<string, string> = {
  HUMOROUS: "bg-yellow-100 text-yellow-800",
  ROMANTIC: "bg-pink-100 text-pink-800",
  PHILOSOPHICAL: "bg-purple-100 text-purple-800",
  SARCASTIC: "bg-orange-100 text-orange-800",
  GENERAL: "bg-gray-100 text-gray-800",
}

export function ContentCard({ content, userReaction: initialReaction }: ContentCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [likes, setLikes] = useState(content.likesCount)
  const [dislikes, setDislikes] = useState(content.dislikesCount)
  const [shares, setShares] = useState(content.sharesCount)
  const [reaction, setReaction] = useState<string | null>(initialReaction || null)

  async function handleReaction(type: "LIKE" | "DISLIKE") {
    if (!session) {
      router.push("/login")
      return
    }

    const res = await fetch(`/api/content/${content.id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.action === "removed") {
        if (type === "LIKE") setLikes((l) => l - 1)
        else setDislikes((d) => d - 1)
        setReaction(null)
      } else if (data.action === "switched") {
        if (type === "LIKE") {
          setLikes((l) => l + 1)
          setDislikes((d) => d - 1)
        } else {
          setDislikes((d) => d + 1)
          setLikes((l) => l - 1)
        }
        setReaction(type)
      } else {
        if (type === "LIKE") setLikes((l) => l + 1)
        else setDislikes((d) => d + 1)
        setReaction(type)
      }
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/content/${content.id}`
    if (navigator.share) {
      await navigator.share({ title: "BolPuneri", text: content.textMarathi || content.textEnglish || "", url })
    } else {
      await navigator.clipboard.writeText(url)
    }
    await fetch(`/api/content/${content.id}/share`, { method: "POST" })
    setShares((s) => s + 1)
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
            {(content.author.name || "?")[0].toUpperCase()}
          </div>
          <span className="text-sm text-[var(--color-text-muted)]">
            {content.author.name || "Anonymous"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[content.category] || CATEGORY_COLORS.GENERAL}`}>
            {content.category.toLowerCase()}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {TYPE_LABELS[content.type] || content.type}
          </span>
          {content.isAIGenerated && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              AI
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/content/${content.id}`} className="block">
        {content.textMarathi && (
          <p className="text-lg font-medium mb-1 leading-relaxed">{content.textMarathi}</p>
        )}
        {content.textEnglish && (
          <p className="text-sm text-[var(--color-text-muted)] italic">{content.textEnglish}</p>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => handleReaction("LIKE")}
          className={`flex items-center gap-1 text-sm transition-colors ${
            reaction === "LIKE" ? "text-[var(--color-like)] font-medium" : "text-[var(--color-text-muted)] hover:text-[var(--color-like)]"
          }`}
        >
          <span>{reaction === "LIKE" ? "▲" : "△"}</span>
          <span>{likes}</span>
        </button>

        <button
          onClick={() => handleReaction("DISLIKE")}
          className={`flex items-center gap-1 text-sm transition-colors ${
            reaction === "DISLIKE" ? "text-[var(--color-dislike)] font-medium" : "text-[var(--color-text-muted)] hover:text-[var(--color-dislike)]"
          }`}
        >
          <span>{reaction === "DISLIKE" ? "▼" : "▽"}</span>
          <span>{dislikes}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors ml-auto"
        >
          <span>↗</span>
          <span>Share {shares > 0 ? `(${shares})` : ""}</span>
        </button>
      </div>
    </div>
  )
}
