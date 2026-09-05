SPIKE v9 - Native Mercur Cleanup

Goal: customize Mercur's existing Admin/Vendor panels instead of creating a second dashboard.

What this patch does:
- Restores the native Mercur product/offer workflow.
- Removes the v8/v8.1 standalone add-product route using install-v9.ps1.
- Renames seller-facing "Offers" to "بيع المنتجات" and simplifies seller wording.
- Keeps Product -> Offer architecture intact.
- Hides technical/unused navigation items from daily seller workflow.
- Keeps Spike seller/product/offer custom fields from v7.
- Keeps the cleaned Admin navigation and Spike settings page.

Install:
1) Copy the apps folder over the project's apps folder (merge/replace).
2) Copy install-v9.ps1 to the project root.
3) From the project root run: .\install-v9.ps1
4) Run: bun run build
5) Run: bun run dev

Important:
Shipping Profile remains a Mercur-native required relation. v9 does not fake or duplicate it. Configure one default shipping profile in Admin once; the seller flow then stays inside Mercur's native sales workflow.
