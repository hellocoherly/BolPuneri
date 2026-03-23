import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

const VALID_TYPES = ["PATYA", "UKHANE", "MEME"]
const VALID_CATEGORIES = ["HUMOROUS", "ROMANTIC", "PHILOSOPHICAL", "SARCASTIC", "GENERAL"]
const VALID_LANGUAGES = ["MARATHI", "ENGLISH", "BOTH"]

// GET /api/content - List content (public)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const category = searchParams.get("category")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: any = {}
  if (type && VALID_TYPES.includes(type)) where.type = type
  if (category && VALID_CATEGORIES.includes(category)) where.category = category

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: { author: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ])

  return NextResponse.json({ contents, total, page, totalPages: Math.ceil(total / limit) })
}

// POST /api/content - Create content (requires auth)
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, category, language, textMarathi, textEnglish, isAIGenerated } = body

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
    if (!language || !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 })
    }
    if (!textMarathi && !textEnglish) {
      return NextResponse.json({ error: "Content text is required" }, { status: 400 })
    }

    const content = await prisma.content.create({
      data: {
        type,
        category,
        language,
        textMarathi: textMarathi || null,
        textEnglish: textEnglish || null,
        isAIGenerated: isAIGenerated || false,
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json({ content }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
