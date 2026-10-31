import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Renders a model from buildModel() into `host`. Throws if WebGL is unavailable. */
export function createViewer(host, model, dims) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
  const canvas = renderer.domElement;
  canvas.className = 'viewer__canvas'; canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '3D view. Drag to rotate. Arrow keys also rotate.');
  host.append(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex; scene.environmentIntensity = 0.75;
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0xd8cbb6, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(2.2, 3.6, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 12 }); sun.shadow.bias = -0.0004; sun.shadow.radius = 5;
  scene.add(sun);

  scene.add(model.object);
  const box = new THREE.Box3().setFromObject(model.object), ctr = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
  const ref = new THREE.Box3().setFromObject(model.ref);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.2 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const disc = document.createElement('canvas'); disc.width = disc.height = 256;
  const dc = disc.getContext('2d'), gr = dc.createRadialGradient(128, 128, 20, 128, 128, 128);
  gr.addColorStop(0, 'rgba(216,203,182,0.95)'); gr.addColorStop(1, 'rgba(216,203,182,0)'); dc.fillStyle = gr; dc.fillRect(0, 0, 256, 256);
  const discTex = new THREE.CanvasTexture(disc); discTex.colorSpace = THREE.SRGBColorSpace;
  const dsz = Math.max(size.x, size.z) * 2.6 + 1;
  const discMesh = new THREE.Mesh(new THREE.PlaneGeometry(dsz, dsz), new THREE.MeshBasicMaterial({ map: discTex, transparent: true, depthWrite: false }));
  discMesh.rotation.x = -Math.PI / 2; discMesh.position.y = 0.001; scene.add(discMesh);
  if (model.hung) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshStandardMaterial({ color: '#EFE8DC', roughness: 1 }));
    wall.position.set(0, 2.5, ref.min.z - 0.01); wall.receiveShadow = true; scene.add(wall);
  }

  const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false; controls.enableZoom = false;
  controls.maxPolarAngle = Math.PI / 2 - 0.03; controls.rotateSpeed = 0.7; controls.autoRotateSpeed = 2.4;
  controls.listenToKeyEvents(canvas);
  if (model.hung) { controls.minAzimuthAngle = -1.0; controls.maxAzimuthAngle = 1.0; }
  canvas.style.touchAction = 'pan-y'; // page can still scroll on phones

  function frame() {
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const radius = Math.max(size.x, size.y, size.z * 0.8) * 0.5;
    let dist = (radius / Math.tan(fov / 2)) * 1.35 + size.z * 0.5;
    if (camera.aspect < 1.2) dist *= 1.2 / Math.max(camera.aspect, 0.6);
    camera.position.copy(ctr).addScaledVector(new THREE.Vector3(0.55, 0.42, 0.95).normalize(), dist);
    controls.target.copy(ctr).add(new THREE.Vector3(0, -size.y * 0.04, 0));
    controls.minDistance = dist * 0.45; controls.maxDistance = dist * 1.7; controls.update();
  }

  /* dimension overlay: three lines (W, D, H) with text labels */
  const dimGroup = new THREE.Group(); dimGroup.visible = false; scene.add(dimGroup);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x604a39, depthTest: false, transparent: true });
  const off = 0.1, fz = ref.max.z + off;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const mkLine = (pts) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat); l.renderOrder = 10; dimGroup.add(l); };
  const wA = V(ref.min.x, ref.min.y, fz), wB = V(ref.max.x, ref.min.y, fz);
  const dA = V(ref.max.x + off, ref.min.y, ref.min.z), dB = V(ref.max.x + off, ref.min.y, ref.max.z);
  const hA = V(ref.min.x - off, ref.min.y, fz), hB = V(ref.min.x - off, ref.max.y, fz);
  [[wA, wB], [dA, dB], [hA, hB]].forEach(([a, b]) => mkLine([a, b]));
  const tick = (p, ax) => mkLine([p.clone().addScaledVector(ax, -0.03), p.clone().addScaledVector(ax, 0.03)]);
  const X = V(1, 0, 0), Z = V(0, 0, 1);
  [wA, wB].forEach((p) => tick(p, Z)); [dA, dB].forEach((p) => tick(p, X)); [hA, hB].forEach((p) => tick(p, X));
  const labels = [['W', dims.w, wA.clone().lerp(wB, 0.5)], ['D', dims.d, dA.clone().lerp(dB, 0.5)], ['H', dims.h, hA.clone().lerp(hB, 0.5)]].map(([k, v, pos]) => {
    const n = document.createElement('span'); n.className = 'dimlabel'; n.hidden = true; n.textContent = `${k} ${v} cm`; host.append(n); return { n, pos };
  });

  const tmp = new THREE.Vector3(); let w = 1, h = 1;
  function resize() {
    w = host.clientWidth; h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function render() {
    controls.update(); renderer.render(scene, camera);
    if (dimGroup.visible) labels.forEach(({ n, pos }) => {
      tmp.copy(pos).project(camera);
      n.style.transform = `translate(-50%,-50%) translate(${(tmp.x * 0.5 + 0.5) * w}px,${(-tmp.y * 0.5 + 0.5) * h}px)`;
    });
  }
  // only render while visible: saves battery on phones
  let running = false, visible = true, paused = false;
  const sync = () => {
    const should = visible && !document.hidden && !paused;
    if (should && !running) { running = true; renderer.setAnimationLoop(render); }
    if (!should && running) { running = false; renderer.setAnimationLoop(null); }
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }); io.observe(host);
  document.addEventListener('visibilitychange', sync);
  const ro = new ResizeObserver(resize); ro.observe(host);
  resize(); frame(); sync();
  // wheel-zoom only after the user clicks the model, so page scrolling is never hijacked
  canvas.addEventListener('pointerdown', () => { controls.enableZoom = true; });
  canvas.addEventListener('blur', () => { if (!host.dataset.full) controls.enableZoom = false; });

  return {
    update: (sel) => model.update(sel),
    setDimensions(on) { dimGroup.visible = on; labels.forEach(({ n }) => { n.hidden = !on; }); },
    setSpin(on) { controls.autoRotate = on; },
    setPaused(on) { paused = on; sync(); },
    setFull(on) {
      controls.enableZoom = on; canvas.style.touchAction = on ? 'none' : 'pan-y';
      if (on) host.dataset.full = '1'; else delete host.dataset.full;
      setTimeout(() => { resize(); frame(); }, 60);
    },
    resetView: frame,
    dispose() {
      renderer.setAnimationLoop(null); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', sync);
      controls.dispose(); model.dispose(); discTex.dispose(); envTex.dispose(); pmrem.dispose(); renderer.dispose(); canvas.remove();
      labels.forEach(({ n }) => n.remove());
    },
  };
}
