"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Chrome } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      console.error("[v0] Google sign-in error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during sign in")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">XpatsUg</h1>
          <p className="text-muted-foreground">Build your online shop in minutes</p>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">Sign in to manage your shops</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
              size="lg"
            >
              <Chrome className="mr-2 h-5 w-5" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
