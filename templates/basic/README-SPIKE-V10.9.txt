SPIKE v10.9 — Backend + Admin + Vendor patch
=============================================

Included in this package
------------------------
1) Delivery offices
   - Admin can add, EDIT, enable/disable, and delete an office.
   - Office phone/WhatsApp is stored in Admin and used in shipping documents.
   - Cities/rates and calculation type (piece/kg) remain supported.

2) Product -> delivery office
   - Seller Add Product page now requires a delivery-office dropdown.
   - Product cannot be created from this simplified page without an office.
   - Product-office mapping stored in Spike module.

3) My Products / product edits
   - Vendor page: "منتجاتي".
   - Seller can submit title, description, price, compare-at price and delivery-office changes.
   - Change is NOT applied immediately; it becomes a pending Spike revision.
   - Admin page: "تعديلات المنتجات" with Approve / Reject directly from the list.
   - Seller receives an internal Spike notification record on approval/rejection.

4) Orders + Word shipping document
   - Admin page: "طلبات Spike" with a Word icon next to each order.
   - Vendor page: "طلباتي" with a Word document for that seller's shipment.
   - Document includes order number, customer, phone, address, office and products.

5) Notification counters foundation
   - Admin and vendor count endpoints included.
   - Red circular number badges are used in the new Spike order/review pages.

6) Temporary checkout delivery bridge
   - /store/spike/checkout/temporary-delivery
   - Requires every cart product to have a selected office.
   - Checks that the office exists/is active and, when city rates exist, covers the cart city.
   - Saves office id/name/phone and temporary delivery amount in line-item metadata.
   - Temporarily sets requires_shipping=false so Mercur split-order completion is not blocked by missing native Shipping Options.
   - IMPORTANT: office delivery fees are metadata during this temporary phase and are NOT added to Medusa's native cart total yet.

7) Existing v10.8 items retained
   - Exchange settings, reports, commission settings, delivery settings, theme-aware dashboard UI.

Install on Windows PowerShell
-----------------------------
From your Mercur basic root:
C:\Users\jamee\Downloads\storm\mercur\templates\basic

1. BACK UP the project first.
2. Extract this ZIP.
3. Copy the folders "apps" and "packages" over the same folders in the Mercur basic project and choose Replace.
4. From the project root run:
   bun install
5. Run the API migration command used by your Mercur/Medusa setup. Standard Medusa command from packages/api is:
   cd packages\api
   bunx medusa db:migrate
   cd ..\..
6. Build:
   bun run build
7. Start your normal dev command:
   bun run dev

After install
-------------
- Admin -> مكاتب التوصيل: create/edit offices and their phone numbers.
- Vendor -> إعدادات التوصيل: save allowed offices once (especially after older v10.8 install).
- Vendor -> إضافة منتج: select an office.
- Vendor -> منتجاتي: submit product edits.
- Admin -> تعديلات المنتجات: approve/reject.
- Admin/Vendor -> Spike orders page: use Word file icon.

Compatibility note
------------------
The Admin and Vendor app TypeScript overlays were checked with their local TypeScript configurations. The storefront JS package is checked separately. The API workspace itself has pre-existing type-resolution errors in this local source snapshot (including framework exports used by earlier v10.x patches), so the reliable validation is the Medusa/Bun build in the user's actual installed Mercur workspace.
