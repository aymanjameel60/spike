import { useEffect, useState } from "react"
import "./vendor-spike.css"

declare const __BACKEND_URL__: string

type Settings = Record<string, any>

export default function ExchangeBar() {
  const [settings, setSettings] = useState<Settings | null>(null)
  useEffect(() => {
    fetch(`${__BACKEND_URL__}/vendor/spike/exchange-rates`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setSettings(d.settings || {}))
      .catch(() => setSettings(null))
  }, [])
  if (!settings) return null
  const parts = [
    settings.exchange_usd_sar != null ? `USD/SAR ${settings.exchange_usd_sar}` : null,
    settings.exchange_usd_yer_old != null ? `USD/YER قديم ${settings.exchange_usd_yer_old}` : null,
    settings.exchange_usd_yer_new != null ? `USD/YER جديد ${settings.exchange_usd_yer_new}` : null,
  ].filter(Boolean)
  if (!parts.length) return null
  return <div className="spike-fx-bar" dir="rtl"><strong>سعر الصرف المعتمد:</strong> {parts.join("  •  ")}</div>
}
