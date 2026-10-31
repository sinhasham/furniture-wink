import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { SECURITY_HEADERS } from './config/security-headers.mjs';

// Multi-page site. No framework, no inline scripts (strict CSP friendly).
export default defineConfig({
  // `npm run preview` serves the built site with the real production headers, so CSP problems show up before deploy.
  // (`npm run dev` does not use the strict CSP, because Vite's hot reload needs inline code.)
  preview: { headers: SECURITY_HEADERS },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        ...Object.fromEntries(['index', 'shop', 'product', 'cart', 'booking', 'login', 'signup', 'about'].map((n) => [n, resolve(import.meta.dirname, `${n}.html`)])),
      },
    },
  },
});
