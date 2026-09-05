import { defineNavigationConfig } from "@mercurjs/dashboard-sdk"

// Spike vendor navigation: keep Mercur internals available, but remove duplicate
// technical pages from the daily seller workflow.
export default defineNavigationConfig({
  items: [
    { id: "orders", hidden: true },
    { id: "offers", hidden: true },
    { id: "products", hidden: true },
    { id: "inventory", hidden: true },
    { id: "price-lists", hidden: true },
    { id: "campaigns", hidden: true },
    { id: "customer-groups", hidden: true },
    { id: "reservations", hidden: true },
    { id: "categories", hidden: true },
    { id: "collections", hidden: true },

    { id: "customers", label: "العملاء", rank: 50 },
    { id: "promotions", hidden: true },
    { id: "reviews", label: "التقييمات", rank: 70 },
    { id: "payouts", label: "المستحقات", rank: 80 },
  ],
})
