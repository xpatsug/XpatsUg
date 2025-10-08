"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Copy, Trash2, Lock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { LockedLink, Shop } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function LinkLockerPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [links, setLinks] = useState<LockedLink[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [createdSlug, setCreatedSlug] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [linkType, setLinkType] = useState<"url" | "file">("url")
  const [targetUrl, setTargetUrl] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [password, setPassword] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [shopId, setShopId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Load locked links
    const { data: linksData } = await supabase
      .from("locked_links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (linksData) setLinks(linksData)

    // Load shops
    const { data: shopsData } = await supabase.from("shops").select("*").eq("user_id", user.id)

    if (shopsData) setShops(shopsData)
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setFileUrl(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch("/api/locked-links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          target_url: linkType === "url" ? targetUrl : undefined,
          file_url: linkType === "file" ? fileUrl : undefined,
          password,
          max_uses: maxUses ? Number.parseInt(maxUses) : undefined,
          expires_at: expiresAt || undefined,
          shop_id: shopId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to create locked link")
        return
      }

      setCreatedSlug(data.slug)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setTargetUrl("")
    setFileUrl("")
    setPassword("")
    setMaxUses("")
    setExpiresAt("")
    setShopId("")
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/link/${slug}`
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    const supabase = createClient()
    await supabase.from("locked_links").delete().eq("id", id)
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Link Locker</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Create password-protected links and files with optional expiry and usage limits
        </p>

        {/* Create Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Protected Link</CardTitle>
            <CardDescription>Secure your links and files with password protection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Protected Link"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Link Type</Label>
                <Select value={linkType} onValueChange={(value: "url" | "file") => setLinkType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL Link</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {linkType === "url" ? (
                <div className="space-y-2">
                  <Label htmlFor="targetUrl">Target URL *</Label>
                  <Input
                    id="targetUrl"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Upload File *</Label>
                  <Input
                    type="file"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
                  {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
                  {fileUrl && <p className="text-sm text-green-600">File uploaded successfully!</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses (optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              {shops.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="shop">Associate with Shop (optional)</Label>
                  <Select value={shopId} onValueChange={setShopId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={isCreating || (linkType === "file" && !fileUrl)}
                className="w-full"
                style={{ backgroundColor: "#14A800" }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Create Protected Link
                  </>
                )}
              </Button>
            </form>

            {createdSlug && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                  Link created successfully!
                </p>
                <div className="flex gap-2">
                  <Input value={`${window.location.origin}/link/${createdSlug}`} readOnly className="flex-1" />
                  <Button onClick={() => copyLink(createdSlug)} size="icon" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Protected Links</CardTitle>
            <CardDescription>Manage your password-protected links</CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No protected links yet. Create one above!</p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{link.title}</h3>
                        <p className="text-sm text-gray-500">
                          Uses: {link.uses_count}
                          {link.max_uses && ` / ${link.max_uses}`}
                        </p>
                        {link.expires_at && (
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(link.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => copyLink(link.slug)} size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => deleteLink(link.id)} size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block overflow-x-auto">
                      {window.location.origin}/link/{link.slug}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
