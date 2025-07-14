import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Note from "@/models/Note"

// GET /api/notes/[id]
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    await connectDB()

    const note = await Note.findOne({
      _id: params.id,
      userId: decoded.userId,
    })

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Get note error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/notes/[id]
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    const updateData = await request.json()

    await connectDB()

    const note = await Note.findOneAndUpdate({ _id: params.id, userId: decoded.userId }, updateData, { new: true })

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Update note error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/notes/[id]
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    await connectDB()

    const note = await Note.findOneAndDelete({
      _id: params.id,
      userId: decoded.userId,
    })

    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Delete note error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
