import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Shop, Product } from "@/lib/types"
import { ProductManagement } from "@/components/product-management"

export default async function ManageProductsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", id)
    .order("position", { ascending: true })

  return <ProductManagement shop={shop as Shop} products={(products as Product[]) || []} />
}
