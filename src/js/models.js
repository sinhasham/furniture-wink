// Simple parametric 3D demo models. Sizes come from the catalogue (cm -> metres), so the
// dimension overlay always matches the product data. These are placeholder shapes, not
// Wink's real designs. Replace with real .glb models later.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { COLOURS } from './products.js';

const HAS_DOM = typeof document !== 'undefined';

/* ---------- procedural textures (skipped when there is no DOM, e.g. in unit tests) ---------- */
function canvasTex(size, draw, repeat) {
  if (!HAS_DOM) return null;
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })(); // fixed seed: same look every time

const woodTex = () => canvasTex(256, (g, n) => {
  g.fillStyle = '#e6e6e6'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 90; i++) {
    const y = rnd() * n, a = 0.05 + rnd() * 0.12;
    g.strokeStyle = `rgba(90,90,90,${a})`; g.lineWidth = 0.6 + rnd() * 1.8;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= n; x += 32) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 2.5);
    g.stroke();
  }
}, 1);
const weaveTex = (strong) => canvasTex(128, (g, n) => {
  g.fillStyle = '#f0f0f0'; g.fillRect(0, 0, n, n);
  const step = strong ? 4 : 2;
  for (let y = 0; y < n; y += step) for (let x = 0; x < n; x += step) {
    g.fillStyle = `rgba(0,0,0,${(x / step + y / step) % 2 ? 0.07 : 0})`; g.fillRect(x, y, step, step);
    if (strong && rnd() > 0.93) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, y, step * 3, 1); }
  }
}, 6);
const pebbleTex = () => canvasTex(128, (g, n) => {
  g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(0,0,0,${0.04 + rnd() * 0.08})`; g.beginPath(); g.arc(rnd() * n, rnd() * n, 1 + rnd() * 1.6, 0, 6.3); g.fill(); }
}, 5);

const FABRIC_LOOK = {
  cotton:  { roughness: 0.95, sheen: 0,   tex: () => weaveTex(false), clearcoat: 0 },
  linen:   { roughness: 0.9,  sheen: 0,   tex: () => weaveTex(true),  clearcoat: 0 },
  velvet:  { roughness: 0.78, sheen: 1,   tex: () => null,            clearcoat: 0 },
  leather: { roughness: 0.42, sheen: 0,   tex: () => pebbleTex(),     clearcoat: 0.25 },
  none:    { roughness: 0.95, sheen: 0,   tex: () => weaveTex(false), clearcoat: 0 },
};

/* ---------- small builders ---------- */
const m = (cm) => cm / 100;
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o;
}
/** Box given by its size and the position of its bottom-centre. */
const box = (w, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z);
const soft = (w, h, d, r, mat, x, y, z) => mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), mat, x, y + h / 2, z);
const post = (r, h, mat, x, y, z, rTop = r) => mesh(new THREE.CylinderGeometry(rTop, r, h, 14), mat, x, y + h / 2, z);

function makeMaterials(kind) {
  const wood = new THREE.MeshStandardMaterial({ color: '#604A39', roughness: 0.62, metalness: 0, map: woodTex() });
  const dark = new THREE.MeshStandardMaterial({ color: '#3A2D23', roughness: 0.7, map: woodTex() });
  const metal = new THREE.MeshStandardMaterial({ color: '#B8A27A', roughness: 0.35, metalness: 0.85 });
  const fabric = new THREE.MeshPhysicalMaterial({ color: '#77775F', roughness: 0.95 });
  const bedding = new THREE.MeshStandardMaterial({ color: '#F1ECE2', roughness: 0.95, map: weaveTex(false) });
  const bedding2 = new THREE.MeshStandardMaterial({ color: '#77775F', roughness: 0.95, map: weaveTex(false) });
  return { wood, dark, metal, fabric, bedding, bedding2, kind };
}

/* ---------- models (all in metres, floor at y = 0, centred on x/z) ---------- */
function sofa(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h);
  const L = d > 1.2;                       // L-shape has a chaise end
  const md = L ? 0.92 : d;                 // depth of the main seating block
  const leg = 0.13, baseTop = 0.4, arm = 0.18, g = new THREE.Group();
  const z0 = -d / 2;                       // back edge
  const cz = z0 + md / 2;                  // centre of main block (z)
  g.add(box(w, baseTop - leg, md, M.fabric, 0, leg, cz));
  g.add(box(w, h - baseTop, 0.22, M.fabric, 0, baseTop, z0 + 0.11));
  g.add(soft(arm, 0.62 - leg, md, 0.04, M.fabric, -w / 2 + arm / 2, leg, cz));
  const rightD = L ? d : md;
  g.add(soft(arm, 0.62 - leg, rightD, 0.04, M.fabric, w / 2 - arm / 2, leg, z0 + rightD / 2));
  const inner = w - 2 * arm, mainW = L ? inner - 0.9 : inner;
  const n = Math.max(1, Math.round(mainW / 0.68)), cw = mainW / n, x0 = -inner / 2;
  for (let i = 0; i < n; i++) {
    const x = x0 + cw * (i + 0.5);
    g.add(soft(cw - 0.01, 0.16, md - 0.2, 0.05, M.fabric, x, baseTop, cz + 0.1));
    const b = soft(cw - 0.02, h - baseTop - 0.14, 0.16, 0.05, M.fabric, x, baseTop + 0.1, z0 + 0.3);
    b.rotation.x = -0.13; g.add(b);
  }
  if (L) {                                  // chaise
    const cx = w / 2 - arm - 0.45;
    g.add(box(0.9, baseTop - leg, d - md, M.fabric, cx, leg, z0 + md + (d - md) / 2));
    g.add(soft(0.88, 0.16, d - md - 0.04, 0.05, M.fabric, cx, baseTop, z0 + md + (d - md) / 2));
    g.add(soft(0.88, 0.16, md - 0.2, 0.05, M.fabric, cx, baseTop, cz + 0.1));
    const b = soft(0.88, h - baseTop - 0.14, 0.16, 0.05, M.fabric, cx, baseTop + 0.1, z0 + 0.3); b.rotation.x = -0.13; g.add(b);
  }
  const legZ = [z0 + 0.1, z0 + md - 0.1];
  if (L) legZ.push(d / 2 - 0.1);
  for (const sx of [-1, 1]) for (const lz of legZ) {
    if (L && lz === d / 2 - 0.1 && sx === -1) continue;   // nothing above the left side of the chaise
    g.add(post(0.025, leg, M.dark, sx * (w / 2 - 0.1), 0, lz, 0.018));
  }
  parts.upholstery = true; return { main: g };
}

function loungeChair(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group();
  const seatTop = 0.4;
  g.add(soft(w - 0.08, seatTop - 0.16, d - 0.1, 0.06, M.fabric, 0, 0.16, 0.03));
  g.add(soft(w - 0.16, 0.14, d - 0.2, 0.06, M.fabric, 0, seatTop, 0.06));
  // curved back: a thick arc, extruded upward
  const R = w / 2, r = R - 0.1, a0 = Math.PI / 2 - 1.15, a1 = Math.PI / 2 + 1.15;
  const s = new THREE.Shape();
  s.absarc(0, 0, R, a0, a1, false); s.absarc(0, 0, r, a1, a0, true); s.closePath();
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: h - (seatTop - 0.1) - 0.02, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 24 }), M.fabric);
  back.rotation.x = -Math.PI / 2; back.position.set(0, seatTop - 0.1, -d / 2 + R + 0.02); back.castShadow = back.receiveShadow = true;
  g.add(back);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const l = post(0.022, 0.2, M.dark, sx * (w / 2 - 0.12), 0, sz * (d / 2 - 0.12), 0.016); l.rotation.z = sx * -0.12; g.add(l);
  }
  parts.upholstery = true; return { main: g };
}

function diningChair(M, fabricMat) {
  const g = new THREE.Group(), w = 0.45, d = 0.5, seatY = 0.45, h = 0.88;
  g.add(box(w, 0.04, d, M.wood, 0, seatY - 0.04, 0));
  g.add(soft(w - 0.04, 0.05, d - 0.05, 0.02, fabricMat, 0, seatY, 0.0));
  for (const sx of [-1, 1]) {
    g.add(box(0.04, seatY - 0.04, 0.04, M.wood, sx * (w / 2 - 0.02), 0, d / 2 - 0.02));
    g.add(box(0.04, h, 0.04, M.wood, sx * (w / 2 - 0.02), 0, -d / 2 + 0.02));
  }
  g.add(box(w, 0.07, 0.03, M.wood, 0, h - 0.07, -d / 2 + 0.02));
  g.add(box(w - 0.08, 0.06, 0.02, M.wood, 0, seatY + 0.22, -d / 2 + 0.02));
  g.add(box(w, 0.03, 0.03, M.wood, 0, 0.18, d / 2 - 0.02));
  return g;
}
function diningChairModel(p, M, parts) {
  const g = diningChair(M, M.fabric); parts.chairSeat = true; parts.wood = true; return { main: g };
}

function bed(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group(), z0 = -d / 2;
  const leg = 0.12, frameH = 0.3;
  g.add(box(w, frameH, d - 0.1, M.wood, 0, leg, 0.05));
  const matt = soft(w - 0.1, 0.24, d - 0.22, 0.05, M.bedding, 0, leg + frameH, 0.08);
  g.add(matt);
  g.add(box(w, h, 0.09, M.wood, 0, 0, z0 + 0.045));                    // headboard
  for (const sx of [-1, 0, 1]) g.add(box(w / 3 - 0.14, h * 0.5, 0.03, M.dark, sx * (w / 3), h * 0.3, z0 + 0.105)); // panels
  g.add(box(w + 0.0, 0.2, 0.06, M.wood, 0, leg, d / 2 - 0.08));        // foot rail
  const top = leg + frameH + 0.24;
  for (const sx of [-1, 1]) g.add(soft(w / 2 - 0.2, 0.14, 0.42, 0.06, M.bedding, sx * (w / 4), top, z0 + 0.4));
  g.add(soft(w - 0.14, 0.06, d * 0.5, 0.03, M.bedding2, 0, top, z0 + 0.7 + d * 0.25));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.07, leg, 0.07, M.dark, sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06)));
  parts.wood = true; return { main: g };
}

function wardrobe(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d) - 0.045, // handles stick out, so the carcass is a little shallower
     h = m(p.dims.h), g = new THREE.Group(), plinth = 0.08, crown = 0.05;
  g.add(box(w - 0.06, plinth, d - 0.06, M.dark, 0, 0, 0));
  g.add(box(w, h - plinth - crown, d - 0.02, M.wood, 0, plinth, -0.01));
  g.add(box(w + 0.04, crown, d + 0.02, M.wood, 0, h - crown, 0));
  const n = w >= 1.5 ? 3 : 2, dw = (w - 0.04) / n;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.02 + dw * (i + 0.5);
    g.add(box(dw - 0.012, h - plinth - crown - 0.08, 0.025, M.wood, x, plinth + 0.04, d / 2 - 0.02));
    g.add(box(dw - 0.1, h - plinth - crown - 0.2, 0.012, M.dark, x, plinth + 0.1, d / 2));
    const hx = i < n / 2 ? x + dw / 2 - 0.05 : x - dw / 2 + 0.05;
    g.add(box(0.02, 0.28, 0.02, M.metal, hx, h * 0.5 - 0.14, d / 2 + 0.015));
  }
  parts.wood = true; return { main: g };
}

function sideboard(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group(), leg = 0.15, topT = 0.035;
  g.add(box(w, topT, d, M.wood, 0, h - topT, 0));
  g.add(box(w - 0.06, h - leg - topT, d - 0.04, M.wood, 0, leg, -0.01));
  const dw = (w - 0.06) / 4, flute = new THREE.CylinderGeometry(0.008, 0.008, h - leg - topT - 0.1, 8);
  for (let i = 0; i < 4; i++) {
    const x = -w / 2 + 0.03 + dw * (i + 0.5);
    g.add(box(dw - 0.01, h - leg - topT - 0.06, 0.02, M.wood, x, leg + 0.03, d / 2 - 0.02));
    for (let k = 0; k < 9; k++) g.add(mesh(flute, M.wood, x - dw / 2 + 0.03 + k * ((dw - 0.06) / 8), leg + 0.05 + (h - leg - topT - 0.1) / 2, d / 2 - 0.006));
    g.add(box(0.015, 0.1, 0.015, M.metal, x + (i % 2 ? -1 : 1) * (dw / 2 - 0.035), h - topT - 0.2, d / 2 + 0.01));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(post(0.026, leg, M.dark, sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.07), 0.016));
  parts.wood = true; return { main: g };
}

function tableBase(w, d, h, M, { topT = 0.04, inset = 0.06, legW = 0.06, round = false } = {}) {
  const g = new THREE.Group();
  g.add(round ? mesh(new THREE.CylinderGeometry(w / 2, w / 2, topT, 40), M.wood, 0, h - topT / 2, 0) : soft(w, topT, d, 0.012, M.wood, 0, h - topT, 0));
  const lh = h - topT, ix = w / 2 - inset, iz = d / 2 - inset;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(round ? post(legW / 2, lh, M.wood, sx * ix * 0.7, 0, sz * iz * 0.7, legW / 3) : box(legW, lh, legW, M.wood, sx * ix, 0, sz * iz));
  if (!round) {
    g.add(box(w - 2 * inset, 0.07, 0.03, M.wood, 0, lh - 0.07, iz)); g.add(box(w - 2 * inset, 0.07, 0.03, M.wood, 0, lh - 0.07, -iz));
    g.add(box(0.03, 0.07, d - 2 * inset, M.wood, ix, lh - 0.07, 0)); g.add(box(0.03, 0.07, d - 2 * inset, M.wood, -ix, lh - 0.07, 0));
  }
  return g;
}

function diningSet(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h);
  const table = tableBase(w, d, h, M, { inset: 0.08, legW: 0.08 });
  const chairs = new THREE.Group(), seat = new THREE.MeshStandardMaterial({ color: '#D8CBB6', roughness: 0.95, map: weaveTex(false) });
  const place = (x, z, ry) => { const c = diningChair(M, seat); c.position.set(x, 0, z); c.rotation.y = ry; chairs.add(c); };
  for (const sx of [-0.3, 0.3]) { place(sx, d / 2 + 0.12, Math.PI); place(sx, -d / 2 - 0.12, 0); }
  place(w / 2 + 0.12, 0, -Math.PI / 2); place(-w / 2 - 0.12, 0, Math.PI / 2);
  parts.wood = true; return { main: table, extras: chairs };
}

function coffeeTable(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group();
  g.add(soft(w, 0.04, d, 0.02, M.wood, 0, h - 0.04, 0));
  g.add(soft(w - 0.18, 0.025, d - 0.14, 0.01, M.wood, 0, 0.1, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = post(0.03, h - 0.04, M.wood, sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.07), 0.022); l.rotation.z = sx * -0.04; g.add(l); }
  parts.wood = true; return { main: g };
}
function sideTable(p, M, parts) {
  const w = m(p.dims.w), h = m(p.dims.h), g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.035, 40), M.wood, 0, h - 0.0175, 0));
  g.add(mesh(new THREE.CylinderGeometry(w / 2 - 0.05, w / 2 - 0.05, 0.02, 40), M.wood, 0, 0.14, 0));
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5, l = post(0.02, h - 0.035, M.wood, Math.sin(a) * (w / 2 - 0.07), 0, Math.cos(a) * (w / 2 - 0.07), 0.015); g.add(l); }
  parts.wood = true; return { main: g };
}
function studyTable(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = tableBase(w, d, h, M, { topT: 0.035, inset: 0.05, legW: 0.05 });
  g.add(box(0.5, 0.12, d - 0.14, M.wood, w / 2 - 0.35, h - 0.035 - 0.12, 0));
  g.add(box(0.46, 0.09, 0.02, M.dark, w / 2 - 0.35, h - 0.035 - 0.105, d / 2 - 0.05));
  g.add(box(0.12, 0.014, 0.014, M.metal, w / 2 - 0.35, h - 0.035 - 0.07, d / 2 - 0.03));
  parts.wood = true; return { main: g };
}

/* wall frames hang on a wall: bottom edge 0.9 m above the floor */
const HANG = 0.9;
function lotusFrame(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group(), z = 0, b = 0.05;
  g.add(box(w, h, d / 2, M.dark, 0, HANG, z));
  for (const [bw, bh, x, y] of [[w, b, 0, HANG], [w, b, 0, HANG + h - b], [b, h, -w / 2 + b / 2, HANG], [b, h, w / 2 - b / 2, HANG]]) g.add(box(bw, bh, d, M.wood, x, y, z + d / 4));
  const cx = 0, cy = HANG + h / 2, petal = new THREE.SphereGeometry(1, 16, 12);
  const ring = (n, len, wid, rad, off, zz) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + off, pm = mesh(petal, M.wood, cx + Math.sin(a) * rad, cy + Math.cos(a) * rad, z + zz); pm.scale.set(wid, len, 0.008); pm.rotation.z = -a; g.add(pm); } };
  ring(12, 0.14 * h / 0.9, 0.05, 0.24 * h / 0.9, 0, 0.015);
  ring(8, 0.12 * h / 0.9, 0.055, 0.16 * h / 0.9, Math.PI / 8, 0.02);
  ring(8, 0.08 * h / 0.9, 0.045, 0.08 * h / 0.9, 0, 0.025);
  const c = mesh(new THREE.SphereGeometry(0.04 * h / 0.9, 16, 12), M.metal, cx, cy, z + 0.025); c.scale.z = 0.4; g.add(c);
  parts.wood = true; return { main: g, hung: true };
}
function jaaliFrame(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group(), b = 0.05, z = 0;
  g.add(box(w, h, d / 3, M.dark, 0, HANG, z));
  for (const [bw, bh, x, y] of [[w, b, 0, HANG], [w, b, 0, HANG + h - b], [b, h, -w / 2 + b / 2, HANG], [b, h, w / 2 - b / 2, HANG]]) g.add(box(bw, bh, d, M.wood, x, y, z + d / 3));
  const s = 0.05, shape = new THREE.Shape(), hole = new THREE.Path();
  shape.moveTo(0, s); shape.lineTo(s, 0); shape.lineTo(0, -s); shape.lineTo(-s, 0); shape.closePath();
  const q = s * 0.66; hole.moveTo(0, q); hole.lineTo(-q, 0); hole.lineTo(0, -q); hole.lineTo(q, 0); hole.closePath(); shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d * 0.6, bevelEnabled: false });
  const spots = [], ix = w / 2 - b - s, iy = h / 2 - b - s;
  for (let i = -Math.floor(ix / s); i <= Math.floor(ix / s); i++) for (let j = -Math.floor(iy / s); j <= Math.floor(iy / s); j++) if ((i + j) % 2 === 0) spots.push([i * s, j * s]);
  const im = new THREE.InstancedMesh(geo, M.wood, spots.length), mat4 = new THREE.Matrix4();
  spots.forEach(([x, y], i) => { mat4.makeTranslation(x, HANG + h / 2 + y, z + d / 3); im.setMatrixAt(i, mat4); });
  im.castShadow = im.receiveShadow = true; g.add(im);
  parts.wood = true; return { main: g, hung: true };
}

function doorModel(p, M, parts) {
  const w = m(p.dims.w), d = m(p.dims.d), h = m(p.dims.h), g = new THREE.Group(), ds = d - 0.03, front = -0.015 + ds / 2;
  g.add(box(w, h, ds, M.wood, 0, 0, -0.015));
  g.add(box(w - 0.3, h * 0.4, 0.012, M.dark, 0, h * 0.52, front + 0.006));
  g.add(box(w - 0.3, h * 0.28, 0.012, M.dark, 0, h * 0.14, front + 0.006));
  g.add(box(0.025, 0.2, 0.025, M.metal, w / 2 - 0.1, h * 0.46, front + 0.0125 + 0.0125));
  parts.wood = true; return { main: g };
}

const BUILDERS = {
  door: doorModel,
  'sofa-aria-3': sofa, 'sofa-kiran-2': sofa, 'sofa-meher-l': sofa,
  'chair-lounge': loungeChair, 'chair-dining': diningChairModel,
  'bed-king': bed, 'bed-queen': bed, 'wardrobe-3d': wardrobe, sideboard,
  'dining-6': diningSet, 'table-coffee': coffeeTable, 'table-side': sideTable, 'table-study': studyTable,
  'frame-lotus': lotusFrame, 'frame-jaali': jaaliFrame,
};

/**
 * buildModel(product, selection) -> { object, ref, hung, update(sel), dispose() }
 * object: everything to draw. ref: the main piece (used for the dimension overlay).
 */
export function buildModel(p, sel) {
  const build = BUILDERS[p.model];
  if (!build) throw new Error(`No 3D model for ${p.model}`);
  const M = makeMaterials(p.category), parts = {};
  const { main, extras, hung } = build(p, M, parts);
  const object = new THREE.Group(); object.add(main); if (extras) object.add(extras);
  object.updateMatrixWorld(true);

  let fabricKey = null;
  function setFabric(mat, key) {
    if (fabricKey === key) return;
    const look = FABRIC_LOOK[key] ?? FABRIC_LOOK.cotton;
    if (mat.map && mat.map !== M.wood.map) mat.map.dispose();
    mat.map = look.tex(); mat.roughness = look.roughness;
    if ('sheen' in mat) { mat.sheen = look.sheen; mat.sheenRoughness = 0.5; mat.sheenColor.set('#ffffff'); mat.clearcoat = look.clearcoat; mat.clearcoatRoughness = 0.35; }
    mat.needsUpdate = true;
  }
  function update(s) {
    const hex = COLOURS[s.color]?.hex ?? '#777777';
    if (parts.upholstery) { M.fabric.color.set(hex).multiplyScalar(0.86); setFabric(M.fabric, s.fabric); fabricKey = s.fabric; }
    if (parts.wood) { M.wood.color.set(hex); M.dark.color.set(new THREE.Color(hex).multiplyScalar(0.55)); }
    if (parts.chairSeat) { M.fabric.color.set('#D8CBB6'); setFabric(M.fabric, s.fabric); fabricKey = s.fabric; }
  }
  update(sel);

  return {
    object, ref: main, hung: !!hung, update,
    dispose() {
      object.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      for (const v of Object.values(M)) if (v && v.isMaterial) { v.map?.dispose(); v.dispose(); }
    },
  };
}
