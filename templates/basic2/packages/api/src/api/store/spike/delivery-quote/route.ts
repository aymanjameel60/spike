import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const { office_id, city, quantity = 1, weight_kg = 0 } = (req.body || {}) as any
  if (!office_id || !city) return res.status(400).json({ message: "office_id and city are required" })
  const rows = await spike.listSpikeDeliveryOffices({ id: office_id, active: true }, { take: 1 })
  const office = rows[0]
  if (!office) return res.status(404).json({ message: "Delivery office not found" })
  const coverage = Array.isArray(office.covered_cities) ? office.covered_cities : []
  const rateRow = coverage.find((x: any) => String(x.city || "").trim().toLowerCase() === String(city).trim().toLowerCase())
  if (!rateRow) return res.status(422).json({ message: "This office does not cover the selected city" })
  const rate = Number(rateRow.rate) || 0
  const units = office.calculation_type === "kg" ? Math.max(0, Number(weight_kg) || 0) : Math.max(1, Number(quantity) || 1)
  res.json({ office_id, city, calculation_type: office.calculation_type, rate, units, amount: rate * units })
}
