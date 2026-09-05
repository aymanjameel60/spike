import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260905053000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`create table if not exists "spike_discount" ("id" text not null, "seller_id" text not null, "offer_id" text not null, "product_id" text not null, "product_title" text null, "original_price" numeric not null, "discounted_price" numeric not null, "currency_code" text not null, "percentage" integer not null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "spike_discount_pkey" primary key ("id"));`)
    this.addSql(`create index if not exists "IDX_spike_discount_seller" on "spike_discount" ("seller_id", "active") where "deleted_at" is null;`)
    this.addSql(`create unique index if not exists "IDX_spike_discount_offer_active" on "spike_discount" ("offer_id") where "deleted_at" is null and "active" = true;`)
    this.addSql(`create table if not exists "spike_payment_receipt" ("id" text not null, "cart_id" text not null, "customer_id" text null, "order_id" text null, "receipt_url" text not null, "original_name" text null, "status" text not null default 'pending', "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "spike_payment_receipt_pkey" primary key ("id"));`)
    this.addSql(`create index if not exists "IDX_spike_payment_receipt_cart" on "spike_payment_receipt" ("cart_id") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_spike_payment_receipt_order" on "spike_payment_receipt" ("order_id") where "deleted_at" is null;`)
  }
  async down(): Promise<void> {
    this.addSql(`drop table if exists "spike_payment_receipt" cascade;`)
    this.addSql(`drop table if exists "spike_discount" cascade;`)
  }
}
