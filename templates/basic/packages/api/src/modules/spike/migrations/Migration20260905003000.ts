import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260905003000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "spike_setting" (
        "id" text not null,
        "key" text not null,
        "value" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "spike_setting_pkey" primary key ("id")
      );
    `)
    this.addSql(`create unique index if not exists "IDX_spike_setting_key" on "spike_setting" ("key") where "deleted_at" is null;`)
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "spike_setting" cascade;`)
  }
}
