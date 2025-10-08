"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Loader2, ArrowLeft, Palette } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Shop, CustomLink } from "@/lib/types"
import Link from "next/link"

interface ShopFormProps {
  shop?: Shop
  customLinks?: CustomLink[]
}

export function ShopForm({ shop, customLinks = [] }: ShopFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(shop?.name || "")
  const [description, setDescription] = useState(shop?.description || "")
  const [category, setCategory] = useState<"product" | "service">(shop?.category || "product")
  const [location, setLocation] = useState(shop?.location || "")
  const [profilePicture, setProfilePicture] = useState(shop?.profile_picture_url || "")
  const [coverPicture, setCoverPicture] = useState(shop?.cover_picture_url || "")
  const [resumeUrl, setResumeUrl] = useState(shop?.resume_url || "")

  // Social media
  const [tiktokUrl, setTiktokUrl] = useState(shop?.tiktok_url || "")
  const [youtubeUrl, setYoutubeUrl] = useState(shop?.youtube_url || "")
  const [whatsappNumber, setWhatsappNumber] = useState(shop?.whatsapp_number || "")
  const [emailContact, setEmailContact] = useState(shop?.email_contact || "")
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState(shop?.google_business_url || "")

  // Mobile Money
  const [airtelMoney, setAirtelMoney] = useState(shop?.airtel_money || "")
  const [mtnMomo, setMtnMomo] = useState(shop?.mtn_momo || "")

  // Custom links
  const [links, setLinks] = useState<{ title: string; url: string; id?: string }[]>(
    customLinks.map((link) => ({ title: link.title, url: link.url, id: link.id })),
  )

  // Theme customization state
  const [themeColor, setThemeColor] = useState(shop?.theme_color || "#3b82f6")
  const [themeGradient, setThemeGradient] = useState(shop?.theme_gradient || "")
  const [darkMode, setDarkMode] = useState(shop?.dark_mode ?? true)
  const [useGradient, setUseGradient] = useState(!!shop?.theme_gradient)

  const handleFileUpload = async (file: File, type: "profile" | "cover" | "resume") => {
    setIsUploading(type)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()

      if (type === "profile") setProfilePicture(data.url)
      else if (type === "cover") setCoverPicture(data.url)
      else if (type === "resume") setResumeUrl(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(null)
    }
  }

  const addLink = () => {
    setLinks([...links, { title: "", url: "" }])
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, field: "title" | "url", value: string) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in")
      setIsSubmitting(false)
      return
    }

    try {
      // Upsert shop
      const shopData = {
        user_id: user.id,
        name,
        description,
        category,
        location,
        profile_picture_url: profilePicture,
        cover_picture_url: coverPicture,
        resume_url: resumeUrl,
        tiktok_url: tiktokUrl,
        youtube_url: youtubeUrl,
        whatsapp_number: whatsappNumber,
        email_contact: emailContact,
        google_business_url: googleBusinessUrl,
        airtel_money: airtelMoney,
        mtn_momo: mtnMomo,
        theme_color: themeColor,
        theme_gradient: useGradient ? themeGradient : null,
        dark_mode: darkMode,
        updated_at: new Date().toISOString(),
      }

      let shopId = shop?.id

      if (shop) {
        // Update existing shop
        const { error } = await supabase.from("shops").update(shopData).eq("id", shop.id)
        if (error) throw error
      } else {
        // Create new shop
        const { data, error } = await supabase.from("shops").insert(shopData).select().single()
        if (error) throw error
        shopId = data.id
      }

      // Handle custom links
      if (shopId) {
        // Delete removed links
        const existingLinkIds = customLinks.map((l) => l.id)
        const currentLinkIds = links.filter((l) => l.id).map((l) => l.id)
        const linksToDelete = existingLinkIds.filter((id) => !currentLinkIds.includes(id))

        if (linksToDelete.length > 0) {
          await supabase.from("custom_links").delete().in("id", linksToDelete)
        }

        // Upsert links
        for (let i = 0; i < links.length; i++) {
          const link = links[i]
          if (link.title && link.url) {
            const linkData = {
              shop_id: shopId,
              title: link.title,
              url: link.url,
              position: i,
            }

            if (link.id) {
              await supabase.from("custom_links").update(linkData).eq("id", link.id)
            } else {
              await supabase.from("custom_links").insert(linkData)
            }
          }
        }
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error saving shop:", error)
      alert("Failed to save shop. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const gradientPresets = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">{shop ? "Edit Shop" : "Create New Shop"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell customers about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Amazing Shop"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what makes your business special..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(value: "product" | "service") => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kampala, Uganda"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images & Files */}
          <Card>
            <CardHeader>
              <CardTitle>Images & Files</CardTitle>
              <CardDescription>Upload your shop visuals and resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {profilePicture && (
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "profile")}
                      disabled={isUploading === "profile"}
                      className="max-w-xs"
                    />
                    {isUploading === "profile" && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Picture</Label>
                <div className="flex items-center gap-4">
                  {coverPicture && (
                    <img
                      src={coverPicture || "/placeholder.svg"}
                      alt="Cover"
                      className="h-20 w-32 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "cover")}
                      disabled={isUploading === "cover"}
                      className="max-w-xs"
                    />
                    {isUploading === "cover" && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resume (PDF)</Label>
                <div className="flex items-center gap-4">
                  {resumeUrl && (
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">
                      View Resume
                    </a>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "resume")}
                      disabled={isUploading === "resume"}
                      className="max-w-xs"
                    />
                    {isUploading === "resume" && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Social Media</CardTitle>
              <CardDescription>Help customers reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+256700000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailContact}
                    onChange={(e) => setEmailContact(e.target.value)}
                    placeholder="shop@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok URL</Label>
                  <Input
                    id="tiktok"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://tiktok.com/@yourshop"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube URL</Label>
                  <Input
                    id="youtube"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/@yourshop"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="google">Google My Business URL</Label>
                  <Input
                    id="google"
                    value={googleBusinessUrl}
                    onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                    placeholder="https://g.page/yourshop"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Money */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Money</CardTitle>
              <CardDescription>Add your payment contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="airtel">Airtel Money</Label>
                  <Input
                    id="airtel"
                    value={airtelMoney}
                    onChange={(e) => setAirtelMoney(e.target.value)}
                    placeholder="+256700000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mtn">MTN Momo Pay</Label>
                  <Input
                    id="mtn"
                    value={mtnMomo}
                    onChange={(e) => setMtnMomo(e.target.value)}
                    placeholder="+256700000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Customization
              </CardTitle>
              <CardDescription>Customize your shop's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode by Default</Label>
                  <p className="text-sm text-gray-500">Visitors will see dark mode first</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className={darkMode ? "bg-gray-900 text-white" : ""}
                >
                  {darkMode ? "Dark" : "Light"}
                </Button>
              </div>

              {/* Color or Gradient Toggle */}
              <div className="space-y-2">
                <Label>Theme Style</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!useGradient ? "default" : "outline"}
                    onClick={() => setUseGradient(false)}
                    className="flex-1"
                  >
                    Solid Color
                  </Button>
                  <Button
                    type="button"
                    variant={useGradient ? "default" : "outline"}
                    onClick={() => setUseGradient(true)}
                    className="flex-1"
                  >
                    Gradient
                  </Button>
                </div>
              </div>

              {/* Solid Color Picker */}
              {!useGradient && (
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} placeholder="#3b82f6" />
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#6366f1"].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setThemeColor(color)}
                          className="h-10 w-10 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Gradient Picker */}
              {useGradient && (
                <div className="space-y-2">
                  <Label>Gradient Style</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {gradientPresets.map((gradient, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setThemeGradient(gradient)}
                        className={`h-16 rounded-lg border-2 transition-all ${
                          themeGradient === gradient ? "border-gray-900 dark:border-white scale-105" : "border-gray-300"
                        }`}
                        style={{ background: gradient }}
                      />
                    ))}
                  </div>
                  <Input
                    value={themeGradient}
                    onChange={(e) => setThemeGradient(e.target.value)}
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    className="mt-2"
                  />
                </div>
              )}

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <Button
                    type="button"
                    className="w-full"
                    style={useGradient ? { background: themeGradient } : { backgroundColor: themeColor }}
                  >
                    Primary Button
                  </Button>
                  <div className="flex gap-2">
                    <div
                      className="h-12 flex-1 rounded-lg flex items-center justify-center text-white font-medium"
                      style={useGradient ? { background: themeGradient } : { backgroundColor: themeColor }}
                    >
                      Badge
                    </div>
                    <div
                      className="h-12 flex-1 rounded-lg flex items-center justify-center text-white font-medium"
                      style={useGradient ? { background: themeGradient } : { backgroundColor: themeColor }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Links */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Links</CardTitle>
              <CardDescription>Add unlimited custom links to your shop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Link Title"
                    value={link.title}
                    onChange={(e) => updateLink(index, "title", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeLink(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addLink} className="w-full gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : shop ? (
                "Update Shop"
              ) : (
                "Create Shop"
              )}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
