import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

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

  const content = await prisma.content.findUnique({ where: { id: params.id } })
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  const existingReaction = await prisma.reaction.findUnique({
    where: { userId_contentId: { userId: session.user.id, contentId: params.id } },
  })

  if (existingReaction) {
    if (existingReaction.type === type) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({ where: { id: existingReaction.id } })
      await prisma.content.update({
        where: { id: params.id },
        data: {
          likesCount: type === "LIKE" ? { decrement: 1 } : undefined,
          dislikesCount: type === "DISLIKE" ? { decrement: 1 } : undefined,
        },
      })
      return NextResponse.json({ action: "removed", type })
    } else {
      // Switch reaction
      await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type },
      })
      await prisma.content.update({
        where: { id: params.id },
        data: {
          likesCount: type === "LIKE" ? { increment: 1 } : { decrement: 1 },
          dislikesCount: type === "DISLIKE" ? { increment: 1 } : { decrement: 1 },
        },
      })
      return NextResponse.json({ action: "switched", type })
    }
  }

  // Create new reaction
  await prisma.reaction.create({
    data: { type, userId: session.user.id, contentId: params.id },
  })
  await prisma.content.update({
    where: { id: params.id },
    data: {
      likesCount: type === "LIKE" ? { increment: 1 } : undefined,
      dislikesCount: type === "DISLIKE" ? { increment: 1 } : undefined,
    },
  })

  return NextResponse.json({ action: "created", type })
}
