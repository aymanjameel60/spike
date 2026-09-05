import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const keys = ["default_currency", "enabled_currencies", "exchange_usd_sar", "exchange_usd_yer_old", "exchange_usd_yer_new", "commission_percent"]
  const rows = await spike.listSpikeSettings({}, { take: 200 })
  const settings = Object.fromEntries(rows.filter((r: any) => keys.includes(r.key)).map((r: any) => [r.key, r.value]))
  res.json({ settings })
}
