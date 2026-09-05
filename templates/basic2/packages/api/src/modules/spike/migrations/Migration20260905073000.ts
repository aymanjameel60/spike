import { Migration } from "@medusajs/framework/mikro-orm/migrations"
export class Migration20260905073000 extends Migration {
 async up():Promise<void>{
  this.addSql(`alter table "spike_product_delivery" alter column "delivery_office_id" drop not null;`)
  this.addSql(`alter table "spike_product_delivery" add column if not exists "office_ids" jsonb null;`)
  this.addSql(`alter table "spike_product_delivery" add column if not exists "returnable" boolean not null default false;`)
  this.addSql(`alter table "spike_delivery_office" alter column "governorate" set not null;`)
  this.addSql(`alter table "spike_delivery_office" alter column "city" set not null;`)
  this.addSql(`alter table "spike_delivery_office" alter column "phone" set not null;`)
  this.addSql(`alter table "spike_delivery_office" add column if not exists "service_type" text not null default 'in_city';`)
  this.addSql(`alter table "spike_delivery_office" add column if not exists "routes" jsonb null;`)
  this.addSql(`alter table "spike_delivery_office" add column if not exists "latitude" double precision null;`)
  this.addSql(`alter table "spike_delivery_office" add column if not exists "longitude" double precision null;`)
  this.addSql(`create table if not exists "spike_audit_log" ("id" text not null,"actor_id" text null,"actor_type" text null,"action" text not null,"entity_type" text not null,"entity_id" text null,"before" jsonb null,"after" jsonb null,"note" text null,"created_at" timestamptz not null default now(),"updated_at" timestamptz not null default now(),"deleted_at" timestamptz null,constraint "spike_audit_log_pkey" primary key ("id"));`)
  this.addSql(`create table if not exists "spike_return_request" ("id" text not null,"order_id" text not null,"line_item_id" text not null,"product_id" text null,"seller_id" text not null,"customer_id" text null,"quantity" integer not null,"amount" numeric not null,"currency_code" text not null,"status" text not null default 'requested',"reason" text null,"rejection_reason" text null,"created_at" timestamptz not null default now(),"updated_at" timestamptz not null default now(),"deleted_at" timestamptz null,constraint "spike_return_request_pkey" primary key ("id"));`)
  this.addSql(`create table if not exists "spike_payable" ("id" text not null,"kind" text not null,"beneficiary_id" text null,"beneficiary_name" text null,"phone" text null,"order_id" text null,"reference_id" text null,"amount" numeric not null,"currency_code" text not null,"status" text not null default 'pending',"note" text null,"created_at" timestamptz not null default now(),"updated_at" timestamptz not null default now(),"deleted_at" timestamptz null,constraint "spike_payable_pkey" primary key ("id"));`)
  this.addSql(`create index if not exists "IDX_spike_payable_kind_status" on "spike_payable" ("kind","status") where "deleted_at" is null;`)
 }
 async down():Promise<void>{}
}
