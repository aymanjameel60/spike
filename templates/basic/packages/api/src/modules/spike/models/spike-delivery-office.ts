import { model } from "@medusajs/framework/utils"
export const SpikeDeliveryOffice = model.define("spike_delivery_office", {
  id:model.id().primaryKey(), name:model.text(), governorate:model.text(), city:model.text(), phone:model.text(),
  service_type:model.text().default("in_city"), calculation_type:model.text().default("distance"), covered_cities:model.json().nullable(), routes:model.json().nullable(), latitude:model.number().nullable(), longitude:model.number().nullable(), active:model.boolean().default(true),
})
