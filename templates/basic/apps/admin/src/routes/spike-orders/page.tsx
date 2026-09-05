import { useEffect, useMemo, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import { Actions, Button, Card, Empty, Message, Page, PageHeader, Status } from "../../spike-shared/ui"

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
const reviewValue = (order: any) => String(order?.metadata?.spike_payment_review || "pending")
const reviewLabel = (order: any) => {
  const value = reviewValue(order)
  if (value === "approved") return "تم اعتماد الدفع"
  if (value === "rejected") return "تم رفض السند"
  if (value === "receipt_pending") return "السند قيد المراجعة"
  return order?.metadata?.spike_payment_method === "cod" ? "قيد مراجعة الإدارة" : "بانتظار سند الحوالة"
}
const reviewTone = (order: any) => reviewValue(order) === "approved" ? "success" : reviewValue(order) === "rejected" ? "danger" : "warning"

export default function SpikeOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    const [ordersData, receiptsData] = await Promise.all([
      api("/admin/orders?limit=100&fields=id,display_id,status,email,created_at,total,subtotal,shipping_total,currency_code,metadata,*items,*shipping_address,*customer"),
      api("/admin/spike/payment-receipts"),
    ])
    setOrders(ordersData.orders || [])
    setReceipts(receiptsData.receipts || [])
  }

  useEffect(() => { load().catch((error) => setMessage(error.message || "تعذر تحميل الطلبات")) }, [])

  const receiptsByOrder = useMemo(() => {
    const map = new Map<string, any>()
    for (const receipt of receipts) if (receipt.order_id) map.set(String(receipt.order_id), receipt)
    return map
  }, [receipts])

  const selected = orders.find((order) => String(order.id) === String(selectedId)) || null
  const selectedReceipt = selected ? receiptsByOrder.get(String(selected.id)) : null

  const updateStatus = async (id: string, value: string) => {
    try {
      setBusy(id); setMessage("")
      await api(`/admin/spike/orders/${id}/status`, { method: "POST", body: JSON.stringify({ status: value }) })
      setMessage("تم تحديث حالة الطلب")
      await load()
    } catch (error: any) { setMessage(error.message) } finally { setBusy(null) }
  }

  const reviewReceipt = async (receipt: any, status: "approved" | "rejected") => {
    if (!receipt?.id) return
    try {
      setBusy(receipt.id); setMessage("")
      await api(`/admin/spike/payment-receipts/${receipt.id}`, {
        method: "POST",
        body: JSON.stringify({ status, note: status === "rejected" ? "تم رفض سند الحوالة من الإدارة" : null }),
      })
      setMessage(status === "approved" ? "تم اعتماد الحوالة وإضافة مستحقات التاجر" : "تم رفض سند الحوالة")
      await load()
    } catch (error: any) { setMessage(error.message) } finally { setBusy(null) }
  }

  return <Page>
    <PageHeader title="طلبات Spike" description="راجع الطلبات والدفع وسندات الحوالة من مكان واحد." />
    {message && <Message>{message}</Message>}

    <Card className="spike-native-table-card">
      <div className="spike-native-table-wrap">
        <table className="spike-native-table">
          <thead><tr><th>الطلب</th><th>العميل</th><th>طريقة الدفع</th><th>حالة الدفع</th><th>حالة الطلب</th><th>إجراء</th></tr></thead>
          <tbody>{orders.map((order) => {
            const receipt = receiptsByOrder.get(String(order.id))
            return <tr key={order.id}>
              <td>#{order.display_id || order.id}</td>
              <td>{order.customer?.first_name || order.customer?.last_name ? `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() : order.email || "—"}</td>
              <td>{paymentLabel(order)}</td>
              <td><Status tone={reviewTone(order)}>{reviewLabel(order)}{receipt?.status === "pending" ? " • سند مرفوع" : ""}</Status></td>
              <td><Status tone="info">{order.metadata?.spike_status || order.status || "—"}</Status></td>
              <td><Button tone="secondary" onClick={() => setSelectedId(order.id)}>فتح</Button></td>
            </tr>
          })}</tbody>
        </table>
        {!orders.length && <Empty>لا توجد طلبات حالياً.</Empty>}
      </div>
    </Card>

    {selected && <div className="spike-modal-backdrop" onMouseDown={() => setSelectedId(null)}>
      <div className="spike-edit-modal spike-admin-order-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="spike-native-header">
          <div>
            <h2 className="spike-native-title">تفاصيل الطلب #{selected.display_id || selected.id}</h2>
            <p className="spike-native-muted">معلومات العميل والطلب والدفع.</p>
          </div>
          <Button tone="ghost" onClick={() => setSelectedId(null)}>×</Button>
        </div>

        <div className="spike-order-detail-grid">
          <Card className="spike-order-detail-card">
            <h3>معلومات العميل</h3>
            <p><b>الاسم:</b> {[selected.customer?.first_name, selected.customer?.last_name].filter(Boolean).join(" ") || "—"}</p>
            <p><b>البريد:</b> {selected.email || selected.customer?.email || "—"}</p>
            <p><b>الجوال:</b> {selected.shipping_address?.phone || selected.customer?.phone || "—"}</p>
            <p><b>العنوان:</b> {[selected.shipping_address?.city, selected.shipping_address?.province, selected.shipping_address?.address_1, selected.shipping_address?.address_2].filter(Boolean).join(" - ") || "—"}</p>
          </Card>

          <Card className="spike-order-detail-card">
            <h3>معلومات الطلب</h3>
            <p><b>رقم الطلب:</b> #{selected.display_id || selected.id}</p>
            <p><b>التاريخ:</b> {selected.created_at ? new Date(selected.created_at).toLocaleString("ar") : "—"}</p>
            <p><b>الإجمالي:</b> {money(selected.total, selected.currency_code)}</p>
            <p><b>الشحن:</b> {money(selected.shipping_total, selected.currency_code)}</p>
            <p><b>طريقة الدفع:</b> {paymentLabel(selected)}</p>
            <p><b>حالة الدفع:</b> <Status tone={reviewTone(selected)}>{reviewLabel(selected)}</Status></p>
          </Card>

          <Card className="spike-order-detail-card">
            <h3>سند الحوالة</h3>
            {selected.metadata?.spike_payment_method === "cod" ? <p>هذا الطلب دفع عند الاستلام ولا يوجد سند حوالة.</p> : !selectedReceipt ? <p>لم يرفع العميل سند الحوالة بعد.</p> : <>
              <a href={`${__BACKEND_URL__}${selectedReceipt.receipt_url}`} target="_blank" rel="noreferrer">
                <img className="spike-receipt-preview" src={`${__BACKEND_URL__}${selectedReceipt.receipt_url}`} alt="سند الحوالة" />
              </a>
              <p><b>اسم الملف:</b> {selectedReceipt.original_name || "—"}</p>
              <p><b>الحالة:</b> {selectedReceipt.status === "approved" ? "معتمد" : selectedReceipt.status === "rejected" ? "مرفوض" : "قيد المراجعة"}</p>
              {selectedReceipt.status === "pending" && <Actions>
                <Button disabled={busy === selectedReceipt.id} onClick={() => reviewReceipt(selectedReceipt, "approved")}>الموافقة على الحوالة</Button>
                <Button tone="danger" disabled={busy === selectedReceipt.id} onClick={() => reviewReceipt(selectedReceipt, "rejected")}>رفض السند</Button>
              </Actions>}
            </>}
          </Card>
        </div>

        <Card className="spike-order-items-card">
          <h3>المنتجات</h3>
          <div className="spike-order-items-list">
            {(selected.items || []).map((item: any) => <div className="spike-order-item-row" key={item.id}>
              <span>{item.product_title || item.title || "منتج"}</span>
              <b>× {item.quantity || 1}</b>
            </div>)}
          </div>
        </Card>

        <Actions>
          <Button disabled={busy === selected.id} onClick={() => updateStatus(selected.id, "processing")}>جاري التجهيز</Button>
          <Button tone="secondary" disabled={busy === selected.id} onClick={() => updateStatus(selected.id, "shipped")}>مع المندوب</Button>
          <Button tone="secondary" disabled={busy === selected.id} onClick={() => updateStatus(selected.id, "delivered")}>تم التسليم</Button>
          <a className="spike-native-btn secondary" href={`${__BACKEND_URL__}/admin/spike/orders/${selected.id}/shipping-document`} target="_blank" rel="noreferrer">مستند الشحن</a>
        </Actions>
      </div>
    </div>}
  </Page>
}
