import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260905023000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "spike_delivery_office" (
        "id" text not null,
        "name" text not null,
        "governorate" text null,
        "city" text null,
        "phone" text null,
        "calculation_type" text not null default 'piece',
        "covered_cities" jsonb null,
        "active" boolean not null default true,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "spike_delivery_office_pkey" primary key ("id")
      );
    `)
    this.addSql(`
      create table if not exists "spike_vendor_delivery_setting" (
        "id" text not null,
        "actor_id" text not null,
        "office_ids" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "spike_vendor_delivery_setting_pkey" primary key ("id")
      );
    `)
    this.addSql(`create unique index if not exists "IDX_spike_vendor_delivery_actor" on "spike_vendor_delivery_setting" ("actor_id") where "deleted_at" is null;`)
    this.addSql(`
      create table if not exists "spike_seller_commission" (
        "id" text not null,
        "seller_id" text not null,
        "percent" numeric not null default 0,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "spike_seller_commission_pkey" primary key ("id")
      );
    `)
    this.addSql(`create unique index if not exists "IDX_spike_seller_commission_seller" on "spike_seller_commission" ("seller_id") where "deleted_at" is null;`)
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "spike_seller_commission" cascade;`)
    this.addSql(`drop table if exists "spike_vendor_delivery_setting" cascade;`)
    this.addSql(`drop table if exists "spike_delivery_office" cascade;`)
  }
}
