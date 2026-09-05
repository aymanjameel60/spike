import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260905033000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`alter table if exists "spike_vendor_delivery_setting" add column if not exists "seller_id" text null;`)
    this.addSql(`create index if not exists "IDX_spike_vendor_delivery_seller" on "spike_vendor_delivery_setting" ("seller_id") where "deleted_at" is null;`)
  }

  async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_spike_vendor_delivery_seller";`)
    this.addSql(`alter table if exists "spike_vendor_delivery_setting" drop column if exists "seller_id";`)
  }
}
