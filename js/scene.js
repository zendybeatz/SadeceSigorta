// WebGL sahneleri (Three.js). data-scene: shield | house | building | car | carshield
import * as THREE from './vendor/three.module.min.js';

const NAVY = 0x2a2f6e, ORANGE = 0xf29100, WHITE = 0xf5f5f7, DARK = 0x0b0c1d;

function makeEnv(renderer) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#8d9bff'); grd.addColorStop(.45, '#2a2f6e'); grd.addColorStop(1, '#0b0c1d');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
  const glow = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'transparent'); g.fillStyle = rg; g.fillRect(0, 0, 512, 256); };
  glow(110, 90, 90, 'rgba(255,171,46,.95)'); glow(380, 70, 70, 'rgba(255,255,255,.9)'); glow(260, 150, 120, 'rgba(120,140,255,.4)');
  const tex = new THREE.CanvasTexture(c); tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose();
  return env;
}

const mats = () => ({
  navy: new THREE.MeshPhysicalMaterial({ color: NAVY, metalness: .55, roughness: .22, clearcoat: 1, clearcoatRoughness: .15, envMapIntensity: 1.3 }),
  orange: new THREE.MeshStandardMaterial({ color: ORANGE, metalness: .35, roughness: .32, emissive: 0x7a3f00, emissiveIntensity: .45, envMapIntensity: 1.1 }),
  white: new THREE.MeshStandardMaterial({ color: WHITE, metalness: .1, roughness: .4, envMapIntensity: .9 }),
  dark: new THREE.MeshStandardMaterial({ color: DARK, metalness: .7, roughness: .25 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x4a5bd0, metalness: .9, roughness: .06, clearcoat: 1, envMapIntensity: 1.6 }),
  warm: new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffb540, emissiveIntensity: 1.2 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x14173a, metalness: .6, roughness: .45 }),
});

function shieldShape(k = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, 1.3 * k); s.bezierCurveTo(.5 * k, 1.15 * k, .95 * k, 1.1 * k, 1.1 * k, 1.1 * k); s.lineTo(1.1 * k, .2 * k);
  s.bezierCurveTo(1.1 * k, -.6 * k, .6 * k, -1.1 * k, 0, -1.45 * k); s.bezierCurveTo(-.6 * k, -1.1 * k, -1.1 * k, -.6 * k, -1.1 * k, .2 * k);
  s.lineTo(-1.1 * k, 1.1 * k); s.bezierCurveTo(-.95 * k, 1.1 * k, -.5 * k, 1.15 * k, 0, 1.3 * k);
  return s;
}
const extrude = (shape, depth, bevel = .06) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 40 }); g.center(); return g; };
const mesh = (g, m) => { const o = new THREE.Mesh(g, m); return o; };

function buildShield(M, root, anim, camera, canvas) {
  const body = mesh(extrude(shieldShape(1), .35, .09), M.navy); root.add(body);
  const rim = mesh(extrude(shieldShape(.82), .12, .03), M.orange); rim.position.z = .27; root.add(rim);
  const inner = mesh(extrude(shieldShape(.7), .08, .02), M.navy); inner.position.z = .33; root.add(inner);
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-.5, -.02, 0), new THREE.Vector3(-.14, -.42, 0), new THREE.Vector3(.55, .46, 0)]);
  const tick = mesh(new THREE.TubeGeometry(path, 24, .12, 14, false), M.white); tick.position.set(0, .05, .46); root.add(tick);
  [path.getPoint(0), path.getPoint(1)].forEach((p) => { const s = mesh(new THREE.SphereGeometry(.12, 16, 16), M.white); s.position.set(p.x, p.y + .05, .46); root.add(s); });
  // 24 şirket = 24 yörünge kartı (logo dokulu, her zaman kameraya bakar)
  const orbit = new THREE.Group(); root.add(orbit);
  const chips = [];
  const cardG = new THREE.PlaneGeometry(.76, .49);
  const mkTex = (name, src) => {
    const c = document.createElement('canvas'); c.width = 312; c.height = 200; const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const draw = (img) => {
      g.clearRect(0, 0, 312, 200); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(4, 4, 304, 192, 34); g.fill();
      g.lineWidth = 6; g.strokeStyle = '#f29100'; g.stroke();
      g.imageSmoothingQuality = 'high';
      if (img) { const k = Math.min(150 / img.width, 150 / img.height); const w = img.width * k, h = img.height * k; g.drawImage(img, 156 - w / 2, 100 - h / 2, w, h); }
      else { g.fillStyle = '#1b1e3d'; g.font = '700 34px Outfit, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const words = name.replace(' Sigorta', '').split(' '); words.forEach((w, i) => g.fillText(w, 156, 100 + (i - (words.length - 1) / 2) * 40)); }
      tex.needsUpdate = true;
    };
    draw(null);
    if (src) { const im = new Image(); im.onload = () => draw(im); im.src = src; }
    return tex;
  };
  let list = []; try { list = JSON.parse(canvas.dataset.logos || '[]'); } catch (e) { /* boş */ }
  const n = list.length || 24;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2; const [nm, src] = list[i] || ['', ''];
    const card = mesh(cardG, new THREE.MeshBasicMaterial({ map: mkTex(nm, src), transparent: true, toneMapped: false, side: THREE.DoubleSide }));
    card.position.set(Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1); orbit.add(card); chips.push(card);
  }
  const ring = mesh(new THREE.TorusGeometry(3.1, .01, 8, 160), M.orange); ring.rotation.x = Math.PI / 2; orbit.add(ring);
  orbit.rotation.x = .28;
  anim.push((t) => { orbit.rotation.y = t * .18; chips.forEach((c) => c.quaternion.copy(c.parent.quaternion).invert().multiply(camera.quaternion)); });
  return { fit: 7.2 };
}

