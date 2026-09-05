import { model } from "@medusajs/framework/utils"

export const SpikeProductRevision = model.define("spike_product_revision", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  seller_id: model.text().nullable(),
  offer_id: model.text().nullable(),
  status: model.text().default("pending"),
  changes: model.json(),
  rejection_reason: model.text().nullable(),
})
