import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"
import "./spike-admin.css"

declare const __BACKEND_URL__: string

type Tab = "overview" | "vendors" | "currencies" | "commission" | "returns"
type Settings = Record<string, any>

type SellerRequest = {
  id: string
  status?: string
  type?: string
  created_at?: string
  seller?: { id?: string; name?: string; email?: string }
  store?: { id?: string; name?: string }
  data?: Record<string, any>
  metadata?: Record<string, any>
}

const defaults: Settings = {
  marketplace_name: "Spike",
  default_currency: "SAR",
  enabled_currencies: ["SAR", "USD", "YER_OLD", "YER_NEW"],
  exchange_usd_sar: "3.75",
  exchange_usd_yer_old: "535",
  exchange_usd_yer_new: "1630",
  commission_percent: "5",
  cod_enabled: true,
  bank_transfer_enabled: true,
  vendor_approval_required: true,
  product_approval_required: true,
  vendor_return_policy_enabled: true,
  default_return_days: "7",
  default_return_policy: "يمكن إرجاع المنتج حسب سياسة البائع وحالة المنتج.",
  bank_accounts: [],
  banner_items: [],
}

const tabs: Array<{ key: Tab; label: string }> = [
  { key: "overview", label: "الرئيسية" },
  { key: "vendors", label: "طلبات البائعين" },
  { key: "currencies", label: "العملات والصرف" },
  { key: "commission", label: "العمولات" },
  { key: "returns", label: "سياسات الإرجاع" },
]

function backendUrl() {
  try {
    return String(__BACKEND_URL__ || "http://localhost:9000").replace(/\/$/, "")
  } catch {
    return "http://localhost:9000"
  }
}

