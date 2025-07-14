import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Bookmark from "@/models/Bookmark"

// GET /api/bookmarks/[id]
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    await connectDB()

    const bookmark = await Bookmark.findOne({
      _id: params.id,
      userId: decoded.userId,
    })

    if (!bookmark) {
      return NextResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Get bookmark error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/bookmarks/[id]
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    const updateData = await request.json()

    // URL validation if URL is being updated
    if (updateData.url) {
      try {
        new URL(updateData.url)
      } catch {
        return NextResponse.json({ message: "Invalid URL format" }, { status: 400 })
      }
    }

    await connectDB()

    const bookmark = await Bookmark.findOneAndUpdate({ _id: params.id, userId: decoded.userId }, updateData, {
      new: true,
    })

    if (!bookmark) {
      return NextResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error("Update bookmark error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/bookmarks/[id]
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    await connectDB()

    const bookmark = await Bookmark.findOneAndDelete({
      _id: params.id,
      userId: decoded.userId,
    })

    if (!bookmark) {
      return NextResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Bookmark deleted successfully" })
  } catch (error) {
    console.error("Delete bookmark error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
