import { $, el } from './dom.js';
import { validateAuth } from './validate.js';

// Accounts are NOT connected. Real login needs a proven auth provider on the server (Phase E).
// This page validates the format only and never stores or sends the password anywhere.
export function init(mode) {
  const signup = mode === 'signup';
  const rows = [signup ? ['name', 'Full name', 'text', 'name'] : null, ['email', 'Email', 'email', 'email'],
    ['password', 'Password', 'password', signup ? 'new-password' : 'current-password'], signup ? ['confirm', 'Confirm password', 'password', 'new-password'] : null].filter(Boolean);
  const msg = el('p', { class: 'notice', role: 'status', 'aria-live': 'polite' }, 'Accounts are not live yet. You can browse, add to cart and send an order request as a guest.');
  const form = el('form', { novalidate: true },
    ...rows.map(([id, label, type, ac]) => el('div', { class: 'field' }, el('label', { for: id }, label), el('input', { id, name: id, type, autocomplete: ac, maxlength: 128 }), el('span', { class: 'err', id: `err-${id}`, 'aria-live': 'polite' }))),
    el('button', { class: 'btn', type: 'submit' }, signup ? 'Create account' : 'Log in'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelectorAll('.err').forEach((n) => { n.textContent = ''; });
    const r = validateAuth(Object.fromEntries(new FormData(form)), mode);
    if (!r.ok) { Object.entries(r.errors).forEach(([k, m]) => { $(`#err-${k}`).textContent = m; }); return; }
    msg.textContent = 'Details look fine, but accounts are not connected yet, so nothing was saved. Please continue as a guest.';
    form.elements.password.value = ''; if (form.elements.confirm) form.elements.confirm.value = '';
  });
  $('#auth').append(form, msg, el('p', {}, signup ? 'Already have an account? ' : 'New here? ', el('a', { href: signup ? '/login.html' : '/signup.html' }, signup ? 'Log in' : 'Create an account')));
}
