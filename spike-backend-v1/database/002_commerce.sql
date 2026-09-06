CREATE TABLE IF NOT EXISTS currencies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, name text NOT NULL,
 symbol text NOT NULL, rate_from_usd numeric(18,6) NOT NULL CHECK(rate_from_usd>0), enabled boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO currencies(code,name,symbol,rate_from_usd,enabled,sort_order) VALUES
('USD','US Dollar','$',1,true,0),('YER_OLD','Yemeni Rial - Old','ر.ي قديم',1,true,1),('YER_NEW','Yemeni Rial - New','ر.ي جديد',1,true,2)
ON CONFLICT(code) DO NOTHING;

CREATE TABLE IF NOT EXISTS cities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text UNIQUE NOT NULL, enabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS addresses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 city_id uuid NOT NULL REFERENCES cities(id), label text, recipient_name text NOT NULL, phone text NOT NULL,
 address_line text NOT NULL, latitude numeric(10,7), longitude numeric(10,7), is_active boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS delivery_offices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text NOT NULL, address text NOT NULL,
 latitude numeric(10,7), longitude numeric(10,7), enabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS delivery_office_cities (
 office_id uuid NOT NULL REFERENCES delivery_offices(id) ON DELETE CASCADE,
 city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE, PRIMARY KEY(office_id,city_id)
);
CREATE TABLE IF NOT EXISTS store_locations (
 store_id uuid PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE, city_id uuid NOT NULL REFERENCES cities(id),
 address text NOT NULL, latitude numeric(10,7) NOT NULL, longitude numeric(10,7) NOT NULL
);
ALTER TABLE suborders ADD COLUMN IF NOT EXISTS delivery_office_id uuid REFERENCES delivery_offices(id);
ALTER TABLE suborders ADD COLUMN IF NOT EXISTS distance_km numeric(10,2);
