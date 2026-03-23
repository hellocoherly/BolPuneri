import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ContentCard } from "@/components/ContentCard"
import Link from "next/link"

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const content = await prisma.content.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      reactions: { select: { type: true, userId: true } },
    },
  })

  if (!content) notFound()

  const session = await auth()
  const userReaction = session?.user?.id
    ? content.reactions.find((r) => r.userId === session.user!.id)?.type || null
    : null

  const contentForCard = {
    ...content,
    createdAt: content.createdAt.toISOString(),
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        ← Back to feed
      </Link>

      <ContentCard content={contentForCard} userReaction={userReaction} />

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
        <h3 className="text-sm font-medium mb-2">Details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text-muted)]">
          <div>Type: <span className="text-[var(--color-text)]">{content.type}</span></div>
          <div>Category: <span className="text-[var(--color-text)]">{content.category}</span></div>
          <div>Language: <span className="text-[var(--color-text)]">{content.language}</span></div>
          <div>Posted: <span className="text-[var(--color-text)]">{new Date(content.createdAt).toLocaleDateString()}</span></div>
        </div>
      </div>
    </div>
  )
}
