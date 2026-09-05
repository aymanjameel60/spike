import type { MedusaRequest,MedusaResponse } from "@medusajs/framework/http"
export async function DELETE(req:MedusaRequest,res:MedusaResponse){const spike=req.scope.resolve("spike") as any;await spike.deleteSpikeNotifications(req.params.id);res.json({ok:true})}
