import { useEffect, useState } from "react"

const currencies = [
  { code: "sar", label: "SAR" },
  { code: "usd", label: "USD" },
]

function productIdFromPath(path = location.pathname) {
  const match = path.match(/^\/dashboard\/products\/(prod_[^/]+)/)
  return match?.[1] || null
}

async function apiJson(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "include", ...init })
  if (!response.ok) throw new Error(`${response.status}`)
  return response.json()
}

export default function SpikeProductPriceHelper() {
  const [productId, setProductId] = useState<string | null>(() => productIdFromPath())
  const [product, setProduct] = useState<any>(null)
  const [currency, setCurrency] = useState("sar")
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const sync = () => setProductId(productIdFromPath())
    addEventListener("popstate", sync)
    const timer = setInterval(sync, 350)
    return () => { removeEventListener("popstate", sync); clearInterval(timer) }
  }, [])

  const load = async () => {
    if (!productId) return
    setStatus("جاري تحميل السعر...")
    try {
      const data = await apiJson(`/admin/products/${productId}?fields=id,title,*variants,*variants.prices`)
      const found = data.product
      setProduct(found)
      const next: Record<string, string> = {}
      ;(found?.variants || []).forEach((variant: any) => {
        const price = (variant.prices || []).find((item: any) => String(item.currency_code).toLowerCase() === currency)
        next[variant.id] = price?.amount === undefined || price?.amount === null ? "" : String(price.amount)
      })
      setPrices(next)
      setStatus("")
    } catch {
      setStatus("تعذر تحميل الأسعار")
    }
  }

  useEffect(() => { setProduct(null); setPrices({}); if (productId) load() }, [productId])
  useEffect(() => {
    if (!product) return
    const next: Record<string, string> = {}
    ;(product.variants || []).forEach((variant: any) => {
      const price = (variant.prices || []).find((item: any) => String(item.currency_code).toLowerCase() === currency)
      next[variant.id] = price?.amount === undefined || price?.amount === null ? "" : String(price.amount)
    })
    setPrices(next)
  }, [currency, product])

  const save = async () => {
    if (!productId || !product) return
    setSaving(true)
    setStatus("جاري حفظ السعر...")
    try {
      for (const variant of product.variants || []) {
        const raw = prices[variant.id]
        if (raw === "" || Number.isNaN(Number(raw))) continue
        const existing = (variant.prices || []).filter((item: any) => String(item.currency_code).toLowerCase() !== currency)
        const merged = [...existing.map((item: any) => ({ amount: Number(item.amount), currency_code: String(item.currency_code).toLowerCase() })), { amount: Number(raw), currency_code: currency }]
        await apiJson(`/admin/products/${productId}/variants/${variant.id}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prices: merged }),
        })
      }
      setStatus("تم حفظ السعر الأساسي ✓")
      await load()
    } catch {
      setStatus("تعذر الحفظ. استخدم Offers لهذا المنتج إذا كان سعر البائع هو المطلوب.")
    } finally {
      setSaving(false)
    }
  }

  if (!productId) return null

  return <aside className="spike-price-helper" dir="rtl">
    <div className="price-helper-head"><div><span className="eyebrow">Spike</span><strong>السعر السريع</strong></div><select value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map((item) => <option value={item.code} key={item.code}>{item.label}</option>)}</select></div>
    <p className="price-help-text">عدّل السعر الأساسي للـVariant من نفس صفحة المنتج. في المنتجات متعددة البائعين يمكن أن يكون سعر العرض في <b>Offers</b> هو السعر النهائي للعميل.</p>
    {!product ? <div className="price-loading">{status || "جاري التحميل..."}</div> : <>
      <div className="price-variants">{(product.variants || []).map((variant: any) => <label key={variant.id}><span>{variant.title || "Default variant"}</span><div className="price-input"><input type="number" min="0" step="0.01" value={prices[variant.id] ?? ""} onChange={(e) => setPrices((current) => ({ ...current, [variant.id]: e.target.value }))}/><em>{currency.toUpperCase()}</em></div></label>)}</div>
      <div className="price-actions"><button onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ السعر"}</button><a href="/dashboard/products/offers">فتح Offers</a></div>
      {status && <small className="price-status">{status}</small>}
    </>}
  </aside>
}
