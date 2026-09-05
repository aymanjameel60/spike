import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import "./spike.css"

type Settings = Record<string, any>
type SpikeRoute = "overview" | "vendors" | "banners" | "currencies" | "payments" | "commission" | "returns"

type Banner = {
  id: string
  title: string
  image_url: string
  action_type: "none" | "product" | "category" | "store" | "collection" | "url"
  target: string
  enabled: boolean
  sort_order: number
}

type BankAccount = {
  id: string
  name: string
  account_name: string
  account_number: string
  instructions: string
  enabled: boolean
}

const defaults: Settings = {
  marketplace_name: "Spike",
  default_currency: "SAR",
  enabled_currencies: ["SAR", "USD", "YER_OLD", "YER_NEW"],
  exchange_usd_sar: "3.75",
  exchange_usd_yer_old: "535",
  exchange_usd_yer_new: "1630",
  commission_percent: "10",
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

const routeInfo: Record<SpikeRoute, { label: string; icon: string }> = {
  overview: { label: "الرئيسية", icon: "⌂" },
  vendors: { label: "طلبات البائعين", icon: "◉" },
  banners: { label: "البانرات", icon: "▣" },
  currencies: { label: "العملات والصرف", icon: "$" },
  payments: { label: "طرق الدفع", icon: "▤" },
  commission: { label: "العمولات", icon: "%" },
  returns: { label: "سياسات الإرجاع", icon: "↩" },
}

const SPIKE_EVENT = "spike:navigate"

function openSpikeRoute(key: SpikeRoute) {
  window.dispatchEvent(new CustomEvent<SpikeRoute>(SPIKE_EVENT, { detail: key }))
}



async function apiJson(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "include", ...init })
  if (!response.ok) throw new Error(`${response.status}`)
  return response.json()
}

export default function SpikeLaunchPanel() {
  const [route, setRoute] = useState<SpikeRoute | null>(null)
  const [settings, setSettings] = useState<Settings>(defaults)
  const [status, setStatus] = useState("")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const onSpikeNavigate = (event: Event) => {
      const next = (event as CustomEvent<SpikeRoute | null>).detail
      setRoute(next ?? null)
    }
    const onNativeNavigation = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const nativeLink = target.closest("aside a, nav a")
      if (nativeLink && !target.closest("#spike-nav-group")) setRoute(null)
    }
    window.addEventListener(SPIKE_EVENT, onSpikeNavigate)
    document.addEventListener("click", onNativeNavigation, true)
    return () => {
      window.removeEventListener(SPIKE_EVENT, onSpikeNavigate)
      document.removeEventListener("click", onNativeNavigation, true)
    }
  }, [])

  useEffect(() => {
    const mount = () => {
      const sidebar = document.querySelector("aside, nav") as HTMLElement | null
      if (!sidebar || document.getElementById("spike-nav-group")) return

      const group = document.createElement("div")
      group.id = "spike-nav-group"
      group.className = "spike-nav-group"
      group.innerHTML = `<div class="spike-nav-heading"><span class="spike-bolt">⚡</span><span>Spike</span></div>`

      ;(Object.keys(routeInfo) as SpikeRoute[]).forEach((key) => {
        const item = routeInfo[key]
        const button = document.createElement("button")
        button.type = "button"
        button.dataset.spikeRoute = key
        button.className = "spike-side-link"
        button.innerHTML = `<span class="spike-nav-icon">${item.icon}</span><span>${item.label}</span>`
        button.addEventListener("click", (event) => {
          event.preventDefault()
          event.stopPropagation()
          setRoute(key)
        }, true)
        group.appendChild(button)
      })

      const settingsAnchor = sidebar.querySelector('a[href*="/settings"]') as HTMLElement | null
      if (settingsAnchor) {
        let target: HTMLElement = settingsAnchor
        while (target.parentElement && target.parentElement !== sidebar) target = target.parentElement
        sidebar.insertBefore(group, target)
      } else {
        sidebar.appendChild(group)
      }
    }

    mount()
    const observer = new MutationObserver(mount)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.querySelectorAll("[data-spike-route]").forEach((node) => {
      node.classList.toggle("active", (node as HTMLElement).dataset.spikeRoute === route)
    })
  }, [route])

  useEffect(() => {
    if (!route || loaded) return
    apiJson("/admin/spike/settings")
      .then((data) => setSettings({ ...defaults, ...(data.settings || {}) }))
      .catch(() => setStatus("تعذر تحميل إعدادات Spike"))
      .finally(() => setLoaded(true))
  }, [route, loaded])

  const set = (key: string, value: any) => setSettings((current) => ({ ...current, [key]: value }))

  const save = async (message = "تم الحفظ ✓") => {
    setStatus("جاري الحفظ...")
    try {
      const data = await apiJson("/admin/spike/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settings }),
      })
      setSettings({ ...defaults, ...(data.settings || {}) })
      setStatus(message)
      setTimeout(() => setStatus(""), 2500)
    } catch {
      setStatus("تعذر الحفظ")
    }
  }

  if (!route) return null

  return (
    <div className="spike-page" dir="rtl">
      <div className="spike-page-inner">
        <header className="spike-title">
          <div>
            <h1>{routeInfo[route].label}</h1>
            <p>إدارة Spike من مكان واحد وبواجهة مبسطة</p>
          </div>
          <div className="spike-title-actions">
            {route !== "vendors" && <button onClick={() => save()}>حفظ التغييرات</button>}
            <button className="spike-close" type="button" onClick={() => setRoute(null)}>إغلاق</button>
          </div>
        </header>
        {status && <div className="spike-status">{status}</div>}

        {route === "overview" && <Overview settings={settings} set={set} />}
        {route === "vendors" && <VendorRequests />}
        {route === "banners" && <Banners settings={settings} set={set} />}
        {route === "currencies" && <Currencies settings={settings} set={set} />}
        {route === "payments" && <Payments settings={settings} set={set} />}
        {route === "commission" && <Commission settings={settings} set={set} />}
        {route === "returns" && <Returns settings={settings} set={set} />}
      </div>
    </div>
  )
}

