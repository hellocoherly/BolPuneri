"use client"

import { useState, useEffect, useCallback } from "react"
import { ContentCard } from "@/components/ContentCard"
import { CategoryFilter } from "@/components/CategoryFilter"

interface ContentItem {
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

export default function HomePage() {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchContent = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedType) params.set("type", selectedType)
    if (selectedCategory) params.set("category", selectedCategory)
    params.set("page", page.toString())

    const res = await fetch(`/api/content?${params}`)
    if (res.ok) {
      const data = await res.json()
      setContents(data.contents)
      setTotalPages(data.totalPages)
    }
    setLoading(false)
  }, [selectedType, selectedCategory, page])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  useEffect(() => {
    setPage(1)
  }, [selectedType, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          बोल पुणेरी 🏷️
        </h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          Puneri Patya, Ukhane &amp; Memes — Generate with AI or post your own!
        </p>
      </div>

      {/* Filters */}
      <CategoryFilter
        selectedType={selectedType}
        selectedCategory={selectedCategory}
        onTypeChange={setSelectedType}
        onCategoryChange={setSelectedCategory}
      />

      {/* Content Feed */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-muted)] text-lg">No content yet!</p>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Be the first to post or generate something.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-[var(--color-text-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
