import { defineCustomFieldsConfig } from "@mercurjs/dashboard-sdk"
import { createFormHelper } from "@mercurjs/dashboard-shared"

const form = createFormHelper<{ additional_data?: Record<string, unknown> }>()
const fromAdditionalData = (key: string, fallback: unknown = "") => (data: any) =>
  data?.additional_data?.[key] ?? fallback

const offerTerms = {
  return_eligible: form.define({
    validation: form.boolean().optional(),
    label: "المنتج قابل للإرجاع",
    description: "عطّلها للمنتجات المستثناة من سياسة إرجاع المتجر.",
    defaultValue: fromAdditionalData("return_eligible", true),
  }),
  warranty: form.define({
    validation: form.string().optional(),
    label: "الضمان",
    placeholder: "مثال: ضمان سنة من المتجر",
    defaultValue: fromAdditionalData("warranty"),
  }),
  delivery_note: form.define({
    validation: form.string().optional(),
    label: "ملاحظة توصيل لهذا العرض",
    placeholder: "اتركها فارغة لاستخدام سياسة توصيل المتجر",
    defaultValue: fromAdditionalData("delivery_note"),
  }),
}

export default defineCustomFieldsConfig({
  model: "offer",
  forms: [
    { zone: "create", tab: "stockLevelsAndPrices", fields: offerTerms },
    { zone: "edit", fields: offerTerms },
  ],
  displays: [
    {
      zone: "general",
      fields: [
        { id: "handle", component: null },
        { id: "subtitle", component: null },
        { id: "discountable", component: null },
      ],
    },
  ],
})
