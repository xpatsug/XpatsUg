import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShopForm } from "@/components/shop-form"

export default async function CreateShopPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ShopForm />
}
