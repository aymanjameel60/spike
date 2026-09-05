import { defineWidgetConfig } from "@mercurjs/dashboard-sdk"

export const config = defineWidgetConfig({ zone: "products.list.before" })
export default function ProductPolicyNotice(){
  return <div dir="rtl" style={{marginBottom:12,padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:10,background:"#fff",fontSize:13}}><b>سياسة منتجات Spike:</b> المنتجات ينشئها التجار. الأدمن يراجعها ويوافق/يرفض ويحذف عند الحاجة، ولا يعدّل بيانات المنتج أو سعره.</div>
}
