import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET /api/content/[id] - Get single content
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const content = await prisma.content.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      reactions: { select: { id: true, type: true, userId: true } },
    },
  })

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  return NextResponse.json({ content })
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

  const content = await prisma.content.findUnique({
    where: { id: params.id },
  })

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }
  if (content.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.content.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
