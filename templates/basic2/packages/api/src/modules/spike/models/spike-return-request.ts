import { model } from "@medusajs/framework/utils"
export const SpikeReturnRequest = model.define("spike_return_request", {
  id:model.id().primaryKey(), order_id:model.text(), line_item_id:model.text(), product_id:model.text().nullable(), seller_id:model.text(), customer_id:model.text().nullable(),
  quantity:model.number(), amount:model.number(), currency_code:model.text(), status:model.text().default("requested"), reason:model.text().nullable(), rejection_reason:model.text().nullable(),
})
