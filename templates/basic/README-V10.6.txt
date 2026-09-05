Spike v10.6

1) Merge apps into Mercur basic/apps.
2) Replace storefront with the supplied storefront files.
3) bun run build, then bun run dev.

Frontend fixes:
- Price and offer_id are read from /store/offers with calculated_price + inventory_quantity.
- Offer price overrides missing/zero product variant price.
- Checkout requires login and returns after login.
- Cheapest eligible delivery office is auto-selected per seller.
- Checkout uses Spike delivery quote + Mercur shipping/payment completion.

Admin:
- Dynamic attention badges on dashboard shortcuts for pending orders/products/sellers.
- Commission basis setting: products only OR products + shipping.
- Reports respect commission basis.

Test customer:
Run tools/create-test-customer.ps1 with your publishable key.
