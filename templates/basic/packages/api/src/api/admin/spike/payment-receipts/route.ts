import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
export async function GET(req:MedusaRequest,res:MedusaResponse){const spike=req.scope.resolve("spike") as any;const receipts=await spike.listSpikePaymentReceipts({}, {take:500,order:{created_at:"DESC"}});res.json({receipts})}
