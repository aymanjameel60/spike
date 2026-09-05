import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b = (req.body || {}) as any
  const cartId = b.cart_id ? String(b.cart_id) : null
  const orderId = b.order_id ? String(b.order_id) : null
  const dataUrl = String(b.data_url || "")
  const name = String(b.filename || "receipt")
  const actor = (req as any).auth_context?.actor_id || (req as any).auth_context?.auth_identity_id || null

  if (!orderId) return res.status(400).json({ message: "order_id is required" })

  const spike = req.scope.resolve("spike") as any
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "cart_id", "metadata"],
    filters: { id: orderId },
    pagination: { take: 1 },
  })
  const order = data?.[0]
  if (!order) return res.status(404).json({ message: "Order not found" })
  if (actor && order.customer_id && String(order.customer_id) !== String(actor)) {
    return res.status(403).json({ message: "هذا الطلب لا يخص هذا العميل" })
  }

  const resolvedCartId = cartId || order.cart_id || `order:${orderId}`
  const existing = await spike.listSpikePaymentReceipts({ order_id: orderId }, { take: 1, order: { created_at: "DESC" } })

  if (!dataUrl) {
    return res.json({ receipt: existing[0] || null })
  }

  const m = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i)
  if (!m) return res.status(400).json({ message: "ارفع إيصالاً بصيغة PNG أو JPG أو WEBP" })
  const buf = Buffer.from(m[2], "base64")
  if (buf.length > 5 * 1024 * 1024) return res.status(413).json({ message: "حجم الإيصال يجب ألا يتجاوز 5MB" })

  const ext = m[1].toLowerCase().includes("png") ? "png" : m[1].toLowerCase().includes("webp") ? "webp" : "jpg"
  const dir = path.join(process.cwd(), "static", "receipts")
  await fs.mkdir(dir, { recursive: true })
  const file = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${ext}`
  await fs.writeFile(path.join(dir, file), buf)

  let receipt
  if (existing.length) {
    receipt = await spike.updateSpikePaymentReceipts({
      id: existing[0].id,
      cart_id: resolvedCartId,
      customer_id: actor || existing[0].customer_id,
      order_id: orderId,
      receipt_url: `/static/receipts/${file}`,
      original_name: name,
      status: "pending",
      note: null,
    })
  } else {
    receipt = await spike.createSpikePaymentReceipts({
      cart_id: resolvedCartId,
      customer_id: actor,
      order_id: orderId,
      receipt_url: `/static/receipts/${file}`,
      original_name: name,
      status: "pending",
      note: null,
    })
  }

  try {
    await (req.scope.resolve(Modules.ORDER) as any).updateOrders(orderId, {
      metadata: {
        ...(order.metadata || {}),
        spike_payment_method: "transfer",
        spike_payment_review: "receipt_pending",
      },
    })
  } catch (e) {
    console.warn("[Spike receipt order metadata]", e)
  }

  await spike.createSpikeNotifications({
    audience: "customer",
    customer_id: actor || order.customer_id || null,
    type: "payment_receipt_uploaded",
    title: "تم استلام سند الحوالة",
    body: "سند الحوالة قيد مراجعة الإدارة الآن.",
    entity_type: "order",
    entity_id: orderId,
    read: false,
  })

  res.status(existing.length ? 200 : 201).json({ receipt })
}
