-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('product', 'service')),
  location TEXT,
  profile_picture_url TEXT,
  cover_picture_url TEXT,
  resume_url TEXT,
  
  -- Social media links
  tiktok_url TEXT,
  youtube_url TEXT,
  whatsapp_number TEXT,
  email_contact TEXT,
  google_business_url TEXT,
  
  -- Theme settings
  theme_color TEXT DEFAULT '#3b82f6',
  theme_gradient TEXT,
  dark_mode BOOLEAN DEFAULT true,
  
  -- Mobile Money
  airtel_money TEXT,
  mtn_momo TEXT,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create custom links table (unlimited links)
CREATE TABLE IF NOT EXISTS public.custom_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products/services table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX',
  image_urls TEXT[], -- Array of image URLs
  video_url TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Shops policies
CREATE POLICY "Anyone can view shops"
  ON public.shops FOR SELECT
  USING (true);

CREATE POLICY "Users can create own shops"
  ON public.shops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shops"
  ON public.shops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shops"
  ON public.shops FOR DELETE
  USING (auth.uid() = user_id);

-- Custom links policies
CREATE POLICY "Anyone can view custom links"
  ON public.custom_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own shop links"
  ON public.custom_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = custom_links.shop_id
      AND shops.user_id = auth.uid()
    )
  );

-- Products policies
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own shop products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id
      AND shops.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON public.shops(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_links_shop_id ON public.custom_links(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