function Overview({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  const [stats, setStats] = useState({ orders: "—", products: "—", customers: "—", sellers: "—", pending: "—" })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const getCount = async (url: string, key: string) => {
        try {
          const data = await apiJson(url)
          return String(data.count ?? data[key]?.length ?? 0)
        } catch { return "—" }
      }
      const [orders, products, customers, sellers, pending] = await Promise.all([
        getCount("/admin/orders?limit=1", "orders"),
        getCount("/admin/products?limit=1", "products"),
        getCount("/admin/customers?limit=1", "customers"),
        getCount("/admin/sellers?limit=1", "sellers"),
        getCount("/admin/requests?limit=1&status=pending", "requests"),
      ])
      if (!cancelled) setStats({ orders, products, customers, sellers, pending })
    }
    load()
    return () => { cancelled = true }
  }, [])

  return <>
    <section className="spike-kpis">
      <Kpi label="الطلبات" value={stats.orders} href="/dashboard/orders" />
      <Kpi label="المنتجات" value={stats.products} href="/dashboard/products" />
      <Kpi label="العملاء" value={stats.customers} href="/dashboard/customers" />
      <Kpi label="البائعون" value={stats.sellers} href="/dashboard/stores" />
      <Kpi label="طلبات معلقة" value={stats.pending} href="/dashboard/spike/vendors" spike />
    </section>

    <div className="spike-grid">
      <article>
        <h3>إعدادات المنصة</h3>
        <Field label="اسم المنصة"><input value={settings.marketplace_name || ""} onChange={(e) => set("marketplace_name", e.target.value)} /></Field>
        <Field label="العملة الافتراضية"><CurrencySelect value={settings.default_currency} onChange={(value) => set("default_currency", value)} /></Field>
      </article>
      <article>
        <h3>تشغيل سريع</h3>
        <Toggle label="الدفع عند الاستلام" value={!!settings.cod_enabled} onChange={(value) => set("cod_enabled", value)} />
        <Toggle label="التحويل المالي اليدوي" value={!!settings.bank_transfer_enabled} onChange={(value) => set("bank_transfer_enabled", value)} />
        <Toggle label="موافقة الإدارة على البائع" value={!!settings.vendor_approval_required} onChange={(value) => set("vendor_approval_required", value)} />
      </article>
      <article className="wide">
        <h3>اختصارات الإدارة</h3>
        <div className="links">
          <NativeLink href="/dashboard/orders">الطلبات</NativeLink>
          <NativeLink href="/dashboard/products">المنتجات</NativeLink>
          <NativeLink href="/dashboard/products/offers">العروض</NativeLink>
          <NativeLink href="/dashboard/stores">المتاجر</NativeLink>
          <NativeLink href="/dashboard/customers">العملاء</NativeLink>
          <NativeLink href="/dashboard/promotions">الخصومات</NativeLink>
          <NativeLink href="/dashboard/payouts">المستحقات</NativeLink>
        </div>
      </article>
    </div>
  </>
}

function VendorRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const load = () => {
    setLoading(true)
    setError("")
    apiJson("/admin/requests?limit=100&status=pending&type=seller")
      .then((data) => setRequests(data.requests || []))
      .catch(() => setError("تعذر تحميل طلبات البائعين من Mercur."))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const review = async (id: string, status: "accepted" | "rejected") => {
    try {
      await apiJson(`/admin/requests/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, reviewer_note: status === "accepted" ? "Approved from Spike Admin" : "Rejected from Spike Admin" }),
      })
      load()
    } catch {
      setError("تعذر تحديث حالة الطلب.")
    }
  }

  return <article className="spike-table-card">
    <div className="section-head"><div><h3>طلبات انضمام البائعين</h3><p>راجع الطلب ثم وافق أو ارفض مباشرة.</p></div><button className="secondary" onClick={load}>تحديث</button></div>
    {loading ? <Empty text="جاري التحميل..." /> : error ? <Empty text={error} /> : requests.length === 0 ? <Empty text="لا توجد طلبات بائعين معلقة حاليًا." /> :
      <div className="spike-table-wrap"><table className="spike-table"><thead><tr><th>المتجر / البائع</th><th>البريد</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead><tbody>
      {requests.map((request) => {
        const seller = request.data?.seller || request.data || {}
        const member = request.data?.member || {}
        return <tr key={request.id}><td>{seller.name || seller.store_name || "طلب بائع"}</td><td>{member.email || seller.email || "—"}</td><td>{formatDate(request.created_at)}</td><td><span className="pill">معلق</span></td><td><div className="row-actions"><button className="approve" onClick={() => review(request.id, "accepted")}>قبول</button><button className="reject" onClick={() => review(request.id, "rejected")}>رفض</button></div></td></tr>
      })}</tbody></table></div>}
  </article>
}

function Banners({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  const banners: Banner[] = Array.isArray(settings.banner_items) ? settings.banner_items : []
  const update = (id: string, patch: Partial<Banner>) => set("banner_items", banners.map((item) => item.id === id ? { ...item, ...patch } : item))
  const add = () => set("banner_items", [...banners, { id: `banner_${Date.now()}`, title: "بانر جديد", image_url: "", action_type: "none", target: "", enabled: true, sort_order: banners.length + 1 }])
  const remove = (id: string) => set("banner_items", banners.filter((item) => item.id !== id))

  return <>
    <div className="section-head standalone"><div><h3>بانرات التطبيق</h3><p>الصورة + الوجهة التي يفتحها البانر عند الضغط.</p></div><button className="primary" onClick={add}>إضافة بانر</button></div>
    {banners.length === 0 ? <article><Empty text="لا توجد بانرات. اضغط إضافة بانر للبدء." /></article> : <div className="stack">
      {banners.map((banner) => <article key={banner.id} className="banner-row">
        <div className="banner-top"><strong>{banner.title || "بانر"}</strong><div className="row-actions"><label className="mini-toggle"><input type="checkbox" checked={banner.enabled} onChange={(e) => update(banner.id, { enabled: e.target.checked })} /> فعال</label><button className="danger-link" onClick={() => remove(banner.id)}>حذف</button></div></div>
        <div className="form-grid three">
          <Field label="العنوان"><input value={banner.title} onChange={(e) => update(banner.id, { title: e.target.value })} /></Field>
          <Field label="رابط الصورة"><input dir="ltr" value={banner.image_url} onChange={(e) => update(banner.id, { image_url: e.target.value })} placeholder="https://..." /></Field>
          <Field label="الترتيب"><input type="number" value={banner.sort_order} onChange={(e) => update(banner.id, { sort_order: Number(e.target.value) || 0 })} /></Field>
          <Field label="عند الضغط"><select value={banner.action_type} onChange={(e) => update(banner.id, { action_type: e.target.value as Banner["action_type"] })}><option value="none">بدون إجراء</option><option value="product">منتج</option><option value="category">قسم</option><option value="store">متجر</option><option value="collection">قائمة / مجموعة</option><option value="url">رابط خارجي</option></select></Field>
          <Field label="الوجهة / ID"><input dir="ltr" value={banner.target} onChange={(e) => update(banner.id, { target: e.target.value })} placeholder="prod_... أو رابط" /></Field>
        </div>
      </article>)}
    </div>}
    <div className="spike-note">واجهة المتجر تستطيع قراءة هذه البيانات من <code>/store/spike/content</code>، لذلك لا نحتاج تثبيت البانرات داخل كود التطبيق.</div>
  </>
}

function Currencies({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  const enabled: string[] = Array.isArray(settings.enabled_currencies) ? settings.enabled_currencies : []
  const toggleCurrency = (code: string, checked: boolean) => set("enabled_currencies", checked ? [...new Set([...enabled, code])] : enabled.filter((item) => item !== code))
  return <div className="spike-grid">
    <article>
      <h3>العملات المستخدمة</h3>
      {[['SAR','ريال سعودي'],['USD','دولار أمريكي'],['YER_OLD','ريال يمني قديم'],['YER_NEW','ريال يمني جديد']].map(([code,label]) => <Toggle key={code} label={`${label} (${code})`} value={enabled.includes(code)} onChange={(value) => toggleCurrency(code, value)} />)}
    </article>
    <article>
      <h3>العملة الافتراضية</h3>
      <Field label="عملة عرض الأسعار"><CurrencySelect value={settings.default_currency} onChange={(value) => set("default_currency", value)} /></Field>
      <p>يمكن للعميل تبديل العملة في الواجهة، والسيرفر يبقى مصدر سعر الصرف.</p>
    </article>
    <article className="wide"><h3>أسعار الصرف</h3><div className="rates">
      <Field label="1 USD = SAR"><input inputMode="decimal" value={settings.exchange_usd_sar || ""} onChange={(e) => set("exchange_usd_sar", e.target.value)} /></Field>
      <Field label="1 USD = YER قديم"><input inputMode="decimal" value={settings.exchange_usd_yer_old || ""} onChange={(e) => set("exchange_usd_yer_old", e.target.value)} /></Field>
      <Field label="1 USD = YER جديد"><input inputMode="decimal" value={settings.exchange_usd_yer_new || ""} onChange={(e) => set("exchange_usd_yer_new", e.target.value)} /></Field>
    </div></article>
  </div>
}

function Payments({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  const accounts: BankAccount[] = Array.isArray(settings.bank_accounts) ? settings.bank_accounts : []
  const update = (id: string, patch: Partial<BankAccount>) => set("bank_accounts", accounts.map((item) => item.id === id ? { ...item, ...patch } : item))
  const add = () => set("bank_accounts", [...accounts, { id: `account_${Date.now()}`, name: "تحويل مالي", account_name: "", account_number: "", instructions: "", enabled: true }])
  const remove = (id: string) => set("bank_accounts", accounts.filter((item) => item.id !== id))

  return <>
    <div className="spike-grid">
      <article><h3>طرق الدفع عند الإطلاق</h3><Toggle label="الدفع عند الاستلام" value={!!settings.cod_enabled} onChange={(value) => set("cod_enabled", value)} /><Toggle label="التحويل المالي اليدوي" value={!!settings.bank_transfer_enabled} onChange={(value) => set("bank_transfer_enabled", value)} /></article>
      <article><h3>ملاحظة</h3><p>احتفظنا بطرق الدفع بسيطة للنسخة الأولى. بوابات الدفع الإلكترونية يمكن إضافتها لاحقًا بدون تغيير تصميم هذه الصفحة.</p></article>
    </div>
    <div className="section-head standalone"><div><h3>حسابات التحويل</h3><p>تظهر للعميل عند اختيار التحويل المالي.</p></div><button className="primary" onClick={add}>إضافة حساب</button></div>
    <div className="stack">
      {accounts.length === 0 && <article><Empty text="لم تتم إضافة حساب تحويل بعد." /></article>}
      {accounts.map((account) => <article key={account.id}>
        <div className="banner-top"><strong>{account.name || "حساب تحويل"}</strong><div className="row-actions"><label className="mini-toggle"><input type="checkbox" checked={account.enabled} onChange={(e) => update(account.id, { enabled: e.target.checked })}/> فعال</label><button className="danger-link" onClick={() => remove(account.id)}>حذف</button></div></div>
        <div className="form-grid two"><Field label="اسم الطريقة"><input value={account.name} onChange={(e) => update(account.id, { name: e.target.value })}/></Field><Field label="اسم المستفيد"><input value={account.account_name} onChange={(e) => update(account.id, { account_name: e.target.value })}/></Field><Field label="رقم الحساب / المحفظة"><input dir="ltr" value={account.account_number} onChange={(e) => update(account.id, { account_number: e.target.value })}/></Field><Field label="تعليمات التحويل"><input value={account.instructions} onChange={(e) => update(account.id, { instructions: e.target.value })}/></Field></div>
      </article>)}
    </div>
  </>
}

function Commission({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  return <div className="spike-grid">
    <article><h3>العمولة الافتراضية</h3><Field label="عمولة Spike %"><input type="number" min="0" max="100" step="0.1" value={settings.commission_percent || ""} onChange={(e) => set("commission_percent", e.target.value)} /></Field><p>هذه نسبة Spike الافتراضية للنسخة الأولى.</p></article>
    <article><h3>قواعد متقدمة</h3><p>Mercur يدعم قواعد عمولة حسب البائع والقسم. نترك الصفحة اليومية بسيطة، وعند الحاجة استخدم إعدادات Mercur المتقدمة.</p><div className="links"><NativeLink href="/dashboard/settings">الإعدادات المتقدمة</NativeLink><NativeLink href="/dashboard/payouts">مستحقات البائعين</NativeLink></div></article>
  </div>
}

function Returns({ settings, set }: { settings: Settings; set: (key: string, value: any) => void }) {
  return <div className="spike-grid">
    <article><h3>سياسة البائع</h3><Toggle label="السماح بسياسة إرجاع خاصة لكل بائع" value={!!settings.vendor_return_policy_enabled} onChange={(value) => set("vendor_return_policy_enabled", value)} /><Toggle label="موافقة الإدارة على المنتجات الجديدة" value={!!settings.product_approval_required} onChange={(value) => set("product_approval_required", value)} /></article>
    <article><h3>السياسة الافتراضية</h3><Field label="مدة الإرجاع الافتراضية بالأيام"><input type="number" min="0" value={settings.default_return_days || ""} onChange={(e) => set("default_return_days", e.target.value)} /></Field><Field label="نص السياسة الافتراضي"><textarea rows={4} value={settings.default_return_policy || ""} onChange={(e) => set("default_return_policy", e.target.value)} /></Field></article>
  </div>
}

function Kpi({ label, value, href, spike = false }: { label: string; value: string; href: string; spike?: boolean }) {
  return <button className="kpi" onClick={() => spike ? openSpikeRoute("vendors") : location.assign(href)}><span>{label}</span><strong>{value}</strong></button>
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <label className="toggle"><span>{label}</span><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /></label> }
function CurrencySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <select value={value || "SAR"} onChange={(e) => onChange(e.target.value)}><option value="SAR">SAR — ريال سعودي</option><option value="USD">USD — دولار</option><option value="YER_OLD">YER — ريال يمني قديم</option><option value="YER_NEW">YER — ريال يمني جديد</option></select> }
function NativeLink({ href, children }: { href: string; children: ReactNode }) { return <a href={href}>{children}</a> }
function Empty({ text }: { text: string }) { return <div className="empty-state">{text}</div> }
function formatDate(value: string | undefined) { if (!value) return "—"; try { return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(new Date(value)) } catch { return value } }
