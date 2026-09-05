import { model } from "@medusajs/framework/utils"
export const SpikePayable = model.define("spike_payable", {
  id:model.id().primaryKey(), kind:model.text(), beneficiary_id:model.text().nullable(), beneficiary_name:model.text().nullable(), phone:model.text().nullable(), order_id:model.text().nullable(), reference_id:model.text().nullable(), amount:model.number(), currency_code:model.text(), status:model.text().default("pending"), note:model.text().nullable(),
})
