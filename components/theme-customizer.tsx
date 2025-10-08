"use client"

import { Textarea } from "@/components/ui/textarea"

import type { Shop } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Palette, Sparkles } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface ThemeCustomizerProps {
  shop: Shop
}

export function ThemeCustomizer({ shop }: ThemeCustomizerProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [themeColor, setThemeColor] = useState(shop.theme_color || "#3b82f6")
  const [themeGradient, setThemeGradient] = useState(shop.theme_gradient || "")
  const [darkMode, setDarkMode] = useState(shop.dark_mode ?? true)
  const [useGradient, setUseGradient] = useState(!!shop.theme_gradient)

  const gradientPresets = [
    { name: "Purple Dream", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Pink Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Ocean Blue", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Fresh Mint", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { name: "Warm Flame", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Deep Sea", value: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
    { name: "Soft Pastel", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { name: "Rose Gold", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
    { name: "Emerald", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
    { name: "Sunset Orange", value: "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)" },
    { name: "Royal Purple", value: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)" },
    { name: "Tropical", value: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)" },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("shops")
        .update({
          theme_color: themeColor,
          theme_gradient: useGradient ? themeGradient : null,
          dark_mode: darkMode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shop.id)

      if (error) throw error

      router.push(`/shop/${shop.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error saving theme:", error)
      alert("Failed to save theme. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const currentStyle = useGradient ? { background: themeGradient } : { backgroundColor: themeColor }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href={`/shop/edit/${shop.id}`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop Settings
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Theme Customization</h1>
            <p className="text-gray-600 dark:text-gray-400">{shop.name}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how your shop looks to visitors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Default Mode</Label>
                    <p className="text-sm text-gray-500">Choose the default appearance</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDarkMode(!darkMode)}
                    className={darkMode ? "bg-gray-900 text-white" : ""}
                  >
                    {darkMode ? "Dark" : "Light"}
                  </Button>
                </div>

                {/* Style Type */}
                <div className="space-y-2">
                  <Label className="text-base">Theme Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={!useGradient ? "default" : "outline"}
                      onClick={() => setUseGradient(false)}
                      className="h-12"
                    >
                      Solid Color
                    </Button>
                    <Button
                      type="button"
                      variant={useGradient ? "default" : "outline"}
                      onClick={() => setUseGradient(true)}
                      className="h-12 gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Gradient
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color/Gradient Selection */}
            <Card>
              <CardHeader>
                <CardTitle>{useGradient ? "Choose Gradient" : "Choose Color"}</CardTitle>
                <CardDescription>
                  {useGradient ? "Select a gradient or create your own" : "Pick a color that represents your brand"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!useGradient ? (
                  <>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-20 h-12"
                      />
                      <Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} placeholder="#3b82f6" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#6366f1"].map(
                        (color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setThemeColor(color)}
                            className={`h-12 rounded-lg border-2 transition-all ${
                              themeColor === color ? "border-gray-900 dark:border-white scale-110" : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {gradientPresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setThemeGradient(preset.value)}
                          className={`h-20 rounded-lg border-2 transition-all relative overflow-hidden ${
                            themeGradient === preset.value
                              ? "border-gray-900 dark:border-white scale-105"
                              : "border-gray-300"
                          }`}
                          style={{ background: preset.value }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium bg-black/20">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Gradient CSS</Label>
                      <Textarea
                        value={themeGradient}
                        onChange={(e) => setThemeGradient(e.target.value)}
                        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Theme...
                </>
              ) : (
                "Save Theme"
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your theme looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full" style={currentStyle} />
                    <div>
                      <h3 className="font-bold text-lg">{shop.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Shop</p>
                    </div>
                  </div>

                  <Button className="w-full h-12" style={currentStyle}>
                    Contact on WhatsApp
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="h-16 rounded-lg flex items-center justify-center text-white font-medium"
                      style={currentStyle}
                    >
                      Badge
                    </div>
                    <div
                      className="h-16 rounded-lg flex items-center justify-center text-white font-medium"
                      style={currentStyle}
                    >
                      Accent
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Product Name</span>
                      <span className="font-bold" style={{ color: useGradient ? themeColor : themeColor }}>
                        UGX 50,000
                      </span>
                    </div>
                    <Button size="sm" className="w-full" style={currentStyle}>
                      Order Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
