import { model } from "@medusajs/framework/utils"

export const SpikeSetting = model.define("spike_setting", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  value: model.json().nullable(),
})
