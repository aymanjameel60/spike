import type { ReactNode } from "react"

type ButtonTone = "primary" | "secondary" | "danger" | "ghost"
type StatusTone = "success" | "warning" | "danger" | "muted" | "info"

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`spike-native-page ${className}`.trim()} dir="rtl">{children}</div>
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return <div className="spike-native-header"><div><h1 className="spike-native-title">{title}</h1>{description && <p className="spike-native-muted">{description}</p>}</div>{actions && <div className="spike-native-actions">{actions}</div>}</div>
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`spike-native-card ${className}`.trim()}>{children}</section>
}

export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`spike-native-form ${className}`.trim()}>{children}</div>
}

export function Field({ label, children, wide = false, hint }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode }) {
  return <label className={`spike-native-field${wide ? " wide" : ""}`}><span>{label}</span>{children}{hint && <small className="spike-native-muted">{hint}</small>}</label>
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="spike-native-actions">{children}</div>
}

export function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  const toneClass = tone === "secondary" || tone === "ghost" ? " secondary" : tone === "danger" ? " danger" : ""
  return <button className={`spike-native-btn${toneClass} ${className}`.trim()} {...props}>{children}</button>
}

export function Status({ children, tone = "muted" }: { children: ReactNode; tone?: StatusTone }) {
  const cls = tone === "success" ? "ok" : tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "info" ? "info" : "off"
  return <span className={`spike-status ${cls}`}>{children}</span>
}

export function Message({ children }: { children: ReactNode }) {
  return <div className="spike-native-message">{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="spike-native-empty">{children}</div>
}
