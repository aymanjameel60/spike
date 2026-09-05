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
  return <ShadcnCard className={className}><CardContent className="grid gap-4 p-5">{children}</CardContent></ShadcnCard>
}

export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`spike-vendor-grid ${className}`.trim()}>{children}</div>
}

export function Field({ label, children, wide = false, hint }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode }) {
  return <label className={wide ? "span-2" : ""}><span>{label}</span>{children}{hint && <small className="spike-muted-text">{hint}</small>}</label>
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="spike-vendor-actions">{children}</div>
}

export function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  const variant = tone === "danger" ? "destructive" : tone === "secondary" ? "secondary" : tone === "ghost" ? "ghost" : "default"
  return <ShadcnButton variant={variant} className={className} {...props}>{children}</ShadcnButton>
}

export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) {
  const variant = tone === "success" ? "success" : tone === "danger" ? "destructive" : tone === "warning" ? "warning" : tone === "info" ? "info" : "secondary"
  return <Badge variant={variant}>{children}</Badge>
}

export function Message({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground">{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="spike-empty">{children}</div>
}
