import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Store, Eye, MousePointerClick, Edit, ExternalLink, Palette, Package, Lock } from "lucide-react"
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">XpatsUg</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/link-locker">
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex bg-transparent">
                <Lock className="h-4 w-4" />
                Link Locker
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">My Shops</h2>
            <p className="text-muted-foreground">Manage your online shops and track performance</p>
          </div>
          <Link href="/shop/create">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-5 w-5" />
              Create New Shop
            </Button>
          </Link>
        </div>

        {/* Shops Grid */}
        {userShops.length === 0 ? (
          <Card className="text-center py-16 shadow-sm">
            <CardContent>
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No shops yet</h3>
              <p className="text-muted-foreground mb-6">Create your first shop to start selling online</p>
              <Link href="/shop/create">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userShops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1 truncate">{shop.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{shop.description || "No description"}</CardDescription>
                    </div>
                    {shop.profile_picture_url && (
                      <img
                        src={shop.profile_picture_url || "/placeholder.svg"}
                        alt={shop.name}
                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{shop.views_count} views</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MousePointerClick className="h-4 w-4" />
                      <span>{shop.clicks_count} clicks</span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {shop.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/shop/${shop.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    <Link href={`/shop/edit/${shop.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
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
