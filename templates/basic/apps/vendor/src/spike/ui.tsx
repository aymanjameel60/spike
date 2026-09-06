import type { ReactNode } from "react"
import { Button as ShadcnButton } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card as ShadcnCard, CardContent } from "../components/ui/card"

type ButtonTone = "primary" | "secondary" | "danger" | "ghost"
type StatusTone = "success" | "warning" | "danger" | "muted" | "info"

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`spike-vendor-page ${className}`.trim()} dir="rtl">{children}</div> }
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) { return <div className="spike-page-header"><div className="spike-page-header-copy"><h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions&&<div className="spike-vendor-actions">{actions}</div>}</div> }
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <ShadcnCard className={`overflow-hidden rounded-[24px] border border-[#e3e3e3] bg-white shadow-none ${className}`.trim()}><CardContent className="grid gap-5 p-4 md:p-5 xl:p-6">{children}</CardContent></ShadcnCard> }
export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`spike-vendor-grid ${className}`.trim()}>{children}</div> }
export function Field({ label, children, wide = false, hint }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode }) { return <label className={wide?"span-2":""}><span className="font-bold text-[#090909]">{label}</span>{children}{hint&&<small className="spike-muted-text">{hint}</small>}</label> }
export function Actions({ children }: { children: ReactNode }) { return <div className="spike-vendor-actions">{children}</div> }
export function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) { const variant=tone==="danger"?"destructive":tone==="secondary"?"secondary":tone==="ghost"?"ghost":"default";const toneClass=tone==="primary"?"rounded-full border-black bg-black px-5 font-bold text-white shadow-none hover:bg-black/90":tone==="danger"?"rounded-full border-[#ad0009] bg-[#ad0009] px-5 font-bold text-white shadow-none hover:bg-[#970008]":tone==="secondary"?"rounded-full border border-[#dddddd] bg-white px-5 font-bold text-[#090909] shadow-none hover:bg-[#f5f5f5]":"rounded-full px-4 font-bold text-[#090909] shadow-none hover:bg-black/5";return <ShadcnButton variant={variant} className={`min-h-10 text-[13px] transition-colors ${toneClass} ${className}`.trim()} {...props}>{children}</ShadcnButton> }
export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) { const variant=tone==="success"?"success":tone==="danger"?"destructive":tone==="warning"?"warning":tone==="info"?"info":"secondary";return <Badge variant={variant} className="rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ring-black/5">{children}</Badge> }
export function Message({ children }: { children: ReactNode }) { return <div className="rounded-[18px] border border-[#dedede] bg-[#f8f8f8] px-4 py-3 text-[13px] leading-6 font-medium text-[#090909]">{children}</div> }
export function Empty({ children }: { children: ReactNode }) { return <div className="rounded-[22px] border border-dashed border-[#d7d7d7] bg-[#fafafa] px-5 py-12 text-center text-sm leading-6 text-[#8f8f8f]">{children}</div> }
