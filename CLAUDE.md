# Wink Furniture: project rules for Claude

Premium furniture catalogue, 3D viewer, booking (site + WhatsApp), pan-India and Bihar delivery.
Stack: HTML/CSS/vanilla JS (ES modules), Vite 8.3.4, Three.js 0.186.1. No framework.
Design: ivory #F8F6F1, beige #E9E1D5, walnut #604A39, charcoal #292923, olive #77775F. Cormorant Garamond + Jost.

## Non-negotiable security rules
1. Server-side validation is the real boundary. Browser validation is only for friendly errors.
2. No secrets in browser code. Server secrets live in env vars (see .env.example).
3. No innerHTML / outerHTML / insertAdjacentHTML with any data. Use src/js/dom.js `el()` and textContent.
4. Cart stores only {id, color, fabric, qty}. Prices always come from src/js/products.js.
5. Strict CSP: no inline scripts or styles, no third-party hosts, fonts self-hosted.
6. Never claim bookings, payments or newsletter work unless a real service is connected.
7. Label all sample content ("Sample product..."). Run `npm audit` before every release.
8. Human security review is required before payments go live.

## Photos
No Pinterest or copyrighted images. Use Wink's own photos, or AI images labelled "design inspiration, made to order".

## Commands
npm run dev | npm run build | npm test | npm audit

## Decisions
WhatsApp via Meta Cloud API with opt-in and STOP. Razorpay from the start (Wink's account).
Developer updates products/prices. Owner manages orders through an admin page (proven auth provider, no custom passwords).
