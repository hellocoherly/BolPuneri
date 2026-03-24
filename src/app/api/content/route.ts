import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
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

  let query: FirebaseFirestore.Query = db.collection("contents")

  if (type && VALID_TYPES.includes(type)) {
    query = query.where("type", "==", type)
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    query = query.where("category", "==", category)
  }

  query = query.orderBy("createdAt", "desc")

  // Get total count (Firestore doesn't have a built-in count for filtered queries easily,
  // so we fetch all IDs for count, then paginate)
  const countSnapshot = await query.select().get()
  const total = countSnapshot.size

  // Paginate
  const offset = (page - 1) * limit
  const snapshot = await query.offset(offset).limit(limit).get()

  const contents = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data()
      // Fetch author
      let author = { id: data.authorId, name: null, image: null }
      if (data.authorId) {
        const authorDoc = await db.collection("users").doc(data.authorId).get()
        if (authorDoc.exists) {
          const authorData = authorDoc.data()!
          author = { id: authorDoc.id, name: authorData.name, image: authorData.image }
        }
      }
      return { id: doc.id, ...data, author }
    })
  )

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

    const now = new Date().toISOString()
    const contentData = {
      type,
      category,
      language,
      textMarathi: textMarathi || null,
      textEnglish: textEnglish || null,
      isAIGenerated: isAIGenerated || false,
      authorId: session.user.id,
      likesCount: 0,
      dislikesCount: 0,
      sharesCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await db.collection("contents").add(contentData)

    // Fetch author info
    const authorDoc = await db.collection("users").doc(session.user.id).get()
    const authorData = authorDoc.exists ? authorDoc.data()! : {}
    const author = {
      id: session.user.id,
      name: authorData.name || null,
      image: authorData.image || null,
    }

    return NextResponse.json(
      { content: { id: docRef.id, ...contentData, author } },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
