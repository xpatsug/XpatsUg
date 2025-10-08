import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Shop, Product } from "@/lib/types"
import { ProductsView } from "@/components/products-view"

export default async function ProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch shop
  const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", id).single()

  if (shopError || !shop) {
    notFound()
  }

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", id)
    .order("position", { ascending: true })

  return <ProductsView shop={shop as Shop} products={(products as Product[]) || []} />
}
