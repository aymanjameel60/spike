import { defineCustomFieldsConfig } from "@mercurjs/dashboard-sdk"

// Spike keeps master-product pages focused on catalog data.
// Technical fields remain in Medusa/Mercur; we only remove them from the
// day-to-day product detail view so upgrades and workflows stay intact.
export default defineCustomFieldsConfig({
  model: "product",
  displays: [
    {
      zone: "general",
      fields: [
        { id: "subtitle", component: null },
        { id: "handle", component: null },
        { id: "discountable", component: null },
      ],
    },
  ],
})
