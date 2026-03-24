import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/auth"

// GET /api/content/[id] - Get single content
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const contentDoc = await db.collection("contents").doc(params.id).get()

  if (!contentDoc.exists) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

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
    id: doc.id,
    type: doc.data().type,
    userId: doc.data().userId,
  }))

  return NextResponse.json({ content: { id: contentDoc.id, ...data, author, reactions } })
}

// DELETE /api/content/[id] - Delete content (owner only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contentDoc = await db.collection("contents").doc(params.id).get()

  if (!contentDoc.exists) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  const data = contentDoc.data()!
  if (data.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Delete associated reactions
  const reactionsSnapshot = await db
    .collection("reactions")
    .where("contentId", "==", params.id)
    .get()

  const batch = db.batch()
  reactionsSnapshot.docs.forEach((doc) => batch.delete(doc.ref))
  batch.delete(contentDoc.ref)
  await batch.commit()

  return NextResponse.json({ success: true })
}
