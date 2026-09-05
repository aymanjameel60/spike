import { model } from "@medusajs/framework/utils"
export const SpikeAuditLog = model.define("spike_audit_log", {
  id: model.id().primaryKey(), actor_id: model.text().nullable(), actor_type: model.text().nullable(),
  action: model.text(), entity_type: model.text(), entity_id: model.text().nullable(), before: model.json().nullable(), after: model.json().nullable(), note: model.text().nullable(),
})
