import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const PUBLIC_KEYS = [
  "marketplace_name",
  "default_currency",
  "currencies",
  "cod_enabled",
  "bank_transfer_enabled",
  "bank_accounts",
  "banner_items",
  "vendor_return_policy_enabled",
  "default_return_days",
  "default_return_policy",
  "spike_categories",
  "spike_collections",
  "home_sections",
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const rows = await spike.listSpikeSettings({}, { take: 200 })
  const raw = Object.fromEntries(rows.map((row: any) => [row.key, row.value]))
  const settings = Object.fromEntries(PUBLIC_KEYS.filter((key) => key in raw).map((key) => [key, raw[key]]))

  const activeSorted = (value: any) => Array.isArray(value)
    ? value.filter((item: any) => item?.enabled !== false).sort((a: any, b: any) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
    : []

  const banners = activeSorted(settings.banner_items)
  const bank_accounts = Array.isArray(settings.bank_accounts)
    ? settings.bank_accounts.filter((account: any) => account?.enabled !== false)
    : []
  const currencies = Array.isArray(settings.currencies)
    ? settings.currencies.filter((currency: any) => currency?.enabled !== false)
    : []

  res.json({
    spike: {
      ...settings,
      currencies,
      banner_items: banners,
      bank_accounts,
      spike_categories: activeSorted(settings.spike_categories),
      spike_collections: activeSorted(settings.spike_collections),
      home_sections: activeSorted(settings.home_sections),
    },
  })
}
