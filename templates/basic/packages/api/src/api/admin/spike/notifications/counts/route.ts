import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const spike = req.scope.resolve("spike") as any
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  let productChanges:any[]=[]
  try { const out=await query.graph({entity:"product_change",fields:["id","status","created_at"],filters:{status:["pending","requested","created"]},pagination:{take:500}}); productChanges=out.data||[] } catch {}
  const notes = await spike.listSpikeNotifications({ audience: "admin", read: false }, { take: 500 })
  res.json({ counts: { product_changes: productChanges.length, notifications: notes.length, total: productChanges.length + notes.length } })
}
