import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PRODUCTS } from '../src/js/products.js';
import { buildModel } from '../src/js/models.js';

test('3D: every product builds, and the main piece matches the catalogue size', () => {
  for (const p of PRODUCTS) {
    const model = buildModel(p, { color: p.colours[0], fabric: p.fabrics[0], qty: 1 });
    const size = new THREE.Box3().setFromObject(model.ref).getSize(new THREE.Vector3());
    const near = (got, cm) => Math.abs(got * 100 - cm) <= Math.max(3, cm * 0.04);
    assert.ok(near(size.x, p.dims.w), `${p.id} width ${(size.x * 100).toFixed(1)} vs ${p.dims.w}`);
    assert.ok(near(size.z, p.dims.d), `${p.id} depth ${(size.z * 100).toFixed(1)} vs ${p.dims.d}`);
    assert.ok(near(size.y, p.dims.h) || model.hung, `${p.id} height ${(size.y * 100).toFixed(1)} vs ${p.dims.h}`);
    model.update({ color: p.colours.at(-1), fabric: p.fabrics.at(-1), qty: 1 });
    model.dispose();
  }
});

test('3D: hanging frames report hung, and the frame height matches', () => {
  for (const id of ['panel-01', 'panel-02']) {
    const p = PRODUCTS.find((x) => x.id === id);
    const model = buildModel(p, { color: 'walnut', fabric: 'none', qty: 1 });
    assert.equal(model.hung, true);
    const size = new THREE.Box3().setFromObject(model.ref).getSize(new THREE.Vector3());
    assert.ok(Math.abs(size.y * 100 - p.dims.h) <= 3, `${id} height`);
  }
});
