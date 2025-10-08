export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Shop {
  id: string
  user_id: string
  slug?: string
  name: string
  description: string | null
  category: "product" | "service"
  categories?: string[]
  location: string | null
  profile_picture_url: string | null
  cover_picture_url: string | null
  resume_url: string | null
  hide_resume?: boolean
  hide_mobile_money?: boolean
  tiktok_url: string | null
  youtube_url: string | null
  whatsapp_number: string | null
  email_contact: string | null
  google_business_url: string | null
  theme_color: string
  theme_gradient: string | null
  dark_mode: boolean
  airtel_money: string | null
  mtn_momo: string | null
  views_count: number
  clicks_count: number
  created_at: string
  updated_at: string
}

export interface CustomLink {
  id: string
  shop_id: string
  title: string
  url: string
  position: number
  created_at: string
}

export interface Product {
  id: string
  shop_id: string
  slug?: string
  name: string
  description: string | null
  price: number
  currency: string
  image_urls: string[]
  video_url: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface LockedLink {
  id: string
  shop_id?: string
  user_id: string
  slug: string
  title: string
  target_url?: string
  file_url?: string
  max_uses?: number
  uses_count: number
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  shop_id: string
  items: Array<{
    product_id: string
    name: string
    price: number
    quantity: number
  }>
  total_price: number
  currency: string
  whatsapp_message?: string
  created_at: string
}

export interface Share {
  id: string
  shop_id?: string
  product_id?: string
  share_type: "shop" | "product" | "link"
  created_at: string
}
