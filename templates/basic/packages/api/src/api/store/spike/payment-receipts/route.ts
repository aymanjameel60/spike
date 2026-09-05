import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"

export async function POST(req:MedusaRequest,res:MedusaResponse){
  const b=(req.body||{}) as any
  const cartId=String(b.cart_id||""),orderId=b.order_id?String(b.order_id):null,dataUrl=String(b.data_url||""),name=String(b.filename||"receipt")
  const actor=(req as any).auth_context?.actor_id||(req as any).auth_context?.auth_identity_id||null
  if(!cartId)return res.status(400).json({message:"cart_id is required"})
  const spike=req.scope.resolve("spike") as any
  if(orderId&&!dataUrl){const rows=await spike.listSpikePaymentReceipts({cart_id:cartId},{take:1,order:{created_at:"DESC"}});if(!rows.length)return res.status(404).json({message:"Receipt not found"});const receipt=await spike.updateSpikePaymentReceipts({id:rows[0].id,order_id:orderId});return res.json({receipt})}
  const m=dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);if(!m)return res.status(400).json({message:"ارفع إيصالاً بصيغة PNG أو JPG أو WEBP"})
  const buf=Buffer.from(m[2],"base64");if(buf.length>5*1024*1024)return res.status(413).json({message:"حجم الإيصال يجب ألا يتجاوز 5MB"})
  const ext=m[1].toLowerCase().includes("png")?"png":m[1].toLowerCase().includes("webp")?"webp":"jpg"
  const dir=path.join(process.cwd(),"static","receipts");await fs.mkdir(dir,{recursive:true})
  const file=`${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${ext}`;await fs.writeFile(path.join(dir,file),buf)
  const receipt=await spike.createSpikePaymentReceipts({cart_id:cartId,customer_id:actor,order_id:orderId,receipt_url:`/static/receipts/${file}`,original_name:name,status:"pending",note:null})
  res.status(201).json({receipt})
}
