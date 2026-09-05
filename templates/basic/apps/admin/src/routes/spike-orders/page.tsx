import { useEffect, useMemo, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import "../../spike-shared/spike-native.css"

declare const __BACKEND_URL__: string

export const config: RouteConfig = { label: "طلبات Spike", rank: 12 }

const api = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${__BACKEND_URL__}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`)
  return data
}

const money = (amount: any, currency: string) => `${Number(amount || 0).toLocaleString("ar")} ${String(currency || "").toUpperCase()}`
const paymentLabel = (order: any) => order?.metadata?.spike_payment_method === "cod" ? "الدفع عند الاستلام" : "حوالة مالية"
const reviewLabel = (order: any) => {
  const value = String(order?.metadata?.spike_payment_review || "pending")
  if (value === "approved") return "تم اعتماد الدفع"
  if (value === "rejected") return "تم رفض السند"
  if (value === "receipt_pending") return "السند قيد المراجعة"
  return order?.metadata?.spike_payment_method === "cod" ? "قيد مراجعة الإدارة" : "بانتظار سند الحوالة"
}

export default function SpikeOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    const [ordersData, receiptsData] = await Promise.all([
      api("/admin/orders?limit=100&fields=id,display_id,status,email,created_at,total,subtotal,shipping_total,currency_code,metadata,*items,*shipping_address,*customer"),
      api("/admin/spike/payment-receipts"),
    ])
    setOrders(ordersData.orders || [])
    setReceipts(receiptsData.receipts || [])
  }

  useEffect(() => { load().catch((e) => setMsg(e.message || "تعذر تحميل الطلبات")) }, [])

  const receiptsByOrder = useMemo(() => {
    const map = new Map<string, any>()
    for (const receipt of receipts) if (receipt.order_id) map.set(String(receipt.order_id), receipt)
    return map
  }, [receipts])

  const selected = orders.find((order) => String(order.id) === String(selectedId)) || null
  const selectedReceipt = selected ? receiptsByOrder.get(String(selected.id)) : null

  const updateStatus = async (id: string, value: string) => {
    try {
      setBusy(id); setMsg("")
      await api(`/admin/spike/orders/${id}/status`, { method: "POST", body: JSON.stringify({ status: value }) })
      setMsg("تم تحديث حالة الطلب")
      await load()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(null) }
  }

  const reviewReceipt = async (receipt: any, status: "approved" | "rejected") => {
    if (!receipt?.id) return
    try {
      setBusy(receipt.id); setMsg("")
      await api(`/admin/spike/payment-receipts/${receipt.id}`, {
        method: "POST",
        body: JSON.stringify({ status, note: status === "rejected" ? "تم رفض سند الحوالة من الإدارة" : null }),
      })
      setMsg(status === "approved" ? "تم اعتماد الحوالة وإضافة مستحقات التاجر" : "تم رفض سند الحوالة")
      await load()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(null) }
  }

  return <div className="spike-native-page" dir="rtl">
    <div className="spike-native-card">
      <h1 className="spike-native-title">طلبات Spike</h1>
      <p className="spike-native-muted">اضغط على أي طلب لعرض معلومات العميل والطلب وسند الحوالة في الخانة المنفصلة.</p>
      {msg && <p>{msg}</p>}
    </div>

    <div className="spike-native-card">
      <table className="spike-native-table">
        <thead><tr><th>الطلب</th><th>العميل</th><th>طريقة الدفع</th><th>حالة الدفع</th><th>حالة الطلب</th><th>تفاصيل</th></tr></thead>
        <tbody>{orders.map((order) => {
          const receipt = receiptsByOrder.get(String(order.id))
          return <tr key={order.id}>
            <td>#{order.display_id || order.id}</td>
            <td>{order.customer?.first_name || order.customer?.last_name ? `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() : order.email || "—"}</td>
            <td>{paymentLabel(order)}</td>
            <td>{reviewLabel(order)}{receipt?.status === "pending" ? " • سند مرفوع" : ""}</td>
            <td>{order.metadata?.spike_status || order.status || "—"}</td>
            <td><button className="spike-native-btn" onClick={() => setSelectedId(order.id)}>فتح</button></td>
          </tr>
        })}</tbody>
      </table>
    </div>

    {selected && <div className="spike-native-card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h2 className="spike-native-title">تفاصيل الطلب #{selected.display_id || selected.id}</h2>
          <p className="spike-native-muted">هذه الخانة خاصة بمراجعة الطلب والعميل والدفع.</p>
        </div>
        <button className="spike-native-btn" onClick={() => setSelectedId(null)}>إغلاق</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 18 }}>
        <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h3>معلومات العميل</h3>
          <p><b>الاسم:</b> {[selected.customer?.first_name, selected.customer?.last_name].filter(Boolean).join(" ") || "—"}</p>
          <p><b>البريد:</b> {selected.email || selected.customer?.email || "—"}</p>
          <p><b>الجوال:</b> {selected.shipping_address?.phone || selected.customer?.phone || "—"}</p>
          <p><b>العنوان:</b> {[selected.shipping_address?.city, selected.shipping_address?.province, selected.shipping_address?.address_1, selected.shipping_address?.address_2].filter(Boolean).join(" - ") || "—"}</p>
        </section>

        <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h3>معلومات الطلب</h3>
          <p><b>رقم الطلب:</b> #{selected.display_id || selected.id}</p>
          <p><b>التاريخ:</b> {selected.created_at ? new Date(selected.created_at).toLocaleString("ar") : "—"}</p>
          <p><b>الإجمالي:</b> {money(selected.total, selected.currency_code)}</p>
          <p><b>الشحن:</b> {money(selected.shipping_total, selected.currency_code)}</p>
          <p><b>طريقة الدفع:</b> {paymentLabel(selected)}</p>
          <p><b>حالة الدفع:</b> {reviewLabel(selected)}</p>
          <div>{(selected.items || []).map((item: any) => <div key={item.id} style={{ padding: "8px 0", borderTop: "1px solid #eee" }}>{item.product_title || item.title || "منتج"} × {item.quantity || 1}</div>)}</div>
        </section>

        <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h3>سند الحوالة</h3>
          {selected.metadata?.spike_payment_method === "cod" ? <p>هذا الطلب دفع عند الاستلام ولا يوجد سند حوالة.</p> : !selectedReceipt ? <p>لم يرفع العميل سند الحوالة بعد.</p> : <>
            <a href={`${__BACKEND_URL__}${selectedReceipt.receipt_url}`} target="_blank" rel="noreferrer">
              <img src={`${__BACKEND_URL__}${selectedReceipt.receipt_url}`} alt="سند الحوالة" style={{ width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 10, background: "#f8f8f8" }} />
            </a>
            <p><b>اسم الملف:</b> {selectedReceipt.original_name || "—"}</p>
            <p><b>حالة السند:</b> {selectedReceipt.status === "approved" ? "معتمد" : selectedReceipt.status === "rejected" ? "مرفوض" : "قيد المراجعة"}</p>
            {selectedReceipt.status === "pending" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="spike-native-btn" disabled={busy === selectedReceipt.id} onClick={() => reviewReceipt(selectedReceipt, "approved")}>الموافقة على الحوالة</button>
              <button className="spike-native-btn" disabled={busy === selectedReceipt.id} onClick={() => reviewReceipt(selectedReceipt, "rejected")}>رفض السند</button>
            </div>}
          </>}
        </section>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="spike-native-btn" disabled={busy === selected.id} onClick={() => updateStatus(selected.id, "processing")}>جاري التجهيز</button>
        <button className="spike-native-btn" disabled={busy === selected.id} onClick={() => updateStatus(selected.id, "shipped")}>مع المندوب</button>
        <button className="spike-native-btn" disabled={busy === selected.id} onClick={() => updateStatus(selected.id, "delivered")}>تم التسليم</button>
        <a className="spike-doc-link" href={`${__BACKEND_URL__}/admin/spike/orders/${selected.id}/shipping-document`} target="_blank" rel="noreferrer">مستند الشحن</a>
      </div>
    </div>}
  </div>
}
