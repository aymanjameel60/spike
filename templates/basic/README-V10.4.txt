Spike v10.4 — Checkout + Product Image Upload

1) MERCUR
Copy folders apps and packages into:
C:\Users\jamee\Downloads\storm\mercur\templates\basic
Choose Replace/Merge. Do NOT delete the existing folders.

Then run from basic:
  bun run build
  bun run dev

No new database migration is required if v10 delivery-office migration was already installed.

2) STOREFRONT
Copy the contents of folder storefront over your current Spike frontend.
Replace the three files under src/core.
Then refresh the browser with Ctrl+F5.

What changed:
- Checkout now loads the seller's selected Spike delivery offices by customer city.
- Delivery is quoted by piece or kg using admin rates.
- Multi-vendor cart requires one delivery office per store.
- Selected office/payment/delivery quote are saved in cart metadata.
- Checkout configures Medusa manual shipping + system payment automatically, then completes the cart.
- Vendor add-product page uses file upload through /vendor/uploads instead of an image URL.
