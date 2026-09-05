import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const spike=req.scope.resolve("spike") as any,id=req.params.id,body=(req.body||{}) as any
  const current=(await spike.listSpikeDeliveryOffices({id},{take:1}))[0];if(!current)return res.status(404).json({message:"مكتب التوصيل غير موجود"})
  const next={...current,...body}
  for(const k of ["name","governorate","city","phone"])if(!String(next[k]||"").trim())return res.status(422).json({message:`الحقل ${k} إلزامي`,field:k})
  if(!["in_city","intercity","both"].includes(String(next.service_type)))return res.status(422).json({message:"نوع خدمة المكتب غير صالح",field:"service_type"})
  const office=await spike.updateSpikeDeliveryOffices({id,name:String(next.name).trim(),governorate:String(next.governorate).trim(),city:String(next.city).trim(),phone:String(next.phone).trim(),service_type:String(next.service_type),calculation_type:"distance",covered_cities:Array.isArray(next.covered_cities)?next.covered_cities:[],routes:Array.isArray(next.routes)?next.routes:[],latitude:next.latitude==null?null:Number(next.latitude),longitude:next.longitude==null?null:Number(next.longitude),active:Boolean(next.active)})
  res.json({office})
}
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {const spike=req.scope.resolve("spike") as any;await spike.deleteSpikeDeliveryOffices(req.params.id);res.status(204).send()}
