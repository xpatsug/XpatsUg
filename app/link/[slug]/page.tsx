"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2 } from "lucide-react"

export default function LockedLinkPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/locked-links/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to verify password")
        return
      }

      // Redirect to target URL or download file
      if (data.target_url) {
        window.location.href = data.target_url
      } else if (data.file_url) {
        window.open(data.file_url, "_blank")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Protected Link</CardTitle>
          <CardDescription>Enter the password to access this content</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isVerifying} style={{ backgroundColor: "#14A800" }}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
