import { model } from "@medusajs/framework/utils"

export const SpikeSellerCommission = model.define("spike_seller_commission", {
  id: model.id().primaryKey(),
  seller_id: model.text().unique(),
  percent: model.number(),
})
