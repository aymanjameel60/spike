import { defineNavigationConfig } from "@mercurjs/dashboard-sdk"

// Spike admin navigation: hide Mercur pages that have already been replaced
// by Spike-specific routes. Keep only native sections that Spike still uses.
export default defineNavigationConfig({
  items: [
    { id: "orders", hidden: true },
    { id: "offers", hidden: true },
    { id: "inventory", hidden: true },
    { id: "price-lists", hidden: true },
    { id: "campaigns", hidden: true },
    { id: "customer-groups", hidden: true },
    { id: "reservations", hidden: true },
    { id: "products", hidden: true },
    { id: "promotions", hidden: true },
    { id: "collections", hidden: true },
    { id: "categories", hidden: true },
    { id: "stores", hidden: true },
    { id: "payouts", hidden: true },

    // Still used from Mercur until Spike replacements exist.
    { id: "customers", label: "العملاء", rank: 50 },
    { id: "reviews", label: "التقييمات", rank: 65 },
  ],
})
