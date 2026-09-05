import { defineCustomFieldsConfig } from "@mercurjs/dashboard-sdk"
import { createFormHelper } from "@mercurjs/dashboard-shared"

const form = createFormHelper<{ additional_data?: Record<string, unknown> }>()

const fromAdditionalData = (key: string, fallback: unknown = "") => (data: any) =>
  data?.additional_data?.[key] ?? fallback

function AdditionalValue({ data, field, fallback = "—" }: { data?: any; field: string; fallback?: string }) {
  const value = data?.additional_data?.[field]
  if (typeof value === "boolean") return <span>{value ? "نعم" : "لا"}</span>
  return <span>{value === undefined || value === null || value === "" ? fallback : String(value)}</span>
}

const spikeSellerFields = {
  whatsapp: form.define({
    validation: form.string().optional(),
    label: "واتساب المتجر",
    placeholder: "+967...",
    description: "رقم التواصل الذي سيستخدمه المتجر عند الحاجة.",
    defaultValue: fromAdditionalData("whatsapp"),
  }),
  return_days: form.define({
    validation: form.coerce.number().min(0).optional(),
    label: "مدة الإرجاع بالأيام",
    description: "تستخدم بدل المدة العامة عندما تكون سياسة البائع الخاصة مفعلة.",
    defaultValue: fromAdditionalData("return_days"),
  }),
  return_policy: form.define({
    validation: form.string().optional(),
    label: "سياسة إرجاع المتجر",
    placeholder: "مثال: يقبل الإرجاع إذا كان المنتج بحالته الأصلية...",
    defaultValue: fromAdditionalData("return_policy"),
  }),
  delivery_policy: form.define({
    validation: form.string().optional(),
    label: "ملاحظات التوصيل",
    placeholder: "معلومات مختصرة عن التوصيل أو المناطق التي يخدمها المتجر",
    defaultValue: fromAdditionalData("delivery_policy"),
  }),
}

export default defineCustomFieldsConfig({
  model: "seller",
  forms: [
    { zone: "create", tab: "details", fields: spikeSellerFields },
    { zone: "edit", fields: spikeSellerFields },
  ],
  displays: [
    {
      zone: "general",
      fields: [
        { id: "handle", component: null },
        { id: "spike_whatsapp", component: (props) => <AdditionalValue {...props} field="whatsapp" /> },
        { id: "spike_return_days", component: (props) => <AdditionalValue {...props} field="return_days" /> },
        { id: "spike_return_policy", component: (props) => <AdditionalValue {...props} field="return_policy" /> },
        { id: "spike_delivery_policy", component: (props) => <AdditionalValue {...props} field="delivery_policy" /> },
      ],
    },
  ],
})
