import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sp = req.scope.resolve('spike') as any
  const status = String((req.body as any)?.status || '')
  if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' })

  const rows = await sp.listSpikePaymentReceipts({ id: req.params.id }, { take: 1 })
  const old = rows[0]
  if (!old) return res.status(404).json({ message: 'Receipt not found' })

  const receipt = await sp.updateSpikePaymentReceipts({
    id: old.id,
    status,
    note: (req.body as any)?.note ? String((req.body as any).note) : null,
  })

  if (old.order_id) {
    try {
      const q = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
      const { data } = await q.graph({
        entity: 'order',
        fields: ['id', 'customer_id', 'currency_code', 'metadata', 'items.id', 'items.total', 'items.unit_price', 'items.quantity', 'items.offer.seller_id', 'items.offer.seller.name'],
        filters: { id: old.order_id },
        pagination: { take: 1 },
      })
      const o = data?.[0]
      if (o) {
        await (req.scope.resolve(Modules.ORDER) as any).updateOrders(o.id, {
          metadata: {
            ...(o.metadata || {}),
            spike_payment_method: 'transfer',
            spike_payment_review: status,
          },
        })

        const sellerTotals = new Map<string, { amount: number; name: string | null }>()
        for (const item of o.items || []) {
          const sid = item.offer?.seller_id
          if (!sid) continue
          const current = sellerTotals.get(String(sid)) || { amount: 0, name: item.offer?.seller?.name || null }
          const lineTotal = Number(item.total ?? (Number(item.unit_price || 0) * Number(item.quantity || 1)))
          current.amount += Number.isFinite(lineTotal) ? lineTotal : 0
          sellerTotals.set(String(sid), current)
        }

        if (status === 'approved' && old.status !== 'approved') {
          for (const [sid, value] of sellerTotals) {
            const existing = await sp.listSpikePayables({ kind: 'vendor_order', beneficiary_id: sid, order_id: o.id }, { take: 1 })
            if (!existing.length) {
              const commissions = await sp.listSpikeSellerCommissions({ seller_id: sid }, { take: 1 })
              const percent = Math.max(0, Number(commissions[0]?.percent || 0))
              const gross = Number(value.amount || 0)
              const commission = gross * percent / 100
              const net = Math.max(0, gross - commission)
              await sp.createSpikePayables({
                kind: 'vendor_order',
                beneficiary_id: sid,
                beneficiary_name: value.name,
                order_id: o.id,
                reference_id: receipt.id,
                amount: net,
                currency_code: String(o.currency_code || 'YER').toLowerCase(),
                status: 'pending',
                note: `مستحقات الطلب بعد خصم عمولة Spike (${percent}%). الإجمالي ${gross}، العمولة ${commission}، الصافي ${net}`,
              })
            }
            await sp.createSpikeNotifications({
              audience: 'vendor',
              seller_id: sid,
              type: 'payment_approved',
              title: 'تم اعتماد دفع الطلب',
              body: `تم اعتماد الدفع للطلب #${o.id}. أضيفت قيمة الجزء الخاص بمتجرك إلى المستحقات ويمكنك بدء التجهيز.`,
              entity_type: 'order',
              entity_id: o.id,
              read: false,
            })
          }
        }
      }
    } catch (e) {
      console.error('[Spike payment approval]', e)
      return res.status(500).json({ message: 'تم تحديث السند لكن تعذر تحديث الطلب أو المستحقات' })
    }
  }

  if (receipt.customer_id && status !== 'pending') {
    await sp.createSpikeNotifications({
      audience: 'customer',
      customer_id: receipt.customer_id,
      type: `payment_${status}`,
      title: status === 'approved' ? 'تمت الموافقة على الحوالة' : 'تم رفض الحوالة',
      body: status === 'approved' ? 'تم اعتماد سند التحويل وسيبدأ تجهيز طلبك.' : (receipt.note || 'يرجى مراجعة بيانات التحويل والسند.'),
      entity_type: 'order',
      entity_id: receipt.order_id || null,
      read: false,
    })
  }

  await sp.createSpikeAuditLogs({
    actor_id: (req as any).auth_context?.actor_id || null,
    actor_type: 'admin',
    action: `payment_${status}`,
    entity_type: 'payment_receipt',
    entity_id: receipt.id,
    before: { status: old.status },
    after: { status },
    note: receipt.note || null,
  })

  res.json({ receipt })
}
