import { model } from "@medusajs/framework/utils"

export const SpikeVendorDeliverySetting = model.define("spike_vendor_delivery_setting", {
  id: model.id().primaryKey(),
  actor_id: model.text().unique(),
  seller_id: model.text().nullable(),
  office_ids: model.json().nullable(),
})
