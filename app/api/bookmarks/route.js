import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Bookmark from "@/models/Bookmark"

// GET /api/bookmarks
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
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { url: { $regex: searchTerm, $options: "i" } },
      ]
    }

    // Add tag filtering
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim())
      query.tags = { $in: tagArray }
    }

    const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("Get bookmarks error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/bookmarks
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    const { title, url, description, tags } = await request.json()

    // Validation
    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
    }

    // URL validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 400 })
    }

    await connectDB()

    // Auto-fetch title if not provided
    let finalTitle = title
    if (!title) {
      try {
        const response = await fetch(url)
        const html = await response.text()
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch) {
          finalTitle = titleMatch[1].trim()
        }
      } catch (error) {
        console.error("Error fetching title:", error)
      }
    }

    const bookmark = await Bookmark.create({
      title: finalTitle || url,
      url,
      description,
      tags: tags || [],
      userId: decoded.userId,
    })

    return NextResponse.json(bookmark, { status: 201 })
  } catch (error) {
    console.error("Create bookmark error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
