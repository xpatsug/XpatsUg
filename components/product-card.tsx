"use client"

import type { Product, Shop } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCircle, Share2, Play } from "lucide-react"
import { useState } from "react"

interface ProductCardProps {
  product: Product
  shop: Shop
  isSelected: boolean
  onToggle: () => void
}

export function ProductCard({ product, shop, isSelected, onToggle }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleSingleOrder = () => {
    const orderText = `Hello! I would like to order:\n\n${product.name}\nPrice: ${product.currency} ${product.price.toLocaleString()}\n\n${product.description || ""}`
    const whatsappUrl = `https://wa.me/${shop.whatsapp_number?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(orderText)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/shop/${shop.id}/products`
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${product.currency} ${product.price.toLocaleString()}`,
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
    <Card
      className={`overflow-hidden transition-all ${isSelected ? "ring-2" : ""}`}
      style={isSelected ? { borderColor: shop.theme_color } : {}}
    >
      <div className="relative">
        {/* Image Gallery */}
        {product.image_urls && product.image_urls.length > 0 && (
          <div className="relative">
            <img
              src={product.image_urls[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 sm:h-56 md:h-64 object-cover"
            />
            {product.image_urls.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {product.image_urls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video Link */}
        {product.video_url && (
          <a
            href={product.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
          >
            <Play className="h-4 w-4" />
          </a>
        )}

        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md cursor-pointer" onClick={onToggle}>
            <Checkbox checked={isSelected} />
          </div>
        </div>
      </div>

      <CardContent className="p-4 pt-5">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-bold" style={{ color: shop.theme_color }}>
            {product.currency} {product.price.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {shop.whatsapp_number && (
            <Button onClick={handleSingleOrder} className="flex-1 gap-2" size="sm" style={themeStyle}>
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Order</span>
              <span className="sm:hidden">Order on WhatsApp</span>
            </Button>
          )}
          <Button onClick={handleShare} variant="outline" size="sm" className="gap-2 bg-transparent sm:w-auto">
            <Share2 className="h-4 w-4" />
            <span className="sm:hidden">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
