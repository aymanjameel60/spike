import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b = (req.body || {}) as any
  const orderId = String(b.order_id || '')
  const method = String(b.payment_method || '')
  if (!orderId || !['transfer', 'cod'].includes(method)) return res.status(400).json({ message: 'order_id and valid payment_method are required' })

  const actor = (req as any).auth_context?.actor_id || null
  const q = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const { data } = await q.graph({ entity: 'order', fields: ['id', 'customer_id', 'metadata'], filters: { id: orderId }, pagination: { take: 1 } })
  const order = data?.[0]
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (actor && order.customer_id && String(actor) !== String(order.customer_id)) return res.status(403).json({ message: 'هذا الطلب لا يخص هذا العميل' })

  await (req.scope.resolve(Modules.ORDER) as any).updateOrders(orderId, {
    metadata: {
      ...(order.metadata || {}),
      spike_payment_method: method,
      spike_payment_review: 'pending',
    },
  })
  res.json({ order_id: orderId, payment_method: method, payment_review: 'pending' })
}
