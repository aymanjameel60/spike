import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260905043000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`create table if not exists "spike_product_delivery" ("id" text not null, "product_id" text not null, "seller_id" text null, "delivery_office_id" text not null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "spike_product_delivery_pkey" primary key ("id"));`)
    this.addSql(`create unique index if not exists "IDX_spike_product_delivery_product" on "spike_product_delivery" ("product_id") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_spike_product_delivery_seller" on "spike_product_delivery" ("seller_id") where "deleted_at" is null;`)
    this.addSql(`create table if not exists "spike_notification" ("id" text not null, "audience" text not null, "seller_id" text null, "type" text not null, "title" text not null, "body" text null, "entity_type" text null, "entity_id" text null, "read" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "spike_notification_pkey" primary key ("id"));`)
    this.addSql(`create index if not exists "IDX_spike_notification_audience" on "spike_notification" ("audience", "seller_id", "read") where "deleted_at" is null;`)
    this.addSql(`create table if not exists "spike_product_revision" ("id" text not null, "product_id" text not null, "seller_id" text null, "offer_id" text null, "status" text not null default 'pending', "changes" jsonb not null, "rejection_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "spike_product_revision_pkey" primary key ("id"));`)
    this.addSql(`create index if not exists "IDX_spike_product_revision_status" on "spike_product_revision" ("status", "seller_id") where "deleted_at" is null;`)
  }
  async down(): Promise<void> {
    this.addSql(`drop table if exists "spike_product_revision" cascade;`)
    this.addSql(`drop table if exists "spike_notification" cascade;`)
    this.addSql(`drop table if exists "spike_product_delivery" cascade;`)
  }
}
