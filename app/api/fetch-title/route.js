import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
    }

    // URL validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ message: "Failed to fetch URL" }, { status: 400 })
    }

    const html = await response.text()

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : null

    return NextResponse.json({ title })
  } catch (error) {
    console.error("Fetch title error:", error)
    return NextResponse.json({ message: "Failed to fetch title" }, { status: 500 })
  }
}
