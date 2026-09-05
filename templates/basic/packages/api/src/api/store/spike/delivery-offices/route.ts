import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const offices = await spike.listSpikeDeliveryOffices({ active: true }, { take: 500 })
  res.json({ offices })
}
