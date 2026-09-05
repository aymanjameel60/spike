import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260905063000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`alter table "spike_notification" add column if not exists "customer_id" text null;`)
    this.addSql(`create index if not exists "IDX_spike_notification_customer" on "spike_notification" ("customer_id", "read") where "deleted_at" is null;`)
    this.addSql(`alter table "spike_discount" add column if not exists "status" text not null default 'pending';`)
    this.addSql(`alter table "spike_discount" add column if not exists "rejection_reason" text null;`)
    this.addSql(`alter table "spike_discount" add column if not exists "request_type" text not null default 'discount';`)
    this.addSql(`alter table "spike_discount" add column if not exists "coupon_code" text null;`)
    this.addSql(`alter table "spike_discount" add column if not exists "coupon_percentage" integer null;`)
    this.addSql(`alter table "spike_discount" add column if not exists "target_type" text null;`)
    this.addSql(`alter table "spike_discount" add column if not exists "target_id" text null;`)
    this.addSql(`alter table "spike_discount" add column if not exists "usage_limit" integer null;`)
    this.addSql(`update "spike_discount" set "status"='approved' where "active"=true and "status"='pending';`)
  }
  async down(): Promise<void> {}
}
