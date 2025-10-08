-- Add slug fields to shops and products
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add privacy settings to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS hide_resume BOOLEAN DEFAULT false;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS hide_mobile_money BOOLEAN DEFAULT false;

-- Update category to support multiple categories (stored as JSON array)
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '["product"]'::jsonb;

-- Create locked_links table for Link Locker feature
CREATE TABLE IF NOT EXISTS public.locked_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  target_url TEXT,
  file_url TEXT,
  password_hash TEXT NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table to log WhatsApp orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX',
  whatsapp_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table for analytics
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('shop', 'product', 'link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.locked_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Locked links policies
CREATE POLICY "Anyone can view locked links metadata"
  ON public.locked_links FOR SELECT
  USING (true);

CREATE POLICY "Users can create own locked links"
  ON public.locked_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locked links"
  ON public.locked_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own locked links"
  ON public.locked_links FOR DELETE
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Shop owners can view their orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = orders.shop_id
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Shares policies
CREATE POLICY "Shop owners can view their shares"
  ON public.shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shares.shop_id
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create shares"
  ON public.shares FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_locked_links_slug ON public.locked_links(slug);
CREATE INDEX IF NOT EXISTS idx_locked_links_user_id ON public.locked_links(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shares_shop_id ON public.shares(shop_id);
CREATE INDEX IF NOT EXISTS idx_shares_product_id ON public.shares(product_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(shop_id, slug);

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_slug(base_text TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9\s-]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Ensure slug is not empty
  IF slug = '' THEN
    slug := 'item';
  END IF;
  
  -- Check uniqueness and append counter if needed
  WHILE EXISTS (
    SELECT 1 FROM public.shops WHERE shops.slug = slug
    UNION ALL
    SELECT 1 FROM public.products WHERE products.slug = slug
  ) LOOP
    counter := counter + 1;
    slug := slug || '-' || counter;
  END LOOP;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;
