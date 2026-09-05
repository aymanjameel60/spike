import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const rows = await spike.listSpikeSellerCommissions({}, { take: 500 })
  res.json({ commissions: rows })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const { seller_id, percent } = (req.body || {}) as any
  if (!seller_id) return res.status(400).json({ message: "seller_id is required" })
  const rows = await spike.listSpikeSellerCommissions({ seller_id }, { take: 1 })
  const value = Math.max(0, Number(percent) || 0)
  const commission = rows.length
    ? await spike.updateSpikeSellerCommissions({ id: rows[0].id, percent: value })
    : await spike.createSpikeSellerCommissions({ seller_id, percent: value })
  res.json({ commission })
}
