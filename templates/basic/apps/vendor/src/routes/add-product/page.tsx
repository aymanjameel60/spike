import { useEffect, useMemo, useState } from "react"
import type { CSSProperties, FormEvent, ReactNode } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"

declare const __BACKEND_URL__: string

export const config: RouteConfig = {
  label: "إضافة منتج",
  rank: 19,
}

type Category = { id: string; name?: string; title?: string }
type DeliveryOffice = { id: string; name: string; city?: string; governorate?: string; calculation_type?: string }

type FormState = {
  title: string
  description: string
  category_id: string
  image_url: string
  price: string
  quantity: string
  sku: string
  currency: string
  delivery_office_id: string
  returnable: string
}

const initial: FormState = {
  title: "",
  description: "",
  category_id: "",
  image_url: "",
  price: "",
  quantity: "0",
  sku: "",
  currency: "SAR",
  delivery_office_id: "",
  returnable: "",
}

function apiBase() {
  try {
    return String(__BACKEND_URL__ || "http://localhost:9000").replace(/\/$/, "")
  } catch {
    return "http://localhost:9000"
  }
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBase()}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) {
    const message = data?.message || data?.error || text || `HTTP ${response.status}`
    throw new Error(String(message))
  }
  return data
}

function makeSku(title: string) {
  const seed = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18)
    .toUpperCase()
  return `SPK-${seed || "ITEM"}-${Date.now().toString().slice(-5)}`
}

