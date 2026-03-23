import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/content/[id]/share - Increment share count
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const content = await prisma.content.findUnique({ where: { id: params.id } })
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  await prisma.content.update({
    where: { id: params.id },
    data: { sharesCount: { increment: 1 } },
  })

  return NextResponse.json({ success: true })
}
