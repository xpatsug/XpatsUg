"use client"

import type { Shop, CustomLink, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Share2,
  ShoppingBag,
  MessageCircle,
  Moon,
  Sun,
  Package,
  Edit,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface ShopProfileProps {
  shop: Shop
  customLinks: CustomLink[]
  products: Product[]
  isOwner?: boolean
}

export function ShopProfile({ shop, customLinks, products, isOwner = false }: ShopProfileProps) {
  const [isDark, setIsDark] = useState(shop.dark_mode)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          text: shop.description || `Check out ${shop.name}`,
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

  const handleLinkClick = async (linkUrl: string) => {
    const supabase = createClient()
    await supabase
      .from("shops")
      .update({ clicks_count: shop.clicks_count + 1 })
      .eq("id", shop.id)
  }

  const themeStyle = shop.theme_gradient
    ? { background: shop.theme_gradient }
    : { backgroundColor: shop.theme_color || "#3b82f6" }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Cover Image */}
      {shop.cover_picture_url && (
        <div className="w-full h-48 md:h-64 relative">
          <img src={shop.cover_picture_url || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6 -mt-16 relative z-10">
          {shop.profile_picture_url && (
            <img
              src={shop.profile_picture_url || "/placeholder.svg"}
              alt={shop.name}
              className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
            />
          )}
          <div className="flex-1 mt-16 md:mt-20">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{shop.name}</h1>
                {shop.location && (
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {shop.location}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsDark(!isDark)}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link href={`/shop/edit/${shop.id}`}>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Edit Shop
              </Button>
            </Link>
            <Link href={`/shop/${shop.id}/products/manage`}>
              <Button className="w-full gap-2" style={themeStyle}>
                <Package className="h-4 w-4" />
                Manage Products
              </Button>
            </Link>
          </div>
        )}

        {/* Description */}
        {shop.description && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{shop.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Category Badge */}
        <div className="mb-6">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            style={{ ...themeStyle, color: "white" }}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            {shop.category === "product" ? "Products" : "Services"}
          </span>
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {shop.whatsapp_number && (
            <a
              href={`https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(`whatsapp:${shop.whatsapp_number}`)}
            >
              <Button className="w-full gap-2 h-12" style={themeStyle}>
                <MessageCircle className="h-5 w-5" />
                Contact on WhatsApp
              </Button>
            </a>
          )}

          {shop.email_contact && (
            <a href={`mailto:${shop.email_contact}`} onClick={() => handleLinkClick(`mailto:${shop.email_contact}`)}>
              <Button variant="outline" className="w-full gap-2 h-12 bg-transparent">
                <Mail className="h-5 w-5" />
                {shop.email_contact}
              </Button>
            </a>
          )}

          {shop.resume_url && (
            <a
              href={shop.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(shop.resume_url!)}
            >
              <Button variant="outline" className="w-full gap-2 h-12 bg-transparent">
                <FileText className="h-5 w-5" />
                View Resume
              </Button>
            </a>
          )}
        </div>

        {/* Social Media Links */}
        {(shop.tiktok_url || shop.youtube_url || shop.google_business_url) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Follow Us</h3>
              <div className="space-y-2">
                {shop.tiktok_url && (
                  <a
                    href={shop.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(shop.tiktok_url!)}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                    TikTok
                  </a>
                )}
                {shop.youtube_url && (
                  <a
                    href={shop.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(shop.youtube_url!)}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                    YouTube
                  </a>
                )}
                {shop.google_business_url && (
                  <a
                    href={shop.google_business_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(shop.google_business_url!)}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Google My Business
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Money */}
        {(shop.airtel_money || shop.mtn_momo) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Mobile Money</h3>
              <div className="space-y-2">
                {shop.airtel_money && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Airtel Money:</span>
                    <span>{shop.airtel_money}</span>
                  </div>
                )}
                {shop.mtn_momo && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">MTN Momo:</span>
                    <span>{shop.mtn_momo}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Links */}
        {customLinks.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Links</h3>
              <div className="space-y-2">
                {customLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link.url)}
                  >
                    <Button variant="outline" className="w-full justify-between h-12 bg-transparent">
                      <span>{link.title}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Preview */}
        {products.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {shop.category === "product" ? "Products" : "Services"}
                </h3>
                <Link href={`/shop/${shop.id}/products`}>
                  <Button variant="outline" size="sm" style={themeStyle}>
                    View All
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/shop/${shop.id}/products`}>
                    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {product.image_urls?.[0] && (
                        <img
                          src={product.image_urls[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-2">
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        <p className="text-sm font-semibold" style={{ color: shop.theme_color }}>
                          {product.currency} {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
