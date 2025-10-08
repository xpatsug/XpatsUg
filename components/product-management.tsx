"use client"

import type { Shop, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Loader2, ArrowLeft, ImageIcon } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface ProductManagementProps {
  shop: Shop
  products: Product[]
}

export function ProductManagement({ shop, products: initialProducts }: ProductManagementProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState<string | null>(null)

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrls: [] as string[],
    videoUrl: "",
  })

  const handleImageUpload = async (file: File, productId?: string) => {
    setIsUploading(productId || "new")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      if (productId) {
        // Add to existing product
        const product = products.find((p) => p.id === productId)
        if (product) {
          const updatedProduct = {
            ...product,
            image_urls: [...(product.image_urls || []), data.url],
          }
          setProducts(products.map((p) => (p.id === productId ? updatedProduct : p)))
        }
      } else {
        // Add to new product
        setNewProduct({
          ...newProduct,
          imageUrls: [...newProduct.imageUrls, data.url],
        })
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.")
    } finally {
      setIsUploading(null)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please fill in product name and price")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("products").insert({
        shop_id: shop.id,
        name: newProduct.name,
        description: newProduct.description,
        price: Number.parseFloat(newProduct.price),
        currency: shop.currency || "UGX",
        image_urls: newProduct.imageUrls,
        video_url: newProduct.videoUrl || null,
        position: products.length,
      })

      if (error) throw error

      setNewProduct({ name: "", description: "", price: "", imageUrls: [], videoUrl: "" })
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product. Please try again.")
      return
    }

    setProducts(products.filter((p) => p.id !== productId))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Manage Products</h1>
            <p className="text-gray-600 dark:text-gray-400">{shop.name}</p>
          </div>
          <Link href={`/shop/${shop.id}/products`}>
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              View Shop
            </Button>
          </Link>
        </div>

        {/* Add New Product */}
        {isAdding ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Price (UGX) *</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProduct.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url || "/placeholder.svg"}
                      alt=""
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded object-cover"
                    />
                  ))}
                </div>
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  disabled={isUploading === "new"}
                />
                <p className="text-xs text-gray-500">Supported: JPG, PNG, GIF, WebP, SVG, BMP, TIFF (max 10MB)</p>
                {isUploading === "new" && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Video URL (optional)</Label>
                <Input
                  value={newProduct.videoUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/... or https://tiktok.com/..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAddProduct} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="mb-6 gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first product to start selling</p>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {product.image_urls?.[0] && (
                      <img
                        src={product.image_urls[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="h-32 w-full sm:h-24 sm:w-24 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
                      )}
                      <p className="text-lg font-bold mt-2">
                        {product.currency} {product.price.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="self-start sm:self-center"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
