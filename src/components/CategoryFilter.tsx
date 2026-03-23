"use client"

interface CategoryFilterProps {
  selectedType: string | null
  selectedCategory: string | null
  onTypeChange: (type: string | null) => void
  onCategoryChange: (category: string | null) => void
}

const TYPES = [
  { value: "PATYA", label: "पाट्या / Patya" },
  { value: "UKHANE", label: "उखाणे / Ukhane" },
  { value: "MEME", label: "मीम्स / Memes" },
]

const CATEGORIES = [
  { value: "HUMOROUS", label: "विनोदी / Humorous" },
  { value: "ROMANTIC", label: "रोमँटिक / Romantic" },
  { value: "PHILOSOPHICAL", label: "तत्वज्ञान / Philosophical" },
  { value: "SARCASTIC", label: "उपरोधिक / Sarcastic" },
  { value: "GENERAL", label: "सामान्य / General" },
]

export function CategoryFilter({
  selectedType,
  selectedCategory,
  onTypeChange,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeChange(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedType
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
          }`}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => onTypeChange(selectedType === t.value ? null : t.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedType === t.value
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedCategory
              ? "bg-gray-800 text-white"
              : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-gray-800"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoryChange(selectedCategory === c.value ? null : c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === c.value
                ? "bg-gray-800 text-white"
                : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-gray-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
