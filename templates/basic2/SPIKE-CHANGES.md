# Spike Admin — Launch Pack 1

This package is based on the exact Mercur source supplied by the user (Mercur 2.3.3 / Medusa 2.18.0).

## Added
- Spike settings module (database-backed)
- Admin endpoint: GET/POST `/admin/spike/settings`
- Non-invasive Spike launch settings panel inside the existing Mercur Admin UI
- Marketplace name/default currency controls
- SAR/USD/old-YER/new-YER exchange-rate fields
- COD + manual transfer toggles
- Vendor approval + product approval toggles
- Per-vendor return-policy toggle
- Spike commission setting
- Admin shortcuts

## Intentionally postponed
- Shipping companies/offices and their dashboard
- Advanced notifications/reports

## First run after replacing files
From `packages/api`:

```powershell
bunx medusa db:generate spike
bunx medusa db:migrate
bun run dev
```

If `db:generate spike` says there is nothing to generate, just run `bunx medusa db:migrate`.

## Safety
The original Mercur admin package is not forked or overwritten. Spike UI is mounted beside it, so existing Products, Offers, Orders, Sellers, Settings and other Mercur pages remain intact.
