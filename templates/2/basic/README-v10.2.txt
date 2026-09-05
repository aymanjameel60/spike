Spike v10.2 hotfix

Fixes:
1) Vendor simple product creation no longer sends a second option value for Default variant.
   Mercur owns the internal __default__ option for products without variant axes.
2) Store /store/offers compatibility middleware rewrites legacy storefront field aliases:
   *variant -> *product_variant
   *product -> *product_variant.product
   This addresses storefront 400 errors caused by old offer field names.

Install:
- Copy apps and packages over the existing basic project and choose Replace/Merge.
- From the project root run: bun run build
- Then: bun run dev
