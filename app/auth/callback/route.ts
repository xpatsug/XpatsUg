import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Auth callback error:", error)
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
      }
    } catch (error) {
      console.error("[v0] Auth callback exception:", error)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${origin}/dashboard`)
}
