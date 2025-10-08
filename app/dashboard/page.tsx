import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Store, Eye, MousePointerClick, Edit, ExternalLink, Palette, Package } from "lucide-react"
import Link from "next/link"
import { DeleteShopButton } from "@/components/delete-shop-button"
import type { Shop } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's shops
  const { data: shops, error } = await supabase
    .from("shops")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const userShops = (shops as Shop[]) || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">XpatsUg Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Shops</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your online shops and track performance</p>
          </div>
          <Link href="/shop/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create New Shop
            </Button>
          </Link>
        </div>

        {/* Shops Grid */}
        {userShops.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No shops yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first shop to start selling online</p>
              <Link href="/shop/create">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userShops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{shop.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{shop.description || "No description"}</CardDescription>
                    </div>
                    {shop.profile_picture_url && (
                      <img
                        src={shop.profile_picture_url || "/placeholder.svg"}
                        alt={shop.name}
                        className="h-12 w-12 rounded-lg object-cover ml-2"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span>{shop.views_count} views</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MousePointerClick className="h-4 w-4" />
                      <span>{shop.clicks_count} clicks</span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {shop.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/shop/${shop.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/shop/edit/${shop.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/shop/${shop.id}/theme`}>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Palette className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteShopButton shopId={shop.id} shopName={shop.name} />
                  </div>

                  <div className="pt-2">
                    <Link href={`/shop/${shop.id}/products/manage`} className="w-full">
                      <Button variant="default" className="w-full gap-2" size="sm">
                        <Package className="h-4 w-4" />
                        Manage Products
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
