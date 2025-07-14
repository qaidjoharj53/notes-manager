"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, X } from "lucide-react"

export default function EditBookmarkPage() {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchingTitle, setFetchingTitle] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    fetchBookmark()
  }, [])

  const fetchBookmark = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`/api/bookmarks/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const bookmark = await response.json()
        setFormData({
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || "",
          tags: bookmark.tags || [],
        })
      } else if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/auth/login")
      } else {
        setError("Failed to fetch bookmark")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/bookmarks/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/bookmarks")
      } else if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/auth/login")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update bookmark")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const fetchTitle = async () => {
    if (!formData.url) return

    setFetchingTitle(true)
    try {
      const response = await fetch("/api/fetch-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formData.url }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.title) {
          setFormData((prev) => ({ ...prev, title: data.title }))
        }
      }
    } catch (error) {
      console.error("Error fetching title:", error)
    } finally {
      setFetchingTitle(false)
    }
  }

  const addTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/bookmarks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookmarks
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 ml-4">Edit Bookmark</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Bookmark</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    required
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                  <Button
                    type="button"
                    onClick={fetchTitle}
                    disabled={fetchingTitle || !formData.url}
                    variant="outline"
                  >
                    {fetchingTitle ? "Fetching..." : "Fetch Title"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter bookmark title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a description for this bookmark..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag(e)}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add Tag
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Bookmark"}
                </Button>
                <Link href="/bookmarks">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
