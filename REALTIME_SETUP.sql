-- ============================================================================
-- itsecurity.az — required one-time database setup
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run multiple times (all statements are idempotent).
-- ============================================================================

-- 1) Add the 2nd/3rd product image columns (used by the Admin Products form
--    and the product gallery on the storefront).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_url_2 text,
  ADD COLUMN IF NOT EXISTS image_url_3 text;

-- 2) Enable Realtime so admin changes appear live for every visitor without
--    a page reload. Without this step, the app's live-sync code will run
--    but simply never receive any events.
--    (If a table is already in the publication, this raises a harmless
--    notice — ignore it.)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3) Make sure Row Level Security still allows public (anon) read access to
--    active products — realtime respects RLS, so if this policy is missing
--    or too strict, live updates for logged-out visitors will not arrive.
--    Uncomment and adjust if you don't already have an equivalent policy:

-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public can read active products"
--   ON public.products FOR SELECT
--   USING (is_active = true);

-- ============================================================================
-- Done. After running this once, refresh the app — new products, price
-- changes, and stock updates made in /admin/products will now appear
-- instantly for every visitor with the page open, and the two extra
-- product images will save and display correctly.
-- ============================================================================
