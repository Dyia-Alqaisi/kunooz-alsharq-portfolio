import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A gold solitaire ring modelled after the shop's logo (ring + diamond on top).
// Everything is built in code — no external 3D files.

const R = 1;        // inner radius of the band
const T = 0.13;     // band thickness
const H = 0.17;     // half band width
const GIRDLE_Y = R + T + 0.3;

function bandGeometry() {
  const c = 0.05; // corner radius of the band profile
  const pts = [];
  const arc = (cx, cy, a0, a1) => {
    for (let i = 0; i <= 8; i++) {
      const a = a0 + ((a1 - a0) * i) / 8;
      pts.push(new THREE.Vector2(cx + Math.cos(a) * c, cy + Math.sin(a) * c));
    }
  };
  arc(R + c, -H + c, Math.PI, Math.PI * 1.5);          // inner bottom
  arc(R + T - c, -H + c, Math.PI * 1.5, Math.PI * 2);  // outer bottom
  arc(R + T - c, H - c, 0, Math.PI * 0.5);             // outer top
  arc(R + c, H - c, Math.PI * 0.5, Math.PI);           // inner top
  pts.push(pts[0].clone());
  const g = new THREE.LatheGeometry(pts, 256);
  g.rotateX(Math.PI / 2); // ring axis -> Z (faces the camera)
  return g;
}

function cylinderBetween(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const g = new THREE.CylinderGeometry(r, r * 0.8, dir.length(), 12);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function sparkleTexture() {
  const s = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(255,240,210,0.6)');
  g.addColorStop(1, 'rgba(255,220,160,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s / 2, 4); ctx.lineTo(s / 2, s - 4);
  ctx.moveTo(4, s / 2); ctx.lineTo(s - 4, s / 2);
  ctx.stroke();
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function dustTexture() {
  const s = 32;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,225,160,1)');
  g.addColorStop(1, 'rgba(255,225,160,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createRingScene(canvas, { reduceMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

  const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xffc77a, 3);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);

  // Materials
  const gold = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f2c36f'),
    metalness: 1,
    roughness: 0.17,
    clearcoat: 0.5,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
  });
  const diamond = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 1,
    thickness: 0.8,
    ior: 2.42,
    dispersion: 4,
    iridescence: 0.35,
    envMapIntensity: 3.5,
    specularIntensity: 1,
    flatShading: true,
  });

  // Ring
  const ring = new THREE.Group();
  ring.add(new THREE.Mesh(bandGeometry(), gold));

  // Diamond: crown + pavilion, brilliant-ish facets via low segment count + flat shading
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.31, 0.13, 16, 1), diamond);
  crown.position.y = GIRDLE_Y + 0.065;
  const pavilion = new THREE.Mesh(new THREE.ConeGeometry(0.31, 0.34, 16, 1), diamond);
  pavilion.rotation.x = Math.PI;
  pavilion.position.y = GIRDLE_Y - 0.17;
  ring.add(crown, pavilion);

  // Head: basket + 6 prongs
  const basket = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 12, 48), gold);
  basket.rotation.x = Math.PI / 2;
  basket.position.y = GIRDLE_Y - 0.16;
  ring.add(basket);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const from = new THREE.Vector3(Math.cos(a) * 0.1, R + T - 0.03, Math.sin(a) * 0.1);
    const to = new THREE.Vector3(Math.cos(a) * 0.3, GIRDLE_Y + 0.08, Math.sin(a) * 0.3);
    ring.add(cylinderBetween(from, to, 0.022, gold));
  }
  // Shoulders hugging the head
  const shoulderGeo = new THREE.TorusGeometry(0.16, 0.035, 12, 32, Math.PI);
  [-1, 1].forEach((s) => {
    const sh = new THREE.Mesh(shoulderGeo, gold);
    sh.position.set(0, R + T - 0.02, s * 0.12);
    ring.add(sh);
  });

  // Sparkles on the stone
  const sparkMat = new THREE.SpriteMaterial({ map: sparkleTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const sparkles = [
    [0.12, GIRDLE_Y + 0.12, 0.25],
    [-0.18, GIRDLE_Y + 0.02, 0.28],
    [0.05, GIRDLE_Y - 0.12, 0.3],
  ].map(([x, y, z], i) => {
    const sp = new THREE.Sprite(sparkMat.clone());
    sp.position.set(x, y, z);
    sp.userData.phase = i * 2.1;
    ring.add(sp);
    return sp;
  });

  const holder = new THREE.Group(); // scroll-driven transform
  holder.add(ring);
  scene.add(holder);

  // Gold dust
  const DUST = 380;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    dustSeed[i] = Math.random() * 10;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    map: dustTexture(), size: 0.05, transparent: true, opacity: 0.7,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  scene.add(dust);

  // Public state — animated by GSAP from main.js
  const api = {
    state: { x: 0, y: 0.45, z: 0, rx: 0.18, ry: 0, rz: 0, s: 0 },
    side: -1,          // -1 = RTL (ring goes left of text), 1 = LTR
    scroll: 0,         // 0..1 page progress
    pointer: { x: 0, y: 0 },
  };

  let layout = { xMul: 1, sMul: 1, yOff: 0, yFix: null };
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const aspect = w / h;
    // On portrait screens keep the ring nearer the centre/top and smaller
    layout = aspect < 0.8
      ? { xMul: 0.25, sMul: 0.62, yOff: 0, yFix: 1.15 }
      : aspect < 1.3
        ? { xMul: 0.6, sMul: 0.85, yOff: 0.2, yFix: null }
        : { xMul: 1, sMul: 1, yOff: 0, yFix: null };
  }
  resize();
  window.addEventListener('resize', resize);

  const target = { px: 0, py: 0 };
  window.addEventListener('pointermove', (e) => {
    api.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    api.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    const s = api.state;

    target.px += (api.pointer.x - target.px) * 0.05;
    target.py += (api.pointer.y - target.py) * 0.05;

    const idle = reduceMotion ? 0 : t * 0.35;
    const scrollSpin = api.scroll * Math.PI * 4;
    // Portrait: pin the ring to the upper area so it never covers the copy
    const y = layout.yFix !== null ? layout.yFix + s.y * 0.15 : s.y + layout.yOff;
    holder.position.set(s.x * api.side * layout.xMul, y, s.z);
    holder.rotation.set(s.rx + target.py * 0.15, target.px * 0.25, s.rz * api.side);
    holder.scale.setScalar(Math.max(s.s * layout.sMul, 0.0001));
    ring.rotation.y = s.ry + idle + scrollSpin;
    ring.position.y = reduceMotion ? 0 : Math.sin(t * 1.2) * 0.04; // gentle float

    sparkles.forEach((sp) => {
      const k = Math.max(0, Math.sin(t * 2.4 + sp.userData.phase));
      sp.scale.setScalar(0.05 + k * k * 0.32);
      sp.material.opacity = k;
    });

    const p = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      p[i * 3 + 1] += 0.0025 + Math.sin(t + dustSeed[i]) * 0.0008;
      if (p[i * 3 + 1] > 5) p[i * 3 + 1] = -5;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dust.position.y = -api.scroll * 4;
    dust.rotation.y = target.px * 0.08;

    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);

  api.ready = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return api;
}
