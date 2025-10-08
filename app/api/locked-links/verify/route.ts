import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { slug, password } = await request.json()

    if (!slug || !password) {
      return NextResponse.json({ error: "Slug and password are required" }, { status: 400 })
    }

    // Get locked link
    const { data: link, error } = await supabase.from("locked_links").select("*").eq("slug", slug).single()

    if (error || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Check if expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link has expired" }, { status: 403 })
    }

    // Check if max uses reached
    if (link.max_uses && link.uses_count >= link.max_uses) {
      return NextResponse.json({ error: "Link has reached maximum uses" }, { status: 403 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, link.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Increment uses count
    await supabase
      .from("locked_links")
      .update({ uses_count: link.uses_count + 1 })
      .eq("id", link.id)

    // Return the target URL or file URL
    return NextResponse.json({
      success: true,
      target_url: link.target_url,
      file_url: link.file_url,
      title: link.title,
    })
  } catch (error) {
    console.error("Error verifying locked link:", error)
    return NextResponse.json({ error: "Failed to verify link" }, { status: 500 })
  }
}
