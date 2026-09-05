import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
const actorId=(req:MedusaRequest)=>(req as any).auth_context?.actor_id||(req as any).auth_context?.auth_identity_id
async function sellerId(req:MedusaRequest,actor:string){const q=req.scope.resolve(ContainerRegistrationKeys.QUERY) as any;const {data}=await q.graph({entity:"seller_member",fields:["seller.id"],filters:{member_id:actor},pagination:{take:1}});return data?.[0]?.seller?.id||null}
export async function GET(req:MedusaRequest,res:MedusaResponse){const actor=actorId(req);if(!actor)return res.status(401).json({message:"Unauthorized"});const seller=await sellerId(req,actor);if(!seller)return res.status(403).json({message:"Seller account not found"});const spike=req.scope.resolve("spike") as any;const discounts=await spike.listSpikeDiscounts({seller_id:seller},{take:500,order:{created_at:"DESC"}});res.json({discounts})}
export async function POST(req:MedusaRequest,res:MedusaResponse){
 const actor=actorId(req);if(!actor)return res.status(401).json({message:"Unauthorized"});const seller=await sellerId(req,actor);if(!seller)return res.status(403).json({message:"Seller account not found"});const b=(req.body||{}) as any;const spike=req.scope.resolve("spike") as any;
 const requestType=String(b.request_type||"discount");
 if(requestType==="coupon"){
   const code=String(b.coupon_code||"").trim().toUpperCase(),pct=Math.max(1,Math.min(99,Math.round(Number(b.coupon_percentage)||0))),targetType=String(b.target_type||"product"),targetId=String(b.target_id||"");
   if(!code||!(targetType==="store"||targetId))return res.status(400).json({message:"أدخل الكوبون واختر نطاق التطبيق"});
   const d=await spike.createSpikeDiscounts({seller_id:seller,offer_id:"coupon",product_id:targetType==="store"?seller:targetId,product_title:String(b.product_title||code),original_price:0,discounted_price:0,currency_code:"SAR",percentage:pct,active:false,status:"pending",request_type:"coupon",coupon_code:code,coupon_percentage:pct,target_type:targetType,target_id:targetType==="store"?seller:targetId,usage_limit:b.usage_limit?Number(b.usage_limit):null});
   await spike.createSpikeNotifications({audience:"admin",seller_id:seller,type:"discount_request",title:"طلب كوبون جديد",body:`${code} - ${pct}%`,entity_type:"discount",entity_id:d.id,read:false});return res.status(201).json({discount:d});
 }
 const offerId=String(b.offer_id||""),productId=String(b.product_id||""),before=Number(b.original_price),after=Number(b.discounted_price),currency=String(b.currency_code||"SAR").toUpperCase();
 if(!offerId||!productId||!Number.isFinite(before)||!Number.isFinite(after)||before<=0||after<0||after>=before)return res.status(400).json({message:"أدخل السعر قبل الخصم وبعده بشكل صحيح"});
 const pct=Math.max(1,Math.min(99,Math.round((1-after/before)*100)));const d=await spike.createSpikeDiscounts({seller_id:seller,offer_id:offerId,product_id:productId,product_title:String(b.product_title||""),original_price:before,discounted_price:after,currency_code:currency,percentage:pct,active:false,status:"pending",request_type:"discount"});
 await spike.createSpikeNotifications({audience:"admin",seller_id:seller,type:"discount_request",title:"طلب خصم جديد",body:`${b.product_title||productId} - ${pct}%`,entity_type:"discount",entity_id:d.id,read:false});res.status(201).json({discount:d})
}
