import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { FieldValue } from "firebase-admin/firestore"

// POST /api/content/[id]/share - Increment share count
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const contentRef = db.collection("contents").doc(params.id)
  const contentDoc = await contentRef.get()

  if (!contentDoc.exists) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  await contentRef.update({ sharesCount: FieldValue.increment(1) })

  return NextResponse.json({ success: true })
}
