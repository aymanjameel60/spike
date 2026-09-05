SPIKE v10 — Native Mercur Marketplace Pack
===========================================
This package extends the existing Mercur Admin/Vendor panels. It does NOT create a second dashboard.

Included:
1) Vendor product workflow: only one sidebar item named "المنتجات" using Mercur Offers (the seller-owned commercial layer). The duplicate master-product menu is hidden.
2) Admin product policy: admin product create/edit API writes are blocked; view/delete and dedicated approval routes remain allowed. A native product-list notice explains the rule.
3) Delivery offices: Admin can add office, governorate/city, phone, covered Yemeni cities, rate per city, and billing mode (piece/kg), activate/disable/delete.
4) Vendor delivery settings: vendor selects one or more admin-defined offices.
5) Public delivery quote API: calculates fee by office, city, quantity or weight.
6) FX: vendor sees the admin-approved exchange rates immediately after login in a compact top bar.
7) Vendor reports: sales, Spike commission, net receivable, date filter, Excel-compatible CSV export.
8) Admin reports: whole marketplace or seller filter when seller relation is returned by orders API; gross sales, commission, seller net, Excel-compatible CSV export.
9) Global commission continues to come from Spike settings. Optional seller-specific commission API is included.
10) Existing seller return/warranty/delivery custom fields from v7 are preserved.

Install:
- Copy apps + packages + install-v10.ps1 over the project root (do not delete existing folders first).
- Run: .\install-v10.ps1
- Run migration using your normal Mercur/Medusa migration command if the new tables are not created automatically in dev.
- Run: bun run build
- Run: bun run dev

New tables:
- spike_delivery_office
- spike_vendor_delivery_setting
- spike_seller_commission

New API routes:
- /admin/spike/delivery-offices
- /admin/spike/delivery-offices/:id
- /admin/spike/commission
- /vendor/spike/delivery-settings
- /vendor/spike/exchange-rates
- /store/spike/delivery-offices
- /store/spike/delivery-quote
