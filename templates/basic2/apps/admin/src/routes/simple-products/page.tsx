import { useEffect, useMemo, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import "../../spike-shared/spike-native.css"

declare const __BACKEND_URL__: string

export const config: RouteConfig = { label: "المنتجات", rank: 15 }

type Product = {
  id: string
  title?: string
  status?: string
  thumbnail?: string
  created_at?: string
  seller?: { id?: string; name?: string; email?: string }
  variants?: any[]
}

const api = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${__BACKEND_URL__}${path}`, {
    credentials: "include",
    ...init,
    headers: { ...(init?.body ? { "content-type": "application/json" } : {}), ...(init?.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`)
  return data
}

const statusText = (value?: string) => {
  const status = String(value || "").toLowerCase()
  if (status === "published" || status === "approved") return "منشور"
  if (status === "proposed" || status === "pending") return "بانتظار المراجعة"
  if (status === "rejected") return "مرفوض"
  if (status === "draft") return "مسودة"
  return value || "—"
}

function variantStock(variant: any): number | null {
  const direct = variant?.inventory_quantity ?? variant?.inventoryQuantity
  if (typeof direct === "number" && Number.isFinite(direct)) return direct

  const links = variant?.inventory_items || variant?.inventoryItems || []
  let sawLevel = false
  let total = 0
  for (const link of links) {
    const inventory = link?.inventory || link?.inventory_item || link?.inventoryItem || link
    const levels = inventory?.location_levels || inventory?.locationLevels || link?.location_levels || []
    for (const level of levels) {
      const available = level?.available_quantity ?? level?.availableQuantity
      const stocked = level?.stocked_quantity ?? level?.stockedQuantity
      const reserved = level?.reserved_quantity ?? level?.reservedQuantity ?? 0
      const value = available ?? (stocked != null ? Number(stocked) - Number(reserved || 0) : null)
      if (value != null && Number.isFinite(Number(value))) {
        sawLevel = true
        total += Number(value)
      }
    }
  }
  return sawLevel ? total : null
}

function productStock(product: Product) {
  const values = (product.variants || []).map(variantStock).filter((value): value is number => value != null)
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0)
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const load = async () => {
    setLoading(true)
    try {
      const data = await api("/admin/spike/products")
      setProducts(data.products || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
  }, [])

  const visible = useMemo(() => products.filter((product) => {
    const needle = query.trim().toLowerCase()
    const matchesQuery = !needle || String(product.title || "").toLowerCase().includes(needle) ||
      String(product.seller?.name || product.seller?.email || "").toLowerCase().includes(needle) ||
      (product.variants || []).some((variant) => String(variant?.sku || "").toLowerCase().includes(needle))
    if (!matchesQuery) return false
    if (filter === "all") return true
    const status = String(product.status || "").toLowerCase()
    if (filter === "pending") return ["pending", "proposed"].includes(status)
    if (filter === "published") return ["published", "approved"].includes(status)
    return status === filter
  }), [products, query, filter])

  const act = async (id: string, action: "approve" | "reject") => {
    try {
      let reason = ""
      if (action === "reject") reason = prompt("سبب الرفض") || "تم رفض المنتج"
      await api(`/admin/spike/products/${id}`, { method: "POST", body: JSON.stringify({ action, reason }) })
      setMessage(action === "approve" ? "تمت الموافقة على المنتج ونشره." : "تم رفض المنتج.")
      await load()
    } catch (error: any) {
      setMessage(error.message || "تعذر تنفيذ الإجراء")
    }
  }

  const pendingCount = products.filter((p) => ["pending", "proposed"].includes(String(p.status || "").toLowerCase())).length
  const lowStockCount = products.filter((p) => {
    const stock = productStock(p)
    return stock != null && stock <= 5
  }).length

  return <div className="spike-native-page" dir="rtl">
    <div className="spike-native-header">
      <div>
        <h1 className="spike-native-title">المنتجات</h1>
        <p className="spike-native-muted">كل المنتجات المرفوعة من التجار مع الحالة والمخزون. إنشاء المنتجات متاح للتاجر فقط.</p>
      </div>
    </div>

    <div className="spike-native-kpis">
      <div className="spike-native-kpi"><span>إجمالي المنتجات</span><b>{products.length}</b></div>
      <div className="spike-native-kpi"><span>بانتظار المراجعة</span><b>{pendingCount}</b></div>
      <div className="spike-native-kpi"><span>مخزون منخفض ≤ 5</span><b>{lowStockCount}</b></div>
    </div>

    {message && <div className="spike-native-message">{message}</div>}

    <div className="spike-native-card spike-native-toolbar-card">
      <div className="spike-native-toolbar spike-native-toolbar-flat">
        <label className="spike-native-field spike-grow"><span>بحث</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="اسم المنتج، التاجر أو SKU" /></label>
        <label className="spike-native-field"><span>الحالة</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">الكل</option><option value="published">منشور</option><option value="pending">بانتظار المراجعة</option><option value="rejected">مرفوض</option><option value="draft">مسودة</option></select></label>
      </div>
    </div>

    <div className="spike-native-card spike-native-table-card">
      {loading ? <div className="spike-native-empty">جاري تحميل المنتجات...</div> :
        <div className="spike-native-table-wrap"><table className="spike-native-table"><thead><tr><th>المنتج</th><th>التاجر</th><th>الحالة</th><th>SKU</th><th>المخزون</th><th>تاريخ الإضافة</th><th>الإجراء</th></tr></thead><tbody>
          {visible.map((product) => {
            const status = String(product.status || "").toLowerCase()
            const stock = productStock(product)
            const sku = product.variants?.[0]?.sku || "—"
            const canReview = ["pending", "proposed"].includes(status)
            return <tr key={product.id}>
              <td><div className="spike-native-product-cell">{product.thumbnail ? <img src={product.thumbnail} alt="" /> : <div className="spike-native-thumb">SP</div>}<b>{product.title || "بدون اسم"}</b></div></td>
              <td>{product.seller?.name || product.seller?.email || "—"}</td>
              <td><span className={`spike-status ${status === "published" ? "ok" : status === "rejected" ? "bad" : "warn"}`}>{statusText(product.status)}</span></td>
              <td><code>{sku}</code></td>
              <td><span className={stock != null && stock <= 5 ? "spike-stock-low" : ""}>{stock == null ? "—" : stock}</span>{(product.variants?.length || 0) > 1 && <small className="spike-native-subtext"> {product.variants?.length} خيارات</small>}</td>
              <td>{product.created_at ? new Date(product.created_at).toLocaleDateString("ar-YE") : "—"}</td>
              <td>{canReview ? <div className="spike-inline-actions"><button className="spike-native-btn" onClick={() => act(product.id, "approve")}>موافقة</button><button className="spike-native-btn danger" onClick={() => act(product.id, "reject")}>رفض</button></div> : <span className="spike-native-muted">—</span>}</td>
            </tr>
          })}
        </tbody></table>{!visible.length && <div className="spike-native-empty">لا توجد منتجات مطابقة.</div>}</div>}
    </div>
  </div>
}
