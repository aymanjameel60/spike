import type { MedusaRequest,MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateOffersWorkflow } from "@mercurjs/core/workflows"
import { createPromotionsWorkflow } from "@medusajs/core-flows"

const rulesFor=(d:any)=>d.target_type==="store"?[{operator:"eq",attribute:"items.offer.seller.id",values:[d.seller_id]}]:d.target_type==="collection"?[{operator:"eq",attribute:"items.product.collection_id",values:[d.target_id]}]:[{operator:"eq",attribute:"items.product.id",values:[d.target_id]}]

async function removePromotionByCode(req:MedusaRequest,code?:string|null){
  if(!code)return
  const svc=req.scope.resolve(Modules.PROMOTION) as any
  const rows=await svc.listPromotions({code:String(code)},{take:50})
  const ids=(rows||[]).map((x:any)=>x.id).filter(Boolean)
  if(ids.length&&typeof svc.deletePromotions==='function')await svc.deletePromotions(ids)
}

async function createCouponPromotion(req:MedusaRequest,d:any){
  await createPromotionsWorkflow(req.scope).run({input:{promotionsData:[{
    code:String(d.coupon_code||'').trim().toUpperCase(),is_automatic:false,type:"standard",status:"active",limit:d.usage_limit||null,
    application_method:{type:"percentage",value:Number(d.coupon_percentage||d.percentage),target_type:"items",allocation:"each",max_quantity:999999,target_rules:rulesFor(d)}
  }]}} as any)
}

export async function POST(req:MedusaRequest,res:MedusaResponse){
  const spike=req.scope.resolve("spike") as any
  const rows=await spike.listSpikeDiscounts({id:req.params.id},{take:1}),d=rows[0]
  if(!d)return res.status(404).json({message:"Request not found"})
  if(d.status!=="pending")return res.status(409).json({message:"تمت معالجة الطلب"})
  const b=(req.body||{}) as any
  if(b.action==="reject"){
    const u=await spike.updateSpikeDiscounts({id:d.id,status:"rejected",active:false,rejection_reason:String(b.reason||"تم رفض الخصم")})
    await spike.createSpikeNotifications({audience:"vendor",seller_id:d.seller_id,type:"discount_rejected",title:"تم رفض الخصم",body:u.rejection_reason,entity_type:"discount",entity_id:d.id,read:false})
    return res.json({discount:u})
  }
  if(b.action!=="approve")return res.status(400).json({message:"Invalid action"})
  try{
    if(d.request_type==="coupon")await createCouponPromotion(req,d)
    else await updateOffersWorkflow(req.scope).run({input:{offers:[{id:d.offer_id,prices:[{amount:Number(d.discounted_price),currency_code:String(d.currency_code).toLowerCase()}],metadata:{compare_at_price:Number(d.original_price),spike_discount_id:d.id,spike_discount_percentage:Number(d.percentage)}}]}} as any)
  }catch(e:any){console.error("[Spike discount approval]",e);return res.status(500).json({message:`فشل تفعيل الخصم: ${e?.message||"خطأ داخلي"}`})}
  const u=await spike.updateSpikeDiscounts({id:d.id,status:"approved",active:true,rejection_reason:null})
  await spike.createSpikeNotifications({audience:"vendor",seller_id:d.seller_id,type:"discount_approved",title:"تمت الموافقة على الخصم",body:d.request_type==="coupon"?String(d.coupon_code):`${d.product_title||"المنتج"} - ${d.percentage}%`,entity_type:"discount",entity_id:d.id,read:false})
  res.json({discount:u})
}

export async function PATCH(req:MedusaRequest,res:MedusaResponse){
  const spike=req.scope.resolve("spike") as any
  const rows=await spike.listSpikeDiscounts({id:req.params.id},{take:1}),d=rows[0]
  if(!d)return res.status(404).json({message:"Coupon not found"})
  if(d.request_type!=="coupon")return res.status(400).json({message:"هذا المسار لتعديل الكوبونات فقط"})
  const b=(req.body||{}) as any
  const next={
    ...d,
    coupon_code:String(b.coupon_code??d.coupon_code??'').trim().toUpperCase(),
    coupon_percentage:Number(b.coupon_percentage??d.coupon_percentage??d.percentage),
    target_type:String(b.target_type??d.target_type??'store'),
    target_id:b.target_id===undefined?d.target_id:(b.target_id?String(b.target_id):null),
    usage_limit:b.usage_limit===undefined?d.usage_limit:(b.usage_limit===null||b.usage_limit===''?null:Number(b.usage_limit)),
    active:b.active===undefined?d.active:Boolean(b.active),
  }
  if(!next.coupon_code)return res.status(400).json({message:"كود الكوبون مطلوب"})
  if(!(next.coupon_percentage>0&&next.coupon_percentage<=100))return res.status(400).json({message:"نسبة الكوبون يجب أن تكون بين 1 و100"})
  if(next.status==='approved'){
    try{await removePromotionByCode(req,d.coupon_code);if(next.active)await createCouponPromotion(req,next)}
    catch(e:any){console.error('[Spike coupon edit]',e);return res.status(500).json({message:`تعذر تحديث الكوبون الفعلي: ${e?.message||'خطأ داخلي'}`})}
  }
  const u=await spike.updateSpikeDiscounts({id:d.id,coupon_code:next.coupon_code,coupon_percentage:next.coupon_percentage,percentage:next.coupon_percentage,target_type:next.target_type,target_id:next.target_id,usage_limit:next.usage_limit,active:next.active})
  res.json({discount:u})
}

export async function DELETE(req:MedusaRequest,res:MedusaResponse){
  const spike=req.scope.resolve("spike") as any
  const rows=await spike.listSpikeDiscounts({id:req.params.id},{take:1}),d=rows[0]
  if(!d)return res.status(404).json({message:"Coupon not found"})
  if(d.request_type!=="coupon")return res.status(400).json({message:"هذا المسار لحذف الكوبونات فقط"})
  try{if(d.status==='approved')await removePromotionByCode(req,d.coupon_code)}catch(e:any){return res.status(500).json({message:`تعذر حذف الكوبون الفعلي: ${e?.message||'خطأ داخلي'}`})}
  await spike.deleteSpikeDiscounts([d.id])
  res.json({id:d.id,deleted:true})
}
