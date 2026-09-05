import { defineCustomFieldsConfig } from "@mercurjs/dashboard-sdk"
import { createFormHelper } from "@mercurjs/dashboard-shared"

const form = createFormHelper<{ additional_data?: Record<string, unknown> }>()
const fromAdditionalData = (key: string, fallback: unknown = "") => (data: any) =>
  data?.additional_data?.[key] ?? fallback

const fields = {
  whatsapp: form.define({
    validation: form.string().optional(),
    label: "واتساب المتجر",
    placeholder: "+967...",
    defaultValue: fromAdditionalData("whatsapp"),
  }),
  return_days: form.define({
    validation: form.coerce.number().min(0).optional(),
    label: "مدة الإرجاع بالأيام",
    defaultValue: fromAdditionalData("return_days"),
  }),
  return_policy: form.define({
    validation: form.string().optional(),
    label: "سياسة إرجاع المتجر",
    placeholder: "اكتب السياسة التي سيشاهدها العميل تحت تفاصيل المنتج",
    defaultValue: fromAdditionalData("return_policy"),
  }),
  delivery_policy: form.define({
    validation: form.string().optional(),
    label: "ملاحظات التوصيل",
    placeholder: "معلومات مختصرة عن التوصيل والمناطق التي يخدمها المتجر",
    defaultValue: fromAdditionalData("delivery_policy"),
  }),
}

export default defineCustomFieldsConfig({
  model: "seller",
  forms: [
    { zone: "edit", fields },
    { zone: "professional-details", fields },
  ],
  displays: [
    {
      zone: "general",
      fields: [
        { id: "handle", component: null },
        { id: "website_url", component: null },
      ],
    },
  ],
})
