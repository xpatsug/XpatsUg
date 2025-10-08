import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { generateUniqueSlug } from "@/lib/utils/slug"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, target_url, file_url, password, max_uses, expires_at, shop_id } = body

    if (!title || !password) {
      return NextResponse.json({ error: "Title and password are required" }, { status: 400 })
    }

    if (!target_url && !file_url) {
      return NextResponse.json({ error: "Either target_url or file_url is required" }, { status: 400 })
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10)

    // Generate unique slug
    const slug = generateUniqueSlug(title)

    // Create locked link
    const { data, error } = await supabase
      .from("locked_links")
      .insert({
        user_id: user.id,
        shop_id: shop_id || null,
        slug,
        title,
        target_url: target_url || null,
        file_url: file_url || null,
        password_hash,
        max_uses: max_uses || null,
        expires_at: expires_at || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, slug })
  } catch (error) {
    console.error("Error creating locked link:", error)
    return NextResponse.json({ error: "Failed to create locked link" }, { status: 500 })
  }
}
