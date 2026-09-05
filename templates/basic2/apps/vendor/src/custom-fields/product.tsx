import { defineCustomFieldsConfig } from "@mercurjs/dashboard-sdk"

// Shared/master product information stays catalog-focused. Seller-specific
// price, inventory and commercial terms belong to the Offer.
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
