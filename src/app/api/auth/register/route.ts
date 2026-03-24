import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const existingUsers = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get()

    if (!existingUsers.empty) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRef = await db.collection("users").add({
      name: name || null,
      email,
      password: hashedPassword,
      image: null,
      aiUsageCount: 0,
      aiUsageResetAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json(
      { user: { id: userRef.id, name, email } },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
