import { db } from "@/lib/firebase"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { ContentCard } from "@/components/ContentCard"
import Link from "next/link"

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const contentDoc = await db.collection("contents").doc(params.id).get()

  if (!contentDoc.exists) notFound()

  const data = contentDoc.data()!

  // Fetch author
  let author = { id: data.authorId, name: null, image: null }
  if (data.authorId) {
    const authorDoc = await db.collection("users").doc(data.authorId).get()
    if (authorDoc.exists) {
      const authorData = authorDoc.data()!
      author = { id: authorDoc.id, name: authorData.name, image: authorData.image }
    }
  }

  // Fetch reactions
  const reactionsSnapshot = await db
    .collection("reactions")
    .where("contentId", "==", params.id)
    .get()

  const reactions = reactionsSnapshot.docs.map((doc) => ({
    type: doc.data().type,
    userId: doc.data().userId,
  }))

  const session = await auth()
  const userReaction = session?.user?.id
    ? reactions.find((r) => r.userId === session.user!.id)?.type || null
    : null

  const contentForCard = {
    id: contentDoc.id,
    ...data,
    author,
    reactions,
  } as any

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
          <div>Type: <span className="text-[var(--color-text)]">{data.type}</span></div>
          <div>Category: <span className="text-[var(--color-text)]">{data.category}</span></div>
          <div>Language: <span className="text-[var(--color-text)]">{data.language}</span></div>
          <div>Posted: <span className="text-[var(--color-text)]">{new Date(data.createdAt).toLocaleDateString()}</span></div>
        </div>
      </div>
    </div>
  )
}
