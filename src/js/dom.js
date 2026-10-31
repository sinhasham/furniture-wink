// Safe DOM helpers. Text is always set with textContent. Never use innerHTML in this project.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ALLOWED_ATTR = new Set([
  'class', 'id', 'href', 'src', 'alt', 'type', 'name', 'value', 'for', 'role',
  'aria-label', 'aria-live', 'aria-pressed', 'aria-expanded', 'aria-controls',
  'aria-hidden', 'aria-current', 'tabindex', 'min', 'max', 'step', 'placeholder',
  'autocomplete', 'inputmode', 'required', 'disabled', 'checked', 'selected',
  'width', 'height', 'loading', 'target', 'rel', 'data-id', 'data-color', 'data-fabric', 'rows', 'maxlength', 'minlength', 'hidden', 'novalidate', 'data-cat',
]);

function safeHref(v) {
  try {
    const u = new URL(v, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol) ? v : '#';
  } catch { return '#'; }
}

/** el('button', {class:'btn', type:'button'}, 'Add'), children are strings or nodes. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (!ALLOWED_ATTR.has(k)) throw new Error(`Attribute not allowed: ${k}`);
    node.setAttribute(k, k === 'href' || k === 'src' ? safeHref(String(v)) : v === true ? '' : String(v));
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  if (tag === 'a' && attrs.target === '_blank') node.setAttribute('rel', 'noopener noreferrer');
  return node;
}

export const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };
