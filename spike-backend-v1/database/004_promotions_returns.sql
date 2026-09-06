CREATE TABLE IF NOT EXISTS product_discounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
 product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE, amount numeric(14,2) NOT NULL CHECK(amount>=0),
 enabled boolean NOT NULL DEFAULT true, starts_at timestamptz, ends_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coupons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
 product_id uuid REFERENCES products(id) ON DELETE CASCADE, code text UNIQUE NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>=0),
 status text NOT NULL DEFAULT 'pending_admin_review', enabled boolean NOT NULL DEFAULT true,
 starts_at timestamptz, ends_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS discount_amount numeric(14,2) NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS discount_source text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES coupons(id);
CREATE TABLE IF NOT EXISTS return_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL REFERENCES users(id),
 order_item_id uuid NOT NULL REFERENCES order_items(id), quantity integer NOT NULL CHECK(quantity>0), reason text NOT NULL,
 status text NOT NULL DEFAULT 'pending_admin_review', admin_note text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