function buildHouse(M, root, anim) {
  const g = new THREE.Group(); root.add(g);
  const walls = mesh(new THREE.BoxGeometry(2, 1.3, 1.6), M.white); walls.position.y = .65; g.add(walls);
  const sh = new THREE.Shape(); sh.moveTo(-1.3, 0); sh.lineTo(1.3, 0); sh.lineTo(0, .95); sh.closePath();
  const roofG = new THREE.ExtrudeGeometry(sh, { depth: 1.9, bevelEnabled: false }); roofG.translate(0, 0, -.95);
  const roof = mesh(roofG, M.orange); roof.position.y = 1.3; roof.rotation.y = Math.PI / 2; roof.scale.set(.92, 1, 1.05); g.add(roof);
  const door = mesh(new THREE.BoxGeometry(.4, .75, .06), M.navy); door.position.set(.35, .375, .82); g.add(door);
  [-.55, .95].forEach((x, i) => { if (i === 1) return; const w = mesh(new THREE.BoxGeometry(.42, .42, .06), M.warm); w.position.set(x, .75, .82); g.add(w); });
  const w2 = mesh(new THREE.BoxGeometry(.42, .42, .06), M.warm); w2.position.set(-.55, .75, .82); g.add(w2);
  const ch = mesh(new THREE.BoxGeometry(.28, .6, .28), M.navy); ch.position.set(.7, 1.9, -.3); g.add(ch);
  const disc = mesh(new THREE.CylinderGeometry(2.5, 2.5, .12, 72), M.ground); disc.position.y = -.06; root.add(disc);
  const waves = [0, 1, 2].map((i) => { const m = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }); const r = mesh(new THREE.RingGeometry(.97, 1, 96), m); r.rotation.x = -Math.PI / 2; r.position.y = .02; root.add(r); return r; });
  g.position.y = .1;
  anim.push((t) => {
    const k = Math.max(0, Math.sin(t * .9)) ** 6;
    g.rotation.z = Math.sin(t * 38) * .012 * k; g.position.x = Math.sin(t * 46) * .02 * k;
    waves.forEach((r, i) => { const p = ((t * .35 + i / 3) % 1); r.scale.setScalar(.6 + p * 2.2); r.material.opacity = (1 - p) * .55; });
  });
  root.position.y = -.5; return { fit: 4.8 };
}

