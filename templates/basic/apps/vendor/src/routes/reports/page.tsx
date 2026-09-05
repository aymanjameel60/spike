import { useEffect, useMemo, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import "../../spike/vendor-spike.css"

declare const __BACKEND_URL__: string
export const config: RouteConfig = { label: "التقارير", rank: 81 }

const n=(x:any)=>Number(x?.value ?? x ?? 0)||0
const money=(x:number,c="SAR")=>`${x.toFixed(2)} ${c}`
const download=(rows:any[])=>{const headers=["رقم الطلب","التاريخ","الإجمالي","العمولة","الصافي","العملة"];const csv=[headers.join(","),...rows.map(r=>[r.display_id||r.id,new Date(r.created_at).toLocaleDateString("ar"),r.total,r.commission,r.net,r.currency_code].map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=`spike-vendor-report-${Date.now()}.csv`;a.click();URL.revokeObjectURL(a.href)}

export default function VendorReports(){
 const [orders,setOrders]=useState<any[]>([]); const [commission,setCommission]=useState(0); const [from,setFrom]=useState("");const [to,setTo]=useState("")
 useEffect(()=>{fetch(`${__BACKEND_URL__}/vendor/orders?limit=500`,{credentials:"include"}).then(r=>r.json()).then(d=>setOrders(d.orders||[])).catch(()=>{});fetch(`${__BACKEND_URL__}/vendor/spike/exchange-rates`,{credentials:"include"}).then(r=>r.json()).then(d=>setCommission(n(d.settings?.commission_percent))).catch(()=>{})},[])
 const rows=useMemo(()=>orders.filter(o=>(!from||new Date(o.created_at)>=new Date(from))&&(!to||new Date(o.created_at)<=new Date(to+"T23:59:59"))).map(o=>{const total=n(o.total);const com=total*commission/100;return {...o,total,commission:com,net:total-com}}),[orders,from,to,commission]);
 const total=rows.reduce((a,r)=>a+r.total,0), com=rows.reduce((a,r)=>a+r.commission,0), net=rows.reduce((a,r)=>a+r.net,0), cur=rows[0]?.currency_code?.toUpperCase()||"SAR"
 return <div className="spike-page"><div className="spike-card"><h1 className="spike-title">تقارير المبيعات</h1><p className="spike-muted">عمولة Spike الحالية: {commission}%</p><div className="spike-toolbar"><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="spike-btn" onClick={()=>download(rows)}>تصدير Excel / CSV</button></div><div className="spike-kpis"><div className="spike-kpi">المبيعات<b>{money(total,cur)}</b></div><div className="spike-kpi">عمولة Spike<b>{money(com,cur)}</b></div><div className="spike-kpi">صافي المستحق<b>{money(net,cur)}</b></div><div className="spike-kpi">الطلبات<b>{rows.length}</b></div></div><table className="spike-table"><thead><tr><th>الطلب</th><th>التاريخ</th><th>الإجمالي</th><th>العمولة</th><th>الصافي</th></tr></thead><tbody>{rows.slice(0,100).map(r=><tr key={r.id}><td>#{r.display_id||r.id}</td><td>{new Date(r.created_at).toLocaleDateString("ar")}</td><td>{money(r.total,cur)}</td><td>{money(r.commission,cur)}</td><td>{money(r.net,cur)}</td></tr>)}</tbody></table></div></div>
}
