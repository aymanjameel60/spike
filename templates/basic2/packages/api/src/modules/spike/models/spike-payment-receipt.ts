import { model } from "@medusajs/framework/utils"

export const SpikePaymentReceipt = model.define("spike_payment_receipt", {
  id: model.id().primaryKey(),
  cart_id: model.text(),
  customer_id: model.text().nullable(),
  order_id: model.text().nullable(),
  receipt_url: model.text(),
  original_name: model.text().nullable(),
  status: model.text().default("pending"),
  note: model.text().nullable(),
})
