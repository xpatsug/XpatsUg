import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShopForm } from "@/components/shop-form"
import type { Shop, CustomLink } from "@/lib/types"

export default async function EditShopPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch custom links
  const { data: customLinks } = await supabase
    .from("custom_links")
    .select("*")
    .eq("shop_id", id)
    .order("position", { ascending: true })

  return <ShopForm shop={shop as Shop} customLinks={(customLinks as CustomLink[]) || []} />
}
