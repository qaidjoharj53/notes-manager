import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Note from "@/models/Note"

// GET /api/notes
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    await connectDB()

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("q")
    const tags = searchParams.get("tags")

    const query = { userId: decoded.userId }

    // Add search functionality
    if (searchTerm) {
      query.$or = [{ title: { $regex: searchTerm, $options: "i" } }, { content: { $regex: searchTerm, $options: "i" } }]
    }

    // Add tag filtering
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim())
      query.tags = { $in: tagArray }
    }

    const notes = await Note.find(query).sort({ createdAt: -1 })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Get notes error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/notes
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    const { title, content, tags } = await request.json()

    // Validation
    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    await connectDB()

    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      userId: decoded.userId,
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Create note error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
