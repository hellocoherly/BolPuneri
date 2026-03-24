import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/auth"
import { FieldValue } from "firebase-admin/firestore"

// POST /api/content/[id]/react - Like or dislike content
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type } = await request.json()
  if (!["LIKE", "DISLIKE"].includes(type)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
  }

  const contentRef = db.collection("contents").doc(params.id)
  const contentDoc = await contentRef.get()
  if (!contentDoc.exists) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  // Use compound key for unique constraint: userId_contentId
  const reactionId = `${session.user.id}_${params.id}`
  const reactionRef = db.collection("reactions").doc(reactionId)
  const reactionDoc = await reactionRef.get()

  if (reactionDoc.exists) {
    const existingReaction = reactionDoc.data()!

    if (existingReaction.type === type) {
      // Remove reaction (toggle off)
      await reactionRef.delete()
      await contentRef.update({
        ...(type === "LIKE"
          ? { likesCount: FieldValue.increment(-1) }
          : { dislikesCount: FieldValue.increment(-1) }),
      })
      return NextResponse.json({ action: "removed", type })
    } else {
      // Switch reaction
      await reactionRef.update({ type })
      await contentRef.update({
        likesCount: FieldValue.increment(type === "LIKE" ? 1 : -1),
        dislikesCount: FieldValue.increment(type === "DISLIKE" ? 1 : -1),
      })
      return NextResponse.json({ action: "switched", type })
    }
  }

  // Create new reaction
  await reactionRef.set({
    type,
    userId: session.user.id,
    contentId: params.id,
    createdAt: new Date().toISOString(),
  })
  await contentRef.update({
    ...(type === "LIKE"
      ? { likesCount: FieldValue.increment(1) }
      : { dislikesCount: FieldValue.increment(1) }),
  })

  return NextResponse.json({ action: "created", type })
}
