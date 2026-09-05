import { useEffect, useMemo, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import "../../spike-shared/spike-native.css"

declare const __BACKEND_URL__: string
export const config: RouteConfig = { label: "التقارير", rank: 71 }
const n=(x:any)=>Number(x?.value ?? x ?? 0)||0
const money=(x:number,c="SAR")=>`${x.toFixed(2)} ${c}`
const sellerOf=(o:any)=>o.seller?.name||o.store?.name||o.vendor?.name||o.seller_name||"غير محدد"
const sellerId=(o:any)=>o.seller?.id||o.store?.id||o.vendor?.id||o.seller_id||""
const download=(rows:any[])=>{const headers=["رقم الطلب","التاريخ","التاجر","الإجمالي","نسبة العمولة","قيمة العمولة","الصافي","العملة"];const csv=[headers.join(","),...rows.map(r=>[r.display_id||r.id,new Date(r.created_at).toLocaleDateString("ar"),sellerOf(r),r.total,r.commission_percent,r.commission,r.net,r.currency_code].map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=`spike-admin-report-${Date.now()}.csv`;a.click();URL.revokeObjectURL(a.href)}
export default function AdminReports(){
 const [orders,setOrders]=useState<any[]>([]);const [globalCommission,setGlobalCommission]=useState(0);const [sellerCommissions,setSellerCommissions]=useState<Record<string,number>>({});const [from,setFrom]=useState("");const [to,setTo]=useState("");const [seller,setSeller]=useState("")
 useEffect(()=>{fetch(`${__BACKEND_URL__}/admin/orders?limit=500&fields=*seller,*store`,{credentials:"include"}).then(r=>r.json()).then(d=>setOrders(d.orders||[])).catch(()=>{});fetch(`${__BACKEND_URL__}/admin/spike/settings`,{credentials:"include"}).then(r=>r.json()).then(d=>setGlobalCommission(n(d.settings?.commission_percent))).catch(()=>{});fetch(`${__BACKEND_URL__}/admin/spike/commission`,{credentials:"include"}).then(r=>r.json()).then(d=>setSellerCommissions(Object.fromEntries((d.commissions||[]).map((x:any)=>[x.seller_id,n(x.percent)])))).catch(()=>{})},[])
 const sellers = useMemo<[string, string][]>(() => {
  const map = new Map<string, string>()
  for (const order of orders) {
    const id = String(sellerId(order) || "")
    if (!id) continue
    map.set(id, String(sellerOf(order) || "غير محدد"))
  }
  return Array.from(map.entries())
 }, [orders])
 const rows=useMemo(()=>orders.filter(o=>(!from||new Date(o.created_at)>=new Date(from))&&(!to||new Date(o.created_at)<=new Date(to+"T23:59:59"))&&(!seller||sellerId(o)===seller)).map(o=>{const total=n(o.total);const sid=sellerId(o);const pct=sellerCommissions[sid]??globalCommission;const commission=total*pct/100;return {...o,total,commission_percent:pct,commission,net:total-commission}}),[orders,from,to,seller,globalCommission,sellerCommissions])
 const total=rows.reduce((a,r)=>a+r.total,0),com=rows.reduce((a,r)=>a+r.commission,0),net=rows.reduce((a,r)=>a+r.net,0),cur=rows[0]?.currency_code?.toUpperCase()||"SAR"
 return <div className="spike-native-page"><div className="spike-native-card"><h1 className="spike-native-title">تقارير Spike</h1><p className="spike-native-muted">تقرير المنصة كاملة أو تاجر محدد، مع خصم عمولة النظام وحساب صافي المستحق.</p><div className="spike-native-toolbar"><label className="spike-native-field">من<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="spike-native-field">إلى<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><label className="spike-native-field">التاجر<select value={seller} onChange={e=>setSeller(e.target.value)}><option value="">كل التجار</option>{sellers.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label><button className="spike-native-btn" onClick={()=>download(rows)}>تصدير Excel / CSV</button></div><div className="spike-native-kpis"><div className="spike-native-kpi">المبيعات<b>{money(total,cur)}</b></div><div className="spike-native-kpi">عمولة Spike<b>{money(com,cur)}</b></div><div className="spike-native-kpi">صافي التجار<b>{money(net,cur)}</b></div><div className="spike-native-kpi">الطلبات<b>{rows.length}</b></div></div><table className="spike-native-table"><thead><tr><th>الطلب</th><th>التاجر</th><th>التاريخ</th><th>الإجمالي</th><th>العمولة</th><th>الصافي</th></tr></thead><tbody>{rows.slice(0,150).map(r=><tr key={r.id}><td>#{r.display_id||r.id}</td><td>{sellerOf(r)}</td><td>{new Date(r.created_at).toLocaleDateString("ar")}</td><td>{money(r.total,cur)}</td><td>{r.commission_percent}% — {money(r.commission,cur)}</td><td>{money(r.net,cur)}</td></tr>)}</tbody></table></div></div>
}