async function apiJson(path: string, init?: RequestInit) {
  const response = await fetch(`${backendUrl()}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(`${response.status}${message ? `: ${message.slice(0, 180)}` : ""}`)
  }

  return response.json()
}

function countFrom(data: any) {
  if (typeof data?.count === "number") return data.count
  if (typeof data?.total === "number") return data.total
  for (const key of ["orders", "products", "customers", "sellers", "requests"]) {
    if (Array.isArray(data?.[key])) return data[key].length
  }
  return 0
}

export default function SpikeAdminPage() {
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get("section") as Tab) || "overview"
  const [tab, setTab] = useState<Tab>(initialTab)
  useEffect(() => { const section=searchParams.get("section") as Tab | null; if(section) setTab(section) }, [searchParams])
  const [settings, setSettings] = useState<Settings>(defaults)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [apiError, setApiError] = useState("")

  const set = (key: string, value: any) => setSettings((current) => ({ ...current, [key]: value }))

  const loadSettings = async () => {
    setApiError("")
    try {
      const data = await apiJson("/admin/spike/settings")
      setSettings({ ...defaults, ...(data.settings || {}) })
      setLoaded(true)
    } catch (error) {
      setLoaded(true)
      setApiError(error instanceof Error ? error.message : "تعذر الاتصال بالـ API")
    }
  }

  useEffect(() => {
    void loadSettings()
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage("")
    setApiError("")
    try {
      const data = await apiJson("/admin/spike/settings", {
        method: "POST",
        body: JSON.stringify({ settings }),
      })
      setSettings({ ...defaults, ...(data.settings || settings) })
      setMessage("تم حفظ إعدادات Spike")
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "تعذر حفظ الإعدادات")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="spike-native-page" dir="rtl">
      <header className="spike-page-head">
        <div>
          <div className="spike-kicker">SPIKE MARKETPLACE</div>
          <h1>إدارة Spike</h1>
          <p>إعدادات المنصة والعمليات الخاصة بالسوق متعدد البائعين.</p>
        </div>
        <button className="spike-primary" onClick={save} disabled={saving || !loaded}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </header>

      {apiError && (
        <div className="spike-alert spike-alert-error">
          <strong>تعذر الاتصال بإعدادات Spike.</strong>
          <span>API: {backendUrl()} — {apiError}</span>
        </div>
      )}
      {message && <div className="spike-alert spike-alert-ok">{message}</div>}

      <nav className="spike-tabs" aria-label="Spike sections">
        {tabs.map((item) => (
          <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview settings={settings} set={set} />}
      {tab === "vendors" && <VendorRequests />}
      {tab === "currencies" && <Currencies settings={settings} set={set} />}
      {tab === "commission" && <Commission settings={settings} set={set} />}
      {tab === "returns" && <Returns settings={settings} set={set} />}
    </div>
  )
}

function Overview({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  const [stats, setStats] = useState<Record<string, number | null>>({
    orders: null,
    products: null,
    customers: null,
    sellers: null,
    pending: null,
  })
  const [statsError, setStatsError] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const endpoints = [
        ["orders", "/admin/orders?limit=1"],
        ["products", "/admin/products?limit=1"],
        ["customers", "/admin/customers?limit=1"],
        ["sellers", "/admin/sellers?limit=1"],
        ["pending", "/admin/sellers?limit=1&status=pending_approval"],
      ] as const

      const results = await Promise.allSettled(endpoints.map(([, url]) => apiJson(url)))
      if (cancelled) return

      const next: Record<string, number | null> = {}
      let failures = 0
      results.forEach((result, index) => {
        const key = endpoints[index][0]
        if (result.status === "fulfilled") next[key] = countFrom(result.value)
        else {
          next[key] = null
          failures += 1
        }
      })
      setStats(next)
      setStatsError(failures ? `تعذر تحميل ${failures} من مؤشرات اللوحة.` : "")
    }
    void load()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <section className="spike-stat-grid">
        <Stat title="الطلبات" value={stats.orders} />
        <Stat title="المنتجات" value={stats.products} />
        <Stat title="العملاء" value={stats.customers} />
        <Stat title="البائعون" value={stats.sellers} />
        <Stat title="طلبات بائع معلقة" value={stats.pending} />
      </section>
      {statsError && <div className="spike-inline-note">{statsError}</div>}

      <section className="spike-grid two">
        <Card title="إعدادات المنصة">
          <Field label="اسم المنصة">
            <input value={settings.marketplace_name || ""} onChange={(e) => set("marketplace_name", e.target.value)} />
          </Field>
          <Field label="العملة الافتراضية">
            <CurrencySelect value={settings.default_currency} onChange={(value) => set("default_currency", value)} />
          </Field>
        </Card>

        <Card title="تشغيل سريع">
          <Toggle label="الدفع عند الاستلام" value={!!settings.cod_enabled} onChange={(value) => set("cod_enabled", value)} />
          <Toggle label="التحويل المالي اليدوي" value={!!settings.bank_transfer_enabled} onChange={(value) => set("bank_transfer_enabled", value)} />
          <Toggle label="موافقة الإدارة على البائع" value={!!settings.vendor_approval_required} onChange={(value) => set("vendor_approval_required", value)} />
          <Toggle label="موافقة الإدارة على المنتج" value={!!settings.product_approval_required} onChange={(value) => set("product_approval_required", value)} />
        </Card>
      </section>

      <Card title="اختصارات الإدارة" subtitle="الأقسام الأساسية التي تحتاجها يوميًا في Spike.">
        <div className="spike-native-links">
          <Link to="/spike-orders">الطلبات</Link>
          <Link to="/products">المنتجات</Link>
          <Link to="/product-reviews">تعديلات المنتجات</Link>
          <Link to="/stores">البائعون والمتاجر</Link>
          <Link to="/customers">العملاء</Link>
          <Link to="/promotions">الخصومات</Link>
          <Link to="/delivery-offices">مكاتب التوصيل</Link>
          <Link to="/payouts">المستحقات</Link>
        </div>
      </Card>

      <div className="spike-inline-note">
        تم تبسيط القائمة اليومية لـ Spike. Price Lists وCampaigns وCustomer Groups وReservations مخفية فقط من التنقل ولم تُحذف من محرك Mercur.
      </div>
    </>
  )
}

function VendorRequests() {
  const [items, setItems] = useState<SellerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiJson("/admin/sellers?limit=100&status=pending_approval")
      setItems(Array.isArray(data.sellers) ? data.sellers : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الطلبات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const review = async (id: string, status: "accepted" | "rejected") => {
    setBusy(id)
    setError("")
    try {
      if (status === "accepted") {
        await apiJson(`/admin/sellers/${id}/approve`, { method: "POST" })
      } else {
        await apiJson(`/admin/sellers/${id}/suspend`, {
          method: "POST",
          body: JSON.stringify({ reason: "تم رفض طلب الانضمام من إدارة Spike" }),
        })
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث الطلب")
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card title="طلبات انضمام البائعين" subtitle="قبول أو رفض طلبات إنشاء المتاجر من مكان واحد.">
      {error && <div className="spike-alert spike-alert-error">{error}</div>}
      {loading ? <Empty text="جاري تحميل الطلبات..." /> : items.length === 0 ? <Empty text="لا توجد طلبات بائعين معلقة." /> : (
        <div className="spike-request-list">
          {items.map((item) => {
            const seller = item as any
            const title = seller.name || seller.store?.name || seller.data?.store_name || "طلب بائع"
            const email = seller.email || seller.data?.email || "—"
            return (
              <div className="spike-request" key={item.id}>
                <div>
                  <strong>{title}</strong>
                  <span>{email}</span>
                  <small>{item.created_at ? new Date(item.created_at).toLocaleString("ar") : item.id}</small>
                </div>
                <div className="spike-actions">
                  <button className="spike-primary" disabled={busy === item.id} onClick={() => review(item.id, "accepted")}>قبول</button>
                  <button className="spike-secondary danger" disabled={busy === item.id} onClick={() => review(item.id, "rejected")}>رفض</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}



function Currencies({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  const enabled: string[] = Array.isArray(settings.enabled_currencies) ? settings.enabled_currencies : []
  const toggle = (code: string, value: boolean) => set("enabled_currencies", value ? [...new Set([...enabled, code])] : enabled.filter((item) => item !== code))
  return (
    <section className="spike-grid two">
      <Card title="العملات المستخدمة">
        {[["SAR", "ريال سعودي"], ["USD", "دولار أمريكي"], ["YER_OLD", "ريال يمني قديم"], ["YER_NEW", "ريال يمني جديد"]].map(([code, label]) => (
          <Toggle key={code} label={`${label} (${code})`} value={enabled.includes(code)} onChange={(value) => toggle(code, value)} />
        ))}
      </Card>
      <Card title="العملة الافتراضية">
        <Field label="عملة العرض"><CurrencySelect value={settings.default_currency} onChange={(value) => set("default_currency", value)} /></Field>
      </Card>
      <Card title="أسعار الصرف" className="wide">
        <div className="spike-form-grid three">
          <Field label="1 USD = SAR"><input inputMode="decimal" value={settings.exchange_usd_sar || ""} onChange={(e) => set("exchange_usd_sar", e.target.value)} /></Field>
          <Field label="1 USD = YER قديم"><input inputMode="decimal" value={settings.exchange_usd_yer_old || ""} onChange={(e) => set("exchange_usd_yer_old", e.target.value)} /></Field>
          <Field label="1 USD = YER جديد"><input inputMode="decimal" value={settings.exchange_usd_yer_new || ""} onChange={(e) => set("exchange_usd_yer_new", e.target.value)} /></Field>
        </div>
      </Card>
    </section>
  )
}



function Commission({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  return (
    <section className="spike-grid two">
      <Card title="عمولة المنصة">
        <Field label="النسبة الافتراضية %"><input type="number" min="0" max="100" step="0.1" value={settings.commission_percent || ""} onChange={(e) => set("commission_percent", e.target.value)} /></Field>
        <p className="spike-muted">هذه إعدادات Spike العامة. إذا استخدمنا عمولات Mercur الخاصة بكل Seller لاحقًا تبقى هي المصدر المتخصص للبائع.</p>
      </Card>
      <Card title="مهم"><p className="spike-muted">لن نحذف نظام Commissions أو Payouts الأصلي في Mercur؛ هما مهمان لمتجر متعدد البائعين.</p></Card>
    </section>
  )
}

function Returns({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  return (
    <section className="spike-grid two">
      <Card title="سياسة الإرجاع">
        <Toggle label="السماح بسياسة خاصة لكل بائع" value={!!settings.vendor_return_policy_enabled} onChange={(value) => set("vendor_return_policy_enabled", value)} />
        <Field label="المدة الافتراضية بالأيام"><input type="number" min="0" value={settings.default_return_days || ""} onChange={(e) => set("default_return_days", e.target.value)} /></Field>
      </Card>
      <Card title="السياسة الافتراضية">
        <Field label="النص"><textarea rows={6} value={settings.default_return_policy || ""} onChange={(e) => set("default_return_policy", e.target.value)} /></Field>
      </Card>
    </section>
  )
}

function Card({ title, subtitle, className = "", children }: { title?: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return <section className={`spike-card ${className}`}>{title && <div className="spike-card-head"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>}{children}</section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="spike-field"><span>{label}</span>{children}</label>
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <label className="spike-toggle"><span>{label}</span><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /></label>
}

function CurrencySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <select value={value || "SAR"} onChange={(e) => onChange(e.target.value)}><option value="SAR">SAR — ريال سعودي</option><option value="USD">USD — دولار</option><option value="YER_OLD">YER — ريال يمني قديم</option><option value="YER_NEW">YER — ريال يمني جديد</option></select>
}

function Stat({ title, value }: { title: string; value: number | null | undefined }) {
  return <div className="spike-stat"><span>{title}</span><strong>{value === null || value === undefined ? "—" : value.toLocaleString("ar")}</strong></div>
}

function Empty({ text }: { text: string }) {
  return <div className="spike-empty">{text}</div>
}




