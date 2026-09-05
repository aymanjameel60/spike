import type { ReactNode } from "react"
import { Button as ShadcnButton } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card as ShadcnCard, CardContent } from "../components/ui/card"

type ButtonTone = "primary" | "secondary" | "danger" | "ghost"
type StatusTone = "success" | "warning" | "danger" | "muted" | "info"

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`spike-vendor-page ${className}`.trim()} dir="rtl">{children}</div>
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return <div className="spike-page-header"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="spike-vendor-actions">{actions}</div>}</div>
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ShadcnCard className={`rounded-[22px] border-0 bg-[#e9e9e9] shadow-none ${className}`.trim()}><CardContent className="grid gap-4 p-5">{children}</CardContent></ShadcnCard>
}

export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`spike-vendor-grid ${className}`.trim()}>{children}</div>
}

export function Field({ label, children, wide = false, hint }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode }) {
  return <label className={wide ? "span-2" : ""}><span className="font-bold text-[#090909]">{label}</span>{children}{hint && <small className="spike-muted-text">{hint}</small>}</label>
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="spike-vendor-actions">{children}</div>
}

export function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  const variant = tone === "danger" ? "destructive" : tone === "secondary" ? "secondary" : tone === "ghost" ? "ghost" : "default"
  const toneClass = tone === "primary"
    ? "rounded-full border-black bg-black px-5 font-bold text-white shadow-none hover:bg-black/90"
    : tone === "danger"
      ? "rounded-full border-[#ad0009] bg-[#ad0009] px-5 font-bold text-white shadow-none hover:bg-[#970008]"
      : tone === "secondary"
        ? "rounded-full border border-[#d7d7d7] bg-white px-5 font-bold text-[#090909] shadow-none hover:bg-[#f5f5f5]"
        : "rounded-full px-4 font-bold text-[#090909] shadow-none hover:bg-black/5"
  return <ShadcnButton variant={variant} className={`${toneClass} ${className}`.trim()} {...props}>{children}</ShadcnButton>
}

export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) {
  const variant = tone === "success" ? "success" : tone === "danger" ? "destructive" : tone === "warning" ? "warning" : tone === "info" ? "info" : "secondary"
  return <Badge variant={variant} className="rounded-full px-2.5 py-1 font-bold">{children}</Badge>
}

export function Message({ children }: { children: ReactNode }) {
  return <div className="rounded-[18px] border border-[#dedede] bg-white px-4 py-3 text-sm font-medium text-[#090909]">{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-[20px] border border-dashed border-[#d5d5d5] bg-white px-5 py-10 text-center text-sm text-[#8f8f8f]">{children}</div>
}
