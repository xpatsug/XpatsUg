import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Shop, CustomLink, Product } from "@/lib/types"
import { ShopProfile } from "@/components/shop-profile"

export default async function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch shop
  const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", id).single()

  if (shopError || !shop) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("shops")
    .update({ views_count: shop.views_count + 1 })
    .eq("id", id)

  // Fetch custom links
  const { data: customLinks } = await supabase
    .from("custom_links")
    .select("*")
    .eq("shop_id", id)
    .order("position", { ascending: true })

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", id)
    .order("position", { ascending: true })

  return (
    <ShopProfile
      shop={shop as Shop}
      customLinks={(customLinks as CustomLink[]) || []}
      products={(products as Product[]) || []}
      isOwner={user?.id === shop.user_id}
    />
  )
}
