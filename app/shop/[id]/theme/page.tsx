import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Shop } from "@/lib/types"
import { ThemeCustomizer } from "@/components/theme-customizer"

export default async function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch shop
  const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", id).single()

  if (shopError || !shop || shop.user_id !== user.id) {
    redirect("/dashboard")
  }

  return <ThemeCustomizer shop={shop as Shop} />
}