function buildBuilding(M, root, anim) {
  const g = new THREE.Group(); root.add(g);
  const blocks = [[2.3, 1.5, 1.7, 0], [1.7, 1.3, 1.4, 1.4], [1.1, .9, 1.0, 2.5]];
  const lit = [];
  blocks.forEach(([w, h, d, y], bi) => {
    const b = mesh(new THREE.BoxGeometry(w, h, d), bi % 2 ? M.navy : M.white); b.position.y = y + h / 2; g.add(b);
    const cols = Math.max(2, Math.round(w / .55)), rows = Math.max(1, Math.round(h / .55));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      if (bi === 0 && j === 0) continue;
      const on = Math.random() > .35; const m = on ? M.warm : M.glass;
      const win = mesh(new THREE.BoxGeometry(.28, .28, .04), m); win.position.set(-w / 2 + (i + .5) * (w / cols), y + (j + .55) * (h / rows), d / 2 + .02); g.add(win); if (on) lit.push(win);
    }
  });
  const door = mesh(new THREE.BoxGeometry(.5, .75, .05), M.glass); door.position.set(-.2, .38, .87); g.add(door);
  const awn = mesh(new THREE.BoxGeometry(1.5, .08, .6), M.orange); awn.position.set(.3, .95, 1.1); awn.rotation.x = .28; g.add(awn);
  const sign = mesh(new THREE.BoxGeometry(.9, .22, .05), M.orange); sign.position.set(.3, 1.15, .88); g.add(sign);
  const disc = mesh(new THREE.CylinderGeometry(2.5, 2.5, .12, 72), M.ground); disc.position.y = -.06; root.add(disc);
  const sh = mesh(new THREE.TorusGeometry(2.2, .015, 8, 120), M.orange); sh.rotation.x = Math.PI / 2; sh.position.y = .05; root.add(sh);
  anim.push((t) => { lit.forEach((w, i) => { w.material.emissiveIntensity = 0.9 + Math.sin(t * 1.5 + i) * .35; }); sh.scale.setScalar(1 + Math.sin(t) * .03); });
  root.position.y = -1.2; return { fit: 5.8 };
}

function buildCar(M, root, anim, withShield) {
  const car = new THREE.Group(); root.add(car);
  const p = new THREE.Shape(); p.moveTo(-2, .3); p.lineTo(-2, .85); p.quadraticCurveTo(-1.9, 1, -1.3, 1.02); p.lineTo(1.1, 1.02); p.quadraticCurveTo(1.9, .98, 2.02, .8); p.lineTo(2.02, .3); p.closePath();
  const bodyG = new THREE.ExtrudeGeometry(p, { depth: 1.5, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 4 }); bodyG.translate(0, 0, -.75);
  const body = mesh(bodyG, M.orange); car.add(body);
  const c = new THREE.Shape(); c.moveTo(-1.0, 1.02); c.lineTo(-.55, 1.58); c.lineTo(.62, 1.58); c.lineTo(1.2, 1.02); c.closePath();
  const cabG = new THREE.ExtrudeGeometry(c, { depth: 1.4, bevelEnabled: false }); cabG.translate(0, 0, -.7);
  car.add(mesh(cabG, M.glass));
  const roof = mesh(new THREE.BoxGeometry(1.12, .06, 1.42), M.orange); roof.position.set(.03, 1.6, 0); car.add(roof);
  const stripe = mesh(new THREE.BoxGeometry(4.1, .05, .22), M.white); stripe.position.set(0, 1.07, 0); car.add(stripe);
  [[1.25, .36], [-1.25, .36]].forEach(([x, y]) => [-.82, .82].forEach((z) => {
    const w = mesh(new THREE.CylinderGeometry(.4, .4, .3, 32), M.dark); w.rotation.x = Math.PI / 2; w.position.set(x, y, z); car.add(w);
    const hub = mesh(new THREE.CylinderGeometry(.2, .2, .32, 20), M.white); hub.rotation.x = Math.PI / 2; hub.position.set(x, y, z); car.add(hub);
  }));
  [-.5, .5].forEach((z) => { const hl = mesh(new THREE.BoxGeometry(.06, .14, .3), M.warm); hl.position.set(2.1, .72, z); car.add(hl); const tl = mesh(new THREE.BoxGeometry(.06, .14, .3), new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff1a0f, emissiveIntensity: 1 })); tl.position.set(-2.06, .72, z); car.add(tl); });
  const disc = mesh(new THREE.CylinderGeometry(3, 3, .12, 72), M.ground); disc.position.y = -.06; root.add(disc);
  car.rotation.y = -.55; car.position.y = .05;
  const road = mesh(new THREE.TorusGeometry(3.1, .01, 8, 160), M.orange); road.rotation.x = Math.PI / 2; road.position.y = .04; root.add(road);
  if (withShield) {
    const bub = mesh(new THREE.SphereGeometry(2.9, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0x7c8cff, transparent: true, opacity: .1, roughness: .1, metalness: 0, side: THREE.DoubleSide, depthWrite: false })); bub.position.y = .9; root.add(bub);
    const wire = mesh(new THREE.IcosahedronGeometry(2.92, 2), new THREE.MeshBasicMaterial({ color: ORANGE, wireframe: true, transparent: true, opacity: .22 })); wire.position.y = .9; root.add(wire);
    const em = new THREE.Group(); em.position.y = 3.4; root.add(em);
    const s = mesh(extrude(shieldShape(.34), .12, .03), M.orange); em.add(s);
    anim.push((t) => { wire.rotation.y = t * .12; wire.rotation.x = t * .05; em.rotation.y = t * 1.2; em.position.y = 3.4 + Math.sin(t * 1.4) * .08; });
  }
  anim.push((t) => { road.scale.setScalar(1 + Math.sin(t * 1.2) * .025); });
  root.position.y = -1.0; return { fit: 7.2 };
}

