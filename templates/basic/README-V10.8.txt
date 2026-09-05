Spike v10.8 — Backend Shipping + Dashboard UI

What changed
1) New native Store API route:
   POST /store/spike/checkout/shipping
   - Reads cart seller items and their shipping profiles.
   - Selects one valid Mercur shipping option per seller/profile.
   - Chooses the cheapest Spike delivery office covering the customer's city.
   - Applies the shipping methods to the cart before order completion.
   - Rewrites the cart shipping-method amount to the selected office quote and stores office metadata.

2) Vendor delivery settings now also persist seller_id, so checkout can use each seller's selected offices.
   Existing vendor must open Delivery Settings and click Save once after migration to backfill seller_id.

3) Migration Migration20260905033000 adds seller_id to spike_vendor_delivery_setting.

4) Admin Reports + Delivery Offices and Vendor Reports + Delivery Settings styling was changed to inherit the Mercur dashboard theme. White custom page/card backgrounds are removed.

5) storefront/src/core/api.js is a tiny bridge update required to call the new backend shipping route. It is based on v10.7.

Install
- Merge apps and packages into the Mercur basic project and Replace changed files.
- Merge storefront/src/core/api.js into the current storefront (v10.7).
- From project root:
    cd packages/api
    bunx medusa db:migrate
    cd ../..
    bun run build
    bun run dev
- Vendor: open Settings > Delivery and press Save once, even if offices are already checked.
- Hard refresh storefront: Ctrl+Shift+R

Important
If checkout returns that a seller has no Shipping Option linked to its shipping profile, that seller still needs one native Mercur shipping option. v10.8 no longer selects a single global option; it requires a valid option for every seller/profile, which is what Mercur's split-order workflow validates.
