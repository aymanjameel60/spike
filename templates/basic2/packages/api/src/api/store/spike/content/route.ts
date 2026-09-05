import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const PUBLIC_KEYS = [
  "marketplace_name",
  "default_currency",
  "enabled_currencies",
  "exchange_usd_sar",
  "exchange_usd_yer_old",
  "exchange_usd_yer_new",
  "cod_enabled",
  "bank_transfer_enabled",
  "bank_accounts",
  "banner_items",
  "vendor_return_policy_enabled",
  "default_return_days",
  "default_return_policy",
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const rows = await spike.listSpikeSettings({}, { take: 200 })
  const raw = Object.fromEntries(rows.map((row: any) => [row.key, row.value]))
  const settings = Object.fromEntries(PUBLIC_KEYS.filter((key) => key in raw).map((key) => [key, raw[key]]))

  const banners = Array.isArray(settings.banner_items)
    ? settings.banner_items.filter((banner: any) => banner?.enabled !== false).sort((a: any, b: any) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
    : []

  const bank_accounts = Array.isArray(settings.bank_accounts)
    ? settings.bank_accounts.filter((account: any) => account?.enabled !== false)
    : []

  res.json({
    spike: {
      ...settings,
      banner_items: banners,
      bank_accounts,
    },
  })
}
