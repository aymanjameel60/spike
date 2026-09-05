import { model } from "@medusajs/framework/utils"
export const SpikeDiscount = model.define("spike_discount", {
  id:model.id().primaryKey(), seller_id:model.text(), offer_id:model.text(), product_id:model.text(), product_title:model.text().nullable(),
  original_price:model.number(), discounted_price:model.number(), currency_code:model.text(), percentage:model.number(), active:model.boolean().default(false),
  status:model.text().default("pending"), rejection_reason:model.text().nullable(), request_type:model.text().default("discount"), coupon_code:model.text().nullable(),
  coupon_percentage:model.number().nullable(), target_type:model.text().nullable(), target_id:model.text().nullable(), usage_limit:model.number().nullable(),
})
