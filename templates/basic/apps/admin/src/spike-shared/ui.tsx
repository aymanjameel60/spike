import type { ReactNode } from "react"
import { Button as ShadButton } from "@/components/ui/button"
import { Card as ShadCard, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ButtonTone = "primary" | "secondary" | "danger" | "ghost"
type StatusTone = "success" | "warning" | "danger" | "muted" | "info"

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1480px] space-y-5 px-4 py-5 md:px-7 md:py-7 xl:px-8 ${className}`.trim()} dir="rtl">{children}</div>
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0 space-y-1.5"><h1 className="text-[25px] font-extrabold leading-[1.25] tracking-[-.35px] text-[#090909] md:text-[27px]">{title}</h1>{description&&<p className="max-w-3xl text-[13px] leading-6 text-[#8f8f8f] md:text-sm">{description}</p>}</div>{actions&&<div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}</div>
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ShadCard className={`overflow-hidden rounded-[24px] border border-[#e3e3e3] bg-white shadow-none ${className}`.trim()}><CardContent className="p-4 md:p-5 xl:p-6">{children}</CardContent></ShadCard>
}

export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 ${className}`.trim()}>{children}</div>
}

export function Field({ label, children, wide = false, hint }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode }) {
  return <label className={`flex min-w-0 flex-col gap-2 text-[13px] font-bold text-[#090909] ${wide ? "md:col-span-2" : ""}`.trim()}><span>{label}</span>{children}{hint&&<small className="text-xs font-normal leading-5 text-[#8f8f8f]">{hint}</small>}</label>
}

export function Actions({ children }: { children: ReactNode }) { return <div className="flex flex-wrap items-center gap-2.5">{children}</div> }

export function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  const variant=tone==="secondary"?"outline":tone==="danger"?"destructive":tone==="ghost"?"ghost":"default";const toneClass=tone==="primary"?"border-black bg-black text-white hover:bg-black/90":tone==="danger"?"border-[#ad0009] bg-[#ad0009] text-white hover:bg-[#970008]":tone==="secondary"?"border-[#dddddd] bg-white text-[#090909] hover:bg-[#f5f5f5]":"text-[#090909] hover:bg-black/5";return <ShadButton variant={variant} className={`min-h-10 rounded-full px-5 text-[13px] font-bold shadow-none transition-colors ${toneClass} ${className}`.trim()} {...props}>{children}</ShadButton>
}

export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) {
  const toneClass=tone==="success"?"bg-emerald-50 text-emerald-700 ring-emerald-200":tone==="danger"?"bg-red-50 text-[#ad0009] ring-red-200":tone==="warning"?"bg-amber-50 text-amber-700 ring-amber-200":tone==="info"?"bg-blue-50 text-blue-700 ring-blue-200":"bg-[#f4f4f4] text-[#858585] ring-[#e2e2e2]";return <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${toneClass}`}>{children}</Badge>
}

export function Message({ children }: { children: ReactNode }) { return <div className="rounded-[18px] border border-[#dedede] bg-[#f8f8f8] px-4 py-3 text-[13px] leading-6 text-[#090909]">{children}</div> }
export function Empty({ children }: { children: ReactNode }) { return <div className="rounded-[22px] border border-dashed border-[#d7d7d7] bg-[#fafafa] px-5 py-12 text-center text-sm leading-6 text-[#8f8f8f]">{children}</div> }
