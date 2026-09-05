import { useEffect, useState } from "react"
import type { RouteConfig } from "@mercurjs/dashboard-sdk"
import "../../spike/vendor-spike.css"

declare const __BACKEND_URL__: string
export const config: RouteConfig = { label: "مكاتب التوصيل", rank: 82 }

type Office = { id:string; name:string; governorate?:string; city?:string; phone?:string; calculation_type:string; covered_cities?:Array<{city:string;rate:number}> }

export default function DeliverySettingsPage(){
  const [offices,setOffices]=useState<Office[]>([]); const [selected,setSelected]=useState<string[]>([]); const [msg,setMsg]=useState("")
  const load=()=>fetch(`${__BACKEND_URL__}/vendor/spike/delivery-settings`,{credentials:"include"}).then(r=>r.json()).then(d=>{setOffices(d.offices||[]);setSelected(d.selected_office_ids||[])})
  useEffect(()=>{load().catch(()=>setMsg("تعذر تحميل مكاتب التوصيل"))},[])
  const toggle=(id:string)=>setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])
  const save=async()=>{setMsg("جاري الحفظ...");const r=await fetch(`${__BACKEND_URL__}/vendor/spike/delivery-settings`,{method:"POST",credentials:"include",headers:{"content-type":"application/json"},body:JSON.stringify({office_ids:selected})});setMsg(r.ok?"تم حفظ مكاتب التوصيل":"تعذر الحفظ")}
  return <div className="spike-page"><div className="spike-card"><h1 className="spike-title">مكاتب التوصيل</h1><p className="spike-muted">اختر المكاتب التي يتعامل معها متجرك. الأسعار والمدن يحددها الأدمن.</p><div className="spike-grid">{offices.map(o=><div className="spike-office" key={o.id}><label><input type="checkbox" checked={selected.includes(o.id)} onChange={()=>toggle(o.id)}/>{o.name}</label><div className="spike-city">{[o.governorate,o.city].filter(Boolean).join(" - ")} {o.phone?`• ${o.phone}`:""}</div><div className="spike-city">الحساب: {o.calculation_type==="kg"?"بالكيلو":"بالقطعة"}</div>{(o.covered_cities||[]).map((c,i)=><div className="spike-city" key={i}>{c.city}: {c.rate} / {o.calculation_type==="kg"?"كجم":"قطعة"}</div>)}</div>)}</div><div className="spike-toolbar"><button className="spike-btn" onClick={save}>حفظ</button><span className={msg.includes("تم")?"spike-ok":"spike-muted"}>{msg}</span></div></div></div>
}
