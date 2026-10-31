# Plan

| Phase | Scope | Status |
|---|---|---|
| A | Scaffold, design tokens, catalogue, validation, cart store, tests, docs | Done |
| B | Pages: home, shop (search, category, price filter, sort), product, cart, order or visit request (WhatsApp), login and sign-up forms | Done (login not connected) |
| C | 3D viewer: procedural models for 15 products, colour/fabric, 360, full view, share | |
| D | Security headers (_headers, vercel.json strict CSP), build checks | |
| E | server/: booking API, rate limit, Razorpay (order, signature, idempotent webhook), WhatsApp Cloud API, admin | |
| F | Five audit prompts in a fresh session, swap in Wink's real catalogue | |

## Architecture notes
- src/js/products.js and validate.js are shared by browser and server (same rules, same prices).
- Prices are whole rupees. Fabric adds a per-unit delta.
- Payment and booking features stay disabled in the UI until server/ is connected.
