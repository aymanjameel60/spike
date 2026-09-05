import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type SettingInput = { key: string; value: unknown }

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const rows = await spike.listSpikeSettings({}, { take: 200 })
  const settings = Object.fromEntries(rows.map((row: any) => [row.key, row.value]))
  res.json({ settings })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const body = (req.body || {}) as { settings?: Record<string, unknown> }
  const entries: SettingInput[] = Object.entries(body.settings || {}).map(([key, value]) => ({ key, value }))

  for (const entry of entries) {
    const existing = await spike.listSpikeSettings({ key: entry.key }, { take: 1 })
    if (existing.length) {
      await spike.updateSpikeSettings({ id: existing[0].id, value: entry.value })
    } else {
      await spike.createSpikeSettings(entry)
    }
  }

  const rows = await spike.listSpikeSettings({}, { take: 200 })
  res.json({ settings: Object.fromEntries(rows.map((row: any) => [row.key, row.value])) })
}
