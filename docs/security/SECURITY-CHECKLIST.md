# Security checklist

Tick each item before release. Items marked (server) apply from Phase E.

## Code
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] `grep -rE "innerHTML|outerHTML|insertAdjacentHTML|eval\(" src dist` finds nothing
- [ ] No keys, tokens or secrets in src/ or dist/; no VITE_* secrets
- [ ] Dependencies pinned to exact versions

## Data and money
- [ ] Cart holds only {id, color, fabric, qty}; totals recomputed from catalogue (server)
- [ ] Booking input re-validated with src/js/validate.js (server)
- [ ] Rate limiting on booking and payment endpoints (server)
- [ ] Razorpay: order created server-side, signature verified, webhook signature verified and idempotent (server)
- [ ] WhatsApp messages only with explicit opt-in; STOP honoured (server)
- [ ] Admin uses a proven auth provider with MFA; no custom passwords (server)
- [ ] Human security review signed off before payments go live

## Browser
- [x] Strict CSP (default-src 'self', no unsafe-inline), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (Phase D: config/security-headers.mjs; `npm run headers` writes public/_headers and vercel.json; `npm run preview` serves them locally)
- [x] Fonts self-hosted; no third-party scripts
- [ ] Sample content labelled everywhere it appears
- [ ] No claim that booking, payment or newsletter works until a real service is connected

## Deploy notes (Phase D)
- Netlify or Cloudflare Pages: `public/_headers` is picked up automatically. Vercel: `vercel.json`. Other hosts: copy the headers from `config/security-headers.mjs` into the host's config.
- After deploy, check the live site at securityheaders.com. Expect an A grade.
- HSTS is only valid over HTTPS. Do not add `preload` until the final domain is confirmed.
- Phase E: if the API is on another host, add it to `connect-src` only. Razorpay Checkout needs its script and frame hosts added to `script-src` and `frame-src`. Do that deliberately, with a security review.
- `npm run dev` does not use the strict CSP (Vite hot reload needs it relaxed). Always test with `npm run build && npm run preview`.
