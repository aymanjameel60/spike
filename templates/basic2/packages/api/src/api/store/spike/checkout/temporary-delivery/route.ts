import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateLineItemInCartWorkflow } from "@medusajs/core-flows"
const norm=(v:any)=>String(v||"").trim().toLowerCase()
const rad=(n:number)=>n*Math.PI/180
function distanceKm(a:number,b:number,c:number,d:number){const R=6371,x=rad(c-a),y=rad(d-b),z=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z))}
export async function POST(req:MedusaRequest,res:MedusaResponse){
  const spike=req.scope.resolve("spike") as any,query=req.scope.resolve(ContainerRegistrationKeys.QUERY) as any,b=(req.body||{}) as any,cart_id=String(b.cart_id||"")
  if(!cart_id)return res.status(400).json({message:"cart_id is required"})
  const {data}=await query.graph({entity:"cart",fields:["id","shipping_address.city","shipping_address.province","shipping_address.metadata","items.id","items.product_id","items.product_title","items.quantity","items.metadata","items.offer.seller_id"],filters:{id:cart_id},pagination:{take:1}})
  const cart=data?.[0];if(!cart)return res.status(404).json({message:"Cart not found"})
  const city=String(b.city||cart.shipping_address?.city||cart.shipping_address?.province||"").trim(),lat=Number(b.latitude??cart.shipping_address?.metadata?.latitude),lng=Number(b.longitude??cart.shipping_address?.metadata?.longitude)
  if(!city)return res.status(422).json({message:"حدد مدينة العميل أولاً"})
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return res.status(422).json({message:"حدد موقع العميل من الخريطة لحساب الشحن"})
  const offices=await spike.listSpikeDeliveryOffices({active:true},{take:1000}),rateRows=await spike.listSpikeSettings({key:"delivery_rate_per_km_old_yer"},{take:1}),ratePerKm=Number(rateRows[0]?.value??10)
  const shipments:any[]=[]
  for(const item of cart.items||[]){
    const pd=(await spike.listSpikeProductDeliveries({product_id:item.product_id,active:true},{take:1}))[0]
    const officeIds=(pd?.office_ids?.length?pd.office_ids:[pd?.delivery_office_id]).map(String).filter(Boolean)
    if(!officeIds.length)return res.status(422).json({message:`المنتج ${item.product_title||item.product_id} لا يحتوي على مكتب توصيل. عدّل المنتج وحدد مكتبًا أولاً.`,product_id:item.product_id})
    const candidates=offices.filter((o:any)=>officeIds.includes(String(o.id)))
    if(!candidates.length)return res.status(422).json({message:`مكتب التوصيل المرتبط بالمنتج ${item.product_title||item.product_id} متوقف أو غير موجود`})
    const sellerId=item.offer?.seller_id||pd?.seller_id
    const prof=sellerId?await spike.listSpikeSettings({key:`seller_profile:${sellerId}`},{take:1}):[]
    const sellerLoc=prof[0]?.value||{}
    if(!sellerLoc.city||sellerLoc.latitude==null||sellerLoc.longitude==null)return res.status(422).json({message:"التاجر لم يحدد موقع متجره بعد",seller_id:sellerId})
    const same=norm(sellerLoc.city)===norm(city);let quote:any=null
    if(same){const office=candidates.find((o:any)=>["in_city","both"].includes(String(o.service_type))&&(norm(o.city)===norm(city)||!o.city));if(office){const dist=distanceKm(Number(sellerLoc.latitude),Number(sellerLoc.longitude),lat,lng);quote={office,amount:Math.ceil(dist*ratePerKm),distance_km:dist,mode:"in_city",rate_per_km:ratePerKm}}}
    else for(const office of candidates.filter((o:any)=>["intercity","both"].includes(String(o.service_type)))){const routes=Array.isArray(office.routes)?office.routes:[];const route=routes.find((r:any)=>(norm(r.from_city)===norm(sellerLoc.city)&&norm(r.to_city)===norm(city))||(norm(r.to_city)===norm(sellerLoc.city)&&norm(r.from_city)===norm(city)));if(route){const amount=Number(route.amount||0);if(!quote||amount<quote.amount)quote={office,amount,mode:"intercity",route}}}
    if(!quote)return res.status(422).json({message:`مكتب التوصيل المرتبط بالمنتج ${item.product_title||item.product_id} لا يغطي عنوانك الحالي.`,product_id:item.product_id})
    const metadata={...(item.metadata||{}),spike_delivery_office_id:quote.office.id,spike_delivery_office_name:quote.office.name,spike_delivery_office_phone:quote.office.phone||null,spike_delivery_amount:quote.amount,spike_delivery_mode:quote.mode,spike_external_delivery:true}
    await updateLineItemInCartWorkflow(req.scope).run({input:{cart_id,item_id:item.id,update:{requires_shipping:false,metadata}}} as any)
    shipments.push({item_id:item.id,product_id:item.product_id,seller_id:sellerId,office_id:quote.office.id,office_name:quote.office.name,delivery_amount:quote.amount,mode:quote.mode,distance_km:quote.distance_km||null})
  }
  res.json({ok:true,external_shipping:true,shipments,delivery_total:shipments.reduce((s,x)=>s+Number(x.delivery_amount||0),0)})
}
