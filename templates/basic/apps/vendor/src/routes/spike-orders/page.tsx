import { useEffect, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import { Actions, Button, Card, Empty, Field, Message, Page, PageHeader, Status } from "../../spike/ui"

declare const __BACKEND_URL__: string

export const config: RouteConfig = { label: "طلباتي", rank: 12 }

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

const states = [
  ["under_review", "قيد المراجعة"],
  ["processing", "قيد التجهيز"],
  ["shipping", "قيد التوصيل"],
  ["delivered", "تم التوصيل"],
] as const

const statusTone = (value: string) => value === "delivered" ? "success" : value === "under_review" ? "warning" : "info"
const statusLabel = (value: string) => states.find((state) => state[0] === value)?.[1] || value || "—"

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const data = await api("/vendor/spike/orders")
    setOrders(data.orders || [])
  }

  useEffect(() => { load().catch((error) => setMessage(error.message)) }, [])

  const updateStatus = async (value: string) => {
    if (!selected) return
    try {
      setBusy(true)
      await api(`/vendor/spike/orders/${selected.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: value }),
      })
      setSelected({ ...selected, seller_status: value })
      setMessage("تم تحديث الحالة وإرسال إشعار للعميل")
      await load()
    } catch (error: any) {
      setMessage(error.message || "تعذر تحديث الحالة")
    } finally {
      setBusy(false)
    }
  }

  return <Page>
    <PageHeader
      title="طلباتي"
      description="تظهر هنا منتجات متجرك فقط. اعتماد الحوالة يتم من إدارة المنصة."
    />

    {message && <Message>{message}</Message>}

    <Card className="spike-table-card">
      <div className="spike-responsive-table">
        <table className="spike-vendor-table">
          <thead><tr><th>الطلب</th><th>العميل</th><th>حصتك</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            {orders.map((order) => <tr key={order.id}>
              <td>#{order.display_id || order.id}</td>
              <td>
                <div>{order.shipping_address?.first_name || order.email || "—"}</div>
                <small className="spike-muted-text">{order.shipping_address?.phone || ""}</small>
              </td>
              <td>{order.seller_subtotal} {order.currency_code}</td>
              <td><Status tone={statusTone(order.seller_status)}>{statusLabel(order.seller_status)}</Status></td>
              <td><Button tone="secondary" onClick={() => setSelected(order)}>فتح</Button></td>
            </tr>)}
          </tbody>
        </table>
        {!orders.length && <Empty>لا توجد طلبات حالياً.</Empty>}
      </div>
    </Card>

    {selected && <div className="spike-modal-backdrop" onMouseDown={() => setSelected(null)}>
      <div className="spike-edit-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="spike-modal-head">
          <div>
            <h2>طلب #{selected.display_id || selected.id}</h2>
            <p>تفاصيل العميل والمنتجات الخاصة بمتجرك.</p>
          </div>
          <Button tone="ghost" onClick={() => setSelected(null)}>×</Button>
        </div>

        <div className="spike-order-detail-grid">
          <Card className="spike-order-detail-card">
            <h3>معلومات العميل</h3>
            <p><b>الاسم:</b> {[selected.shipping_address?.first_name, selected.shipping_address?.last_name].filter(Boolean).join(" ") || "—"}</p>
            <p><b>الهاتف:</b> {selected.shipping_address?.phone || "—"}</p>
            <p><b>العنوان:</b> {[selected.shipping_address?.province, selected.shipping_address?.city, selected.shipping_address?.address_1].filter(Boolean).join(" - ") || "—"}</p>
          </Card>

          <Card className="spike-order-detail-card">
            <h3>حالة الطلب</h3>
            <Field label="الحالة الحالية">
              <select value={selected.seller_status || "under_review"} disabled={busy} onChange={(event) => updateStatus(event.target.value)}>
                {states.map((state) => <option key={state[0]} value={state[0]}>{state[1]}</option>)}
              </select>
            </Field>
          </Card>
        </div>

        <Card className="spike-order-items-card">
          <h3>منتجاتك</h3>
          <div className="spike-order-items-list">
            {(selected.items || []).map((item: any) => <div className="spike-order-item-row" key={item.id}>
              <span>{item.title || "منتج"}</span>
              <b>× {item.quantity || 1}</b>
            </div>)}
          </div>
        </Card>

        <Actions>
          {selected.shipping_address?.phone && <a className="spike-secondary-button" href={`https://wa.me/${String(selected.shipping_address.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer">واتساب</a>}
          <Button tone="secondary" onClick={() => setSelected(null)}>إغلاق</Button>
        </Actions>
      </div>
    </div>}
  </Page>
}