export default function SimpleVendorProductPage() {
  const [form, setForm] = useState<FormState>(initial)
  const [categories, setCategories] = useState<Category[]>([])
  const [offices, setOffices] = useState<DeliveryOffice[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    api("/vendor/product-categories?limit=100").then((data) => setCategories(data.product_categories || data.categories || [])).catch(() => setCategories([]))
    api("/vendor/spike/product-delivery").then((data) => setOffices(data.offices || [])).catch(() => setOffices([]))
  }, [])

  const autoSku = useMemo(() => form.sku || makeSku(form.title), [form.sku, form.title])

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const uploadProductImage = async (file?: File | null) => {
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("files", file)
      const response = await fetch(`${apiBase()}/vendor/uploads`, { method: "POST", credentials: "include", body: fd })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || "تعذر رفع الصورة")
      const url = data?.files?.[0]?.url || data?.uploads?.[0]?.url || data?.file?.url
      if (!url) throw new Error("لم يرجع رابط الصورة")
      set("image_url", url)
    } catch (err) { setError(err instanceof Error ? err.message : "تعذر رفع الصورة") } finally { setLoading(false) }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (!form.title.trim()) throw new Error("اكتب اسم المنتج")
      if (!form.price || Number(form.price) < 0) throw new Error("اكتب سعرًا صحيحًا")
      if (!form.delivery_office_id) throw new Error("مكتب التوصيل مطلوب ولا يمكن حفظ المنتج بدونه")
      if (!form.returnable) throw new Error("حدد هل المنتج قابل للإرجاع أم غير قابل")

      const sku = form.sku.trim() || autoSku
      const productPayload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: "proposed",
        categories: form.category_id ? [{ id: form.category_id }] : undefined,
        images: form.image_url.trim() ? [{ url: form.image_url.trim() }] : undefined,
        thumbnail: form.image_url.trim() || undefined,
        variants: [{ title: "Default variant", sku }],
      }

      const created = await api("/vendor/products?fields=id,title,*variants", {
        method: "POST",
        body: JSON.stringify(productPayload),
      })

      const productId = created?.product?.id
      if (!productId) throw new Error("تم إنشاء المنتج لكن لم يرجع النظام رقم المنتج")

      let variantId = created?.product?.variants?.[0]?.id
      if (!variantId) {
        const detail = await api(`/vendor/products/${productId}?fields=id,title,*variants`)
        variantId = detail?.product?.variants?.[0]?.id
      }
      if (!variantId) throw new Error("تعذر العثور على Variant للمنتج الجديد")

      const profilesData = await api("/vendor/shipping-profiles?limit=20")
      let shippingProfileId = profilesData?.shipping_profiles?.[0]?.id
      if (!shippingProfileId) {
        const createdProfile = await api("/vendor/shipping-profiles", {
          method: "POST",
          body: JSON.stringify({ name: "Spike Default", type: "default" }),
        })
        shippingProfileId = createdProfile?.shipping_profile?.id
      }
      if (!shippingProfileId) throw new Error("تعذر تجهيز Shipping Profile تلقائيًا")

      let locationId: string | undefined
      try {
        const locations = await api("/vendor/stock-locations?limit=20")
        locationId = locations?.stock_locations?.[0]?.id
      } catch {
        locationId = undefined
      }

      const quantity = Math.max(0, Math.floor(Number(form.quantity || 0)))
      const inventoryItem: Record<string, unknown> = {
        title: form.title.trim(),
        sku,
        required_quantity: 1,
      }
      if (locationId) {
        inventoryItem.stock_levels = [{ location_id: locationId, stocked_quantity: quantity }]
      }

      await api("/vendor/offers", {
        method: "POST",
        body: JSON.stringify({
          sku,
          variant_id: variantId,
          shipping_profile_id: shippingProfileId,
          inventory_items: [inventoryItem],
          prices: [{ amount: Number(form.price), currency_code: form.currency.toLowerCase() }],
          manage_inventory: Boolean(locationId),
          allow_backorder: false,
        }),
      })

      await api("/vendor/spike/product-delivery", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, delivery_office_id: form.delivery_office_id, office_ids: [form.delivery_office_id], returnable: form.returnable === "yes" }),
      })

      setMessage("تم إنشاء المنتج وربطه بمكتب التوصيل وإرساله للمراجعة.")
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
        <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>SPIKE SELLER</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>إضافة منتج</h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>أدخل المعلومات الأساسية فقط. Spike ينشئ الـ Offer وShipping Profile تلقائيًا.</p>
      </div>

      {error && <div style={{ padding: 12, border: "1px solid #ef4444", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      {message && <div style={{ padding: 12, border: "1px solid #22c55e", borderRadius: 8, marginBottom: 16 }}>{message}</div>}

      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Section title="معلومات المنتج">
          <Field label="اسم المنتج *">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} placeholder="مثال: سماعات لاسلكية Pro" />
          </Field>
          <Field label="الوصف">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} placeholder="وصف مختصر وواضح للمنتج" />
          </Field>
          <div style={twoCols}>
            <Field label="الفئة">
              <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} style={inputStyle}>
                <option value="">بدون فئة</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name || category.title || category.id}</option>)}
              </select>
            </Field>
            <Field label="صورة المنتج">
              <input type="file" accept="image/*" onChange={(e) => void uploadProductImage(e.target.files?.[0])} style={inputStyle} />
              {form.image_url && <small dir="ltr">تم رفع الصورة</small>}
            </Field>
          </div>
        </Section>

        <Section title="السعر والمخزون">
          <div style={twoCols}>
            <Field label="سعر البيع *">
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} style={inputStyle} placeholder="0.00" />
            </Field>
          </div>
          <div style={twoCols}>
            <Field label="الكمية">
              <input type="number" min="0" step="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="العملة">
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={inputStyle}>
                <option value="SAR">SAR - ريال سعودي</option>
                <option value="USD">USD - دولار</option>
              </select>
            </Field>
          </div>
          <Field label="مكتب التوصيل *">
            <select value={form.delivery_office_id} onChange={(e) => set("delivery_office_id", e.target.value)} style={inputStyle}>
              <option value="">اختر مكتب التوصيل</option>
              {offices.map((office) => <option key={office.id} value={office.id}>{office.name}{office.city ? ` - ${office.city}` : ""}</option>)}
            </select>
            {!offices.length && <small style={{ opacity: .7 }}>فعّل مكاتب التوصيل أولاً من الإعدادات.</small>}
          </Field>

          <Field label="سياسة الإرجاع *">
            <select value={form.returnable} onChange={(e) => set("returnable", e.target.value)} style={inputStyle}>
              <option value="">اختر</option><option value="yes">قابل للإرجاع</option><option value="no">غير قابل للإرجاع</option>
            </select>
          </Field>

          <Field label="SKU (اختياري — يتولد تلقائيًا)">
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)} style={inputStyle} placeholder={autoSku} />
          </Field>
        </Section>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "جاري إنشاء المنتج..." : "حفظ المنتج"}
        </button>
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