export function initScene(canvas) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  const mobile = matchMedia('(max-width: 880px)').matches;
  renderer.setClearAlpha(0); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.environment = makeEnv(renderer);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, .3, 9.5);
  scene.add(new THREE.HemisphereLight(0x9aa6ff, 0x0b0c1d, .7));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(ORANGE, 40, 14); rim.position.set(-4, 1.5, -2); scene.add(rim);
  const fill = new THREE.PointLight(0x6c7bff, 25, 14); fill.position.set(4, -1, 3); scene.add(fill);

  const M = mats(); const anim = [];
  const root = new THREE.Group(); const stage = new THREE.Group(); stage.add(root); scene.add(stage);
  const kind = canvas.dataset.scene || 'shield';
  const info = kind === 'house' ? buildHouse(M, root, anim) : kind === 'building' ? buildBuilding(M, root, anim) : kind === 'car' ? buildCar(M, root, anim, false) : kind === 'carshield' ? buildCar(M, root, anim, true) : buildShield(M, root, anim, camera, canvas);

  // parçacıklar
  const N = mobile ? 260 : 700; const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const r = 4 + Math.random() * 7, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1); pos[i * 3] = r * Math.sin(b) * Math.cos(a); pos[i * 3 + 1] = r * Math.cos(b) * .7; pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a) - 2; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffc46b, size: .035, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(pts);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }; let progress = 0, sp = 0;
  addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth - .5) * 2; mouse.y = (e.clientY / innerHeight - .5) * 2; }, { passive: true });

  let W = 0, H = 0;
  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.8)); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const wide = W / H > 1.05; const fit = info.fit;
    const dist = (fit / 2) / Math.tan((camera.fov * Math.PI / 180) / 2) * (wide ? 1.15 : 1.0) / Math.min(1, wide ? 1 : camera.aspect * 1.25);
    camera.position.z = Math.max(dist, 7);
    const vh = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z, vw = vh * camera.aspect;
    const q = !!document.querySelector('.quick') && wide; stage.position.set(wide ? vw * .22 : 0, q ? -vh * .24 : wide ? 0 : vh * .24, 0); stage.scale.setScalar(q ? .68 : wide ? 1 : .8);
  }
  new ResizeObserver(resize).observe(canvas); resize();

  const clock = new THREE.Clock(); let visible = true, raf = 0;
  function frame() {
    raf = 0; const t = clock.getElapsedTime();
    mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05; sp += (progress - sp) * .08;
    anim.forEach((f) => f(t));
    stage.rotation.y = (reduced ? .3 : Math.sin(t * .4) * .3) + mouse.sx * .35 + sp * Math.PI * 1.4;
    stage.rotation.x = mouse.sy * .12 - sp * .2; root.position.y += ((Math.sin(t * 1.1) * .06) - 0) * 0;
    stage.position.y += 0; pts.rotation.y = t * .02 + sp * .6; pts.position.y = sp * 1.5;
    stage.scale.setScalar(stage.scale.x);
    camera.position.y = .3 - sp * .6;
    renderer.render(scene, camera);
    if (visible && !reduced) raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: '100px' }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible && !raf) raf = requestAnimationFrame(frame); });
  frame();
  return { setProgress: (p) => { progress = p; if (reduced && !raf) raf = requestAnimationFrame(frame); }, ready: true };
}
