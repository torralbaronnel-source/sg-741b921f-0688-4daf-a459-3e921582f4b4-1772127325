-- Ensure shop_id defaults to auth.uid() and is NOT NULL for products and categories
ALTER TABLE products ALTER COLUMN shop_id SET DEFAULT auth.uid();
ALTER TABLE categories ALTER COLUMN shop_id SET DEFAULT auth.uid();

-- Add a policy specifically for inserting if the default doesn't catch it
DROP POLICY IF EXISTS "Users can manage their own products" ON products;
CREATE POLICY "Users can manage their own products" ON products 
FOR ALL USING (auth.uid() = shop_id) 
WITH CHECK (auth.uid() = shop_id);

DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
CREATE POLICY "Users can manage their own categories" ON categories 
FOR ALL USING (auth.uid() = shop_id) 
WITH CHECK (auth.uid() = shop_id);