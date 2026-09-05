import type { ReactNode } from "react"
import { Button as ShadButton } from "@/components/ui/button"
import { Card as ShadCard, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ButtonTone = "primary" | "secondary" | "danger" | "ghost"
type StatusTone = "success" | "warning" | "danger" | "muted" | "info"

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 md:px-7 md:py-6 ${className}`.trim()} dir="rtl">{children}</div>
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <ShadCard className={`border-0 bg-card shadow-none ring-1 ring-border ${className}`.trim()}>
      <CardContent className="p-4 md:p-5">{children}</CardContent>
    </ShadCard>
  )
}

export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`.trim()}>{children}</div>
}

export function Field({ label, children, wide = false, hint }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode }) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-foreground ${wide ? "md:col-span-2" : ""}`.trim()}>
      <span>{label}</span>
      {children}
      {hint && <small className="text-xs font-normal text-muted-foreground">{hint}</small>}
    </label>
  )
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

export function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  const variant = tone === "secondary" ? "outline" : tone === "danger" ? "destructive" : tone === "ghost" ? "ghost" : "default"
  return <ShadButton variant={variant} className={`min-h-10 px-4 ${className}`.trim()} {...props}>{children}</ShadButton>
}

export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) {
  const toneClass = tone === "success"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : tone === "danger"
      ? "bg-red-50 text-red-700 ring-red-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : tone === "info"
          ? "bg-blue-50 text-blue-700 ring-blue-200"
          : "bg-muted text-muted-foreground ring-border"
  return <Badge variant="outline" className={`rounded-full px-2.5 py-1 font-medium ${toneClass}`}>{children}</Badge>
}

export function Message({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">{children}</div>
}
