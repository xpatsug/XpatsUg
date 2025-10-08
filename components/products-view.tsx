"use client"

import type { Shop, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Share2, ShoppingCart, MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"

interface ProductsViewProps {
  shop: Shop
  products: Product[]
}

export function ProductsView({ shop, products }: ProductsViewProps) {
  const [isDark, setIsDark] = useState(shop.dark_mode)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const calculateTotal = () => {
    return products.filter((p) => selectedProducts.has(p.id)).reduce((sum, p) => sum + Number(p.price), 0)
  }

  const handleWhatsAppOrder = () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one item")
      return
    }

    const selectedItems = products.filter((p) => selectedProducts.has(p.id))
    const orderText = `Hello! I would like to order:\n\n${selectedItems
      .map((item) => `- ${item.name} (${item.currency} ${item.price.toLocaleString()})`)
      .join("\n")}\n\nTotal: ${shop.currency || "UGX"} ${calculateTotal().toLocaleString()}`

    const whatsappUrl = `https://wa.me/${shop.whatsapp_number?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(orderText)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shop.name} - Products`,
          text: `Check out products from ${shop.name}`,
          url,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  const themeStyle = shop.theme_gradient
    ? { background: shop.theme_gradient }
    : { backgroundColor: shop.theme_color || "#3b82f6" }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link href={`/shop/${shop.id}`}>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-base sm:text-lg truncate">{shop.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {shop.category === "product" ? "Products" : "Services"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleShare} className="shrink-0 bg-transparent">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {products.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No items yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Check back soon for new items</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-24">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  shop={shop}
                  isSelected={selectedProducts.has(product.id)}
                  onToggle={() => toggleProduct(product.id)}
                />
              ))}
            </div>

            {/* Selection Summary */}
            {selectedProducts.size > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg p-3 sm:p-4 z-50">
                <div className="container mx-auto max-w-4xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {selectedProducts.size} item{selectedProducts.size > 1 ? "s" : ""} selected
                      </p>
                      <p className="text-lg sm:text-xl font-bold">
                        {shop.currency || "UGX"} {calculateTotal().toLocaleString()}
                      </p>
                    </div>
                    {shop.whatsapp_number && (
                      <Button
                        onClick={handleWhatsAppOrder}
                        size="lg"
                        className="gap-2 w-full sm:w-auto"
                        style={themeStyle}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Order on WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
