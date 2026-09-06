CREATE TABLE IF NOT EXISTS payment_settings (method text PRIMARY KEY CHECK(method IN ('cod','transfer')), enabled boolean NOT NULL DEFAULT true, instructions text, updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO payment_settings(method,enabled) VALUES('cod',true),('transfer',true) ON CONFLICT(method) DO NOTHING;
ALTER TABLE delivery_offices ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);
ALTER TABLE suborders ADD COLUMN IF NOT EXISTS delivery_status text;
