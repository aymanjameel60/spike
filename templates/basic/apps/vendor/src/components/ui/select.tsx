import * as React from "react"
import {cn} from "cn"
type Option={value:string;label:string}
type SelectProps={value:string;onValueChange:(value:string)=>void;options:Option[];placeholder?:string;className?:string;disabled?:boolean}
function Select({value,onValueChange,options,placeholder,className,disabled}:SelectProps){return <select data-slot="select" value={value} disabled={disabled} onChange={e=>onValueChange(e.target.value)} className={cn("border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-[22px] border bg-background px-3 text-sm shadow-none outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",className)}>{placeholder&&<option value="">{placeholder}</option>}{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>}
export{Select}
