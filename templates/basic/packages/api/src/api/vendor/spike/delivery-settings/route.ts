import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const actorId = (req: MedusaRequest) => (req as any).auth_context?.actor_id || (req as any).auth_context?.auth_identity_id

async function resolveSellerId(req: MedusaRequest, actor_id: string) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
    const { data } = await query.graph({
      entity: "seller_member",
      fields: ["seller.id"],
      filters: { member_id: actor_id },
      pagination: { take: 1 },
    })
    return data?.[0]?.seller?.id || null
  } catch {
    return null
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const actor_id = actorId(req)
  if (!actor_id) return res.status(401).json({ message: "Unauthorized" })
  const seller_id = await resolveSellerId(req, actor_id)
  const offices = await spike.listSpikeDeliveryOffices({ active: true }, { take: 500 })
  const rows = await spike.listSpikeVendorDeliverySettings({ actor_id }, { take: 1 })
  res.json({ offices, selected_office_ids: rows[0]?.office_ids || [], seller_id })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const actor_id = actorId(req)
  if (!actor_id) return res.status(401).json({ message: "Unauthorized" })
  const seller_id = await resolveSellerId(req, actor_id)
  const office_ids = Array.isArray((req.body as any)?.office_ids) ? (req.body as any).office_ids : []
  const rows = await spike.listSpikeVendorDeliverySettings({ actor_id }, { take: 1 })
  const payload = { office_ids, seller_id }
  const setting = rows.length
    ? await spike.updateSpikeVendorDeliverySettings({ id: rows[0].id, ...payload })
    : await spike.createSpikeVendorDeliverySettings({ actor_id, ...payload })
  res.json({ setting })
}
