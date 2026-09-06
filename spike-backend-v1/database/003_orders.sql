ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_id uuid REFERENCES addresses(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending_review';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES users(id);
ALTER TABLE suborders ADD COLUMN IF NOT EXISTS vendor_amount numeric(14,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS vendor_payables (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid NOT NULL REFERENCES stores(id),
 suborder_id uuid UNIQUE NOT NULL REFERENCES suborders(id), amount numeric(14,2) NOT NULL,
 status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE TABLE IF NOT EXISTS order_status_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), suborder_id uuid NOT NULL REFERENCES suborders(id) ON DELETE CASCADE,
 status text NOT NULL, changed_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
