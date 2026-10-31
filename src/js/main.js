import '../css/style.css';
import { mountLayout } from './layout.js';

const page = document.body.dataset.page;
mountLayout(page);
const routes = {
  home: () => import('./home.js'), shop: () => import('./shop.js'), product: () => import('./product.js'),
  cart: () => import('./cartpage.js'), booking: () => import('./booking.js'),
  login: () => import('./auth.js'), signup: () => import('./auth.js'),
};
routes[page]?.().then((m) => m.init(page));
