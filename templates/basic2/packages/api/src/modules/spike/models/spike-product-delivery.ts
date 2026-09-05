import { model } from "@medusajs/framework/utils"
export const SpikeProductDelivery = model.define("spike_product_delivery", {
  id:model.id().primaryKey(), product_id:model.text().unique(), seller_id:model.text().nullable(), delivery_office_id:model.text().nullable(), office_ids:model.json().nullable(), returnable:model.boolean().default(false), active:model.boolean().default(true),
})
