import type { ReactNode } from "react"

type ButtonTone = "primary" | "secondary" | "danger" | "ghost"
type StatusTone = "success" | "warning" | "danger" | "muted" | "info"

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`spike-vendor-page ${className}`.trim()} dir="rtl">{children}</div>
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return <div className="spike-page-header"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="spike-vendor-actions">{actions}</div>}</div>
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`spike-vendor-card ${className}`.trim()}>{children}</section>
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
  const cls = tone === "secondary" || tone === "ghost" ? "spike-secondary-button" : tone === "danger" ? "spike-primary-button spike-danger-button" : "spike-primary-button"
  return <button className={`${cls} ${className}`.trim()} {...props}>{children}</button>
}

export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) {
  const cls = tone === "success" ? "approved" : tone === "danger" ? "rejected" : tone === "warning" ? "pending" : tone === "info" ? "proposed" : ""
  return <span className={`spike-status-pill ${cls}`.trim()}>{children}</span>
}

export function Message({ children }: { children: ReactNode }) {
  return <div className="spike-vendor-note">{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="spike-empty">{children}</div>
}
