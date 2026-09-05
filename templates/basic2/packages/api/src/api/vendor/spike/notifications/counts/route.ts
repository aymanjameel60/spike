import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
const actorId=(req:MedusaRequest)=>(req as any).auth_context?.actor_id||(req as any).auth_context?.auth_identity_id
async function sellerId(req:MedusaRequest,actor_id:string){try{const q=req.scope.resolve(ContainerRegistrationKeys.QUERY) as any;const {data}=await q.graph({entity:"seller_member",fields:["seller.id"],filters:{member_id:actor_id},pagination:{take:1}});return data?.[0]?.seller?.id||null}catch{return null}}
export async function GET(req:MedusaRequest,res:MedusaResponse){const spike=req.scope.resolve("spike") as any;const actor=actorId(req);if(!actor)return res.status(401).json({message:"Unauthorized"});const seller=await sellerId(req,actor);const notes=seller?await spike.listSpikeNotifications({audience:"vendor",seller_id:seller,read:false},{take:500}):[];res.json({counts:{notifications:notes.length,total:notes.length}})}
