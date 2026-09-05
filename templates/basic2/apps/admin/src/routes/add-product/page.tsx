import { useEffect, useMemo, useState } from "react"
import type { CSSProperties, FormEvent, ReactNode } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"

declare const __BACKEND_URL__: string

export const config: RouteConfig = {
  label: "إضافة منتج",
  rank: 19,
}

type Seller = { id: string; name?: string; email?: string }
type Category = { id: string; name?: string; title?: string }

type FormState = {
  title: string
  description: string
  category_id: string
  seller_id: string
  image_url: string
  price: string
  compare_at_price: string
  quantity: string
  sku: string
  currency: string
}

const initial: FormState = {
  title: "",
  description: "",
  category_id: "",
  seller_id: "",
  image_url: "",
  price: "",
  compare_at_price: "",
  quantity: "0",
  sku: "",
  currency: "SAR",
}

function apiBase() {
  try { return String(__BACKEND_URL__ || "http://localhost:9000").replace(/\/$/, "") } catch { return "http://localhost:9000" }
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBase()}${path}`, {
    credentials: "include",
    ...init,
    headers: { ...(init?.body ? { "content-type": "application/json" } : {}), ...(init?.headers || {}) },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) throw new Error(String(data?.message || data?.error || text || `HTTP ${response.status}`))
  return data
}

function makeSku(title: string) {
  const seed = title.normalize("NFKD").replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 18).toUpperCase()
  return `SPK-${seed || "ITEM"}-${Date.now().toString().slice(-5)}`
}

export default function SimpleAdminProductPage() {
  const [form, setForm] = useState<FormState>(initial)
  const [sellers, setSellers] = useState<Seller[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    Promise.allSettled([api("/admin/sellers?limit=100"), api("/admin/product-categories?limit=100")]).then(([sellerResult, categoryResult]) => {
      if (sellerResult.status === "fulfilled") setSellers(sellerResult.value.sellers || [])
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.product_categories || categoryResult.value.categories || [])
    })
  }, [])

  const autoSku = useMemo(() => form.sku || makeSku(form.title), [form.sku, form.title])
  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    try {
      if (!form.title.trim()) throw new Error("اكتب اسم المنتج")
      if (!form.seller_id) throw new Error("اختر البائع")
      if (!form.price || Number(form.price) < 0) throw new Error("اكتب سعرًا صحيحًا")

      const sku = form.sku.trim() || autoSku
      const created = await api("/admin/products?fields=id,title,*variants", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          status: "published",
          categories: form.category_id ? [{ id: form.category_id }] : undefined,
          images: form.image_url.trim() ? [{ url: form.image_url.trim() }] : undefined,
          thumbnail: form.image_url.trim() || undefined,
          options: [{ title: "Default Option", values: ["Default"] }],
          variants: [{ title: "Default variant", sku, options: { "Default Option": "Default" } }],
        }),
      })

      const productId = created?.product?.id
      if (!productId) throw new Error("تم إنشاء المنتج لكن لم يرجع النظام رقم المنتج")
      let variantId = created?.product?.variants?.[0]?.id
      if (!variantId) {
        const detail = await api(`/admin/products/${productId}?fields=id,title,*variants`)
        variantId = detail?.product?.variants?.[0]?.id
      }
      if (!variantId) throw new Error("تعذر العثور على Variant للمنتج الجديد")

      const profiles = await api("/admin/shipping-profiles?limit=100")
      let shippingProfileId = profiles?.shipping_profiles?.[0]?.id
      if (!shippingProfileId) {
        const createdProfile = await api("/admin/shipping-profiles", {
          method: "POST",
          body: JSON.stringify({ name: "Spike Default", type: "default" }),
        })
        shippingProfileId = createdProfile?.shipping_profile?.id
      }
      if (!shippingProfileId) throw new Error("تعذر تجهيز Shipping Profile تلقائيًا")

      let locationId: string | undefined
      try {
        const locations = await api("/admin/stock-locations?limit=100")
        locationId = locations?.stock_locations?.[0]?.id
      } catch {
        locationId = undefined
      }

      const quantity = Math.max(0, Math.floor(Number(form.quantity || 0)))
      const inventoryItem: Record<string, unknown> = { title: form.title.trim(), sku, required_quantity: 1 }
      if (locationId) inventoryItem.stock_levels = [{ location_id: locationId, stocked_quantity: quantity }]

      await api("/admin/offers/batch", {
        method: "POST",
        body: JSON.stringify({
          seller_id: form.seller_id,
          offers: [{
            sku,
            variant_id: variantId,
            shipping_profile_id: shippingProfileId,
            prices: [{ amount: Number(form.price), currency_code: form.currency.toLowerCase() }],
            inventory_items: [inventoryItem],
            metadata: form.compare_at_price ? { compare_at_price: Number(form.compare_at_price) } : undefined,
          }],
        }),
      })

      setMessage("تم إنشاء المنتج وربطه بالبائع وإضافة السعر بنجاح.")
      setForm(initial)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء المنتج")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 24 }} dir="rtl">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>SPIKE ADMIN</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>إضافة منتج</h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>أنشئ المنتج والسعر والعرض للبائع من شاشة واحدة.</p>
      </div>
      {error && <div style={{ padding: 12, border: "1px solid #ef4444", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      {message && <div style={{ padding: 12, border: "1px solid #22c55e", borderRadius: 8, marginBottom: 16 }}>{message}</div>}
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Section title="معلومات المنتج">
          <Field label="اسم المنتج *"><input value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} placeholder="مثال: سماعات لاسلكية Pro" /></Field>
          <Field label="الوصف"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} placeholder="وصف مختصر وواضح" /></Field>
          <div style={twoCols}>
            <Field label="البائع *"><select value={form.seller_id} onChange={(e) => set("seller_id", e.target.value)} style={inputStyle}><option value="">اختر البائع</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.name || seller.email || seller.id}</option>)}</select></Field>
            <Field label="الفئة"><select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} style={inputStyle}><option value="">بدون فئة</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name || category.title || category.id}</option>)}</select></Field>
          </div>
          <Field label="رابط الصورة (اختياري)"><input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} style={inputStyle} placeholder="https://..." /></Field>
        </Section>

        <Section title="السعر والمخزون">
          <div style={twoCols}>
            <Field label="سعر البيع *"><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} style={inputStyle} placeholder="0.00" /></Field>
            <Field label="السعر قبل الخصم (اختياري)"><input type="number" min="0" step="0.01" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} style={inputStyle} placeholder="0.00" /></Field>
          </div>
          <div style={twoCols}>
            <Field label="الكمية"><input type="number" min="0" step="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} style={inputStyle} /></Field>
            <Field label="العملة"><select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={inputStyle}><option value="SAR">SAR - ريال سعودي</option><option value="USD">USD - دولار</option></select></Field>
          </div>
          <Field label="SKU (اختياري — يتولد تلقائيًا)"><input value={form.sku} onChange={(e) => set("sku", e.target.value)} style={inputStyle} placeholder={autoSku} /></Field>
        </Section>

        <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "جاري إنشاء المنتج..." : "حفظ المنتج"}</button>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section style={{ border: "1px solid rgba(128,128,128,.25)", borderRadius: 12, padding: 18, display: "grid", gap: 14 }}><h2 style={{ fontSize: 17, margin: 0 }}>{title}</h2>{children}</section>
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label style={{ display: "grid", gap: 7, fontSize: 14 }}><span style={{ fontWeight: 600 }}>{label}</span>{children}</label>
}
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(128,128,128,.35)", background: "transparent", color: "inherit" }
const twoCols: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }
const buttonStyle: CSSProperties = { justifySelf: "start", padding: "11px 22px", borderRadius: 8, border: 0, background: "#111827", color: "white", fontWeight: 700, cursor: "pointer" }
