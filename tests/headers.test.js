import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { CSP, SECURITY_HEADERS } from '../config/security-headers.mjs';
import { headersFile, vercelFile } from '../scripts/gen-headers.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('CSP is strict: no unsafe-inline, no eval, no third-party hosts', () => {
  assert.ok(!/unsafe-inline|unsafe-eval|\*|https?:/.test(CSP), CSP);
  for (const d of ["default-src 'self'", "script-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'"]) assert.ok(CSP.includes(d), d);
  for (const h of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) assert.ok(SECURITY_HEADERS[h], h);
});

test('generated header files are up to date (run: npm run headers)', () => {
  assert.equal(read('public/_headers'), headersFile());
  assert.equal(read('vercel.json'), vercelFile());
});

test('HTML pages have no inline scripts, inline styles or event handlers', () => {
  const pages = readdirSync(new URL('..', import.meta.url)).filter((f) => f.endsWith('.html'));
  assert.ok(pages.length >= 8);
  for (const f of pages) {
    const html = read(f);
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), `${f}: inline script`);
    assert.ok(!/<style[\s>]/i.test(html) && !/\sstyle\s*=/i.test(html), `${f}: inline style`);
    assert.ok(!/\son[a-z]+\s*=/i.test(html), `${f}: inline handler`);
  }
});

test('source has no innerHTML, outerHTML, insertAdjacentHTML or eval', () => {
  const dir = new URL('../src/js/', import.meta.url);
  for (const f of readdirSync(dir)) {
    const code = readFileSync(new URL(f, dir), 'utf8').split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*')).join('\n');
    assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function\(/.test(code), f);
  }
});
