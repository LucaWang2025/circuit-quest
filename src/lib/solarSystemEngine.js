import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLANETS, TEX_BASE, TEX_FILES } from '../data/planets.js';

const SPIN = { mercury: 0.006, venus: -0.003, earth: 0.014, mars: 0.013, jupiter: 0.032, saturn: 0.028, uranus: -0.02, neptune: 0.021 };
const TILT = { earth: 0.41, mars: 0.44, saturn: 0.47, uranus: 1.35, neptune: 0.49 };

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,220,120,1)');
  g.addColorStop(0.2, 'rgba(255,150,50,0.6)');
  g.addColorStop(0.5, 'rgba(255,80,20,0.15)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/**
 * @param {HTMLElement} container
 * @param {{ onLoadProgress?: (done: number, total: number) => void, onPlanetChange?: (planet: object) => void }} callbacks
 */
export async function createSolarSystem(container, callbacks = {}) {
  const { onLoadProgress, onPlanetChange } = callbacks;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000008);
  scene.fog = new THREE.FogExp2(0x000008, 0.00012);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(0, 50, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000008, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 12;
  controls.maxDistance = 280;
  controls.maxPolarAngle = Math.PI * 0.49;

  const starGeo = new THREE.BufferGeometry();
  const starCount = 12000;
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 400 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
    const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.2, 0.7 + Math.random() * 0.3);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 1.8, vertexColors: true, transparent: true, opacity: 1, sizeAttenuation: true,
  }));
  scene.add(stars);

  const sunLight = new THREE.PointLight(0xfff8ee, 18, 600, 1.1);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x1a2244, 0.22));
  scene.add(new THREE.HemisphereLight(0x6699cc, 0x0a0500, 0.18));

  const texCache = Object.create(null);
  const bodies = {};
  const orbitLines = [];
  let orbitAnim = true;
  let showLabels = false;
  let focusTarget = null;
  let focusMesh = null;
  const clock = new THREE.Clock();
  let camFrom = camera.position.clone();
  let camTo = new THREE.Vector3();
  let lookFrom = controls.target.clone();
  let lookTo = new THREE.Vector3();
  let camT = 1;
  let rafId = 0;
  let disposed = false;

  function configureTex(tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function loadTex(name, timeoutMs = 8000) {
    if (texCache[name]) return Promise.resolve(texCache[name]);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (tex) => {
        if (settled) return;
        settled = true;
        if (tex) texCache[name] = configureTex(tex);
        resolve(texCache[name] || null);
      };
      const timer = setTimeout(() => finish(null), timeoutMs);
      new THREE.TextureLoader().load(
        TEX_BASE + name,
        (t) => { clearTimeout(timer); finish(t); },
        undefined,
        () => { clearTimeout(timer); finish(null); },
      );
    });
  }

  async function preloadTextures() {
    let done = 0;
    const total = TEX_FILES.length;
    onLoadProgress?.(0, total);
    await Promise.all(TEX_FILES.map(async (file) => {
      await loadTex(file);
      done += 1;
      onLoadProgress?.(done, total);
    }));
  }

  function phongPlanet(p, mapName, bumpName, bumpScale, specName) {
    const map = texCache[mapName];
    if (!map) return new THREE.MeshPhongMaterial({ color: p.color, shininess: 10 });
    const matOpts = { map, shininess: 12 };
    if (bumpName && texCache[bumpName]) {
      matOpts.bumpMap = texCache[bumpName];
      matOpts.bumpScale = bumpScale ?? 0.02;
    }
    if (specName && texCache[specName]) {
      matOpts.specularMap = texCache[specName];
      matOpts.specular = new THREE.Color(0x444444);
      matOpts.shininess = 18;
    }
    return new THREE.MeshPhongMaterial(matOpts);
  }

  function buildSolarSystem() {
    for (const p of PLANETS) {
      if (p.id === 'sun') {
        const sunTex = texCache['sunmap.jpg'];
        const sunMat = sunTex
          ? new THREE.MeshBasicMaterial({ map: sunTex })
          : new THREE.MeshBasicMaterial({ color: p.color });
        const sun = new THREE.Mesh(new THREE.SphereGeometry(p.size, 64, 64), sunMat);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeGlowTexture(), transparent: true, blending: THREE.AdditiveBlending,
          depthWrite: false, opacity: 0.85,
        }));
        glow.scale.set(p.size * 5, p.size * 5, 1);
        sun.add(glow);
        const corona = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeGlowTexture(), transparent: true, blending: THREE.AdditiveBlending,
          depthWrite: false, opacity: 0.3,
        }));
        corona.scale.set(p.size * 9, p.size * 9, 1);
        sun.add(corona);
        sun.userData.planetId = 'sun';
        scene.add(sun);
        bodies.sun = { mesh: sun, data: p, pivot: null, angle: 0 };
        continue;
      }

      const pivot = new THREE.Object3D();
      scene.add(pivot);

      let mat;
      switch (p.id) {
        case 'mercury': mat = phongPlanet(p, 'mercurymap.jpg', 'mercurybump.jpg', 0.006); break;
        case 'venus': mat = phongPlanet(p, 'venusmap.jpg', 'venusbump.jpg', 0.006); break;
        case 'earth': mat = phongPlanet(p, 'earthmap1k.jpg', 'earthbump1k.jpg', 0.05, 'earthspec1k.jpg'); break;
        case 'mars': mat = phongPlanet(p, 'marsmap1k.jpg', 'marsbump1k.jpg', 0.05); break;
        case 'jupiter': mat = phongPlanet(p, 'jupitermap.jpg', 'jupitermap.jpg', 0.02); break;
        case 'saturn': mat = phongPlanet(p, 'saturnmap.jpg', 'saturnmap.jpg', 0.03); break;
        case 'uranus': mat = phongPlanet(p, 'uranusmap.jpg', 'uranusmap.jpg', 0.02); break;
        case 'neptune': mat = phongPlanet(p, 'neptunemap.jpg', 'neptunemap.jpg', 0.02); break;
        default: mat = new THREE.MeshPhongMaterial({ color: p.color });
      }

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 64, 64), mat);
      mesh.position.x = p.dist;
      mesh.userData.planetId = p.id;
      if (TILT[p.id]) mesh.rotation.z = TILT[p.id];
      pivot.add(mesh);

      if (p.id === 'earth') {
        const cloudTex = texCache['earthcloudmap.jpg'];
        if (cloudTex) {
          const clouds = new THREE.Mesh(
            new THREE.SphereGeometry(p.size * 1.015, 64, 64),
            new THREE.MeshPhongMaterial({ map: cloudTex, transparent: true, opacity: 0.42, depthWrite: false }),
          );
          mesh.add(clouds);
        }
        const moonMap = texCache['moonmap1k.jpg'];
        const moonBump = texCache['moonbump1k.jpg'];
        const moonPivot = new THREE.Object3D();
        mesh.add(moonPivot);
        const moonMat = moonMap
          ? new THREE.MeshPhongMaterial({ map: moonMap, bumpMap: moonBump || null, bumpScale: 0.002, shininess: 5 })
          : new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
        const moon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), moonMat);
        moon.position.x = 2.2;
        moonPivot.add(moon);
        bodies.earthMoon = { pivot: moonPivot };
      }

      if (p.id === 'saturn') {
        const ringTex = texCache['saturnringcolor.jpg'];
        const ringMat = ringTex
          ? new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false })
          : new THREE.MeshBasicMaterial({ color: 0xc9b896, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
        const ring = new THREE.Mesh(new THREE.RingGeometry(p.size * 1.28, p.size * 2.18, 128), ringMat);
        ring.rotation.x = Math.PI / 2.15;
        mesh.add(ring);
      }

      const orbitCurve = new THREE.EllipseCurve(0, 0, p.dist, p.dist, 0, 2 * Math.PI);
      const orbitPts = orbitCurve.getPoints(128).map(v => new THREE.Vector3(v.x, 0, v.y));
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x4488cc, transparent: true, opacity: 0.15 }));
      scene.add(orbitLine);
      orbitLines.push(orbitLine);

      bodies[p.id] = { mesh, pivot, data: p, angle: Math.random() * Math.PI * 2, spin: SPIN[p.id] || 0 };
    }
  }

  const asteroidGeo = new THREE.BufferGeometry();
  const ac = 2500;
  const ap = new Float32Array(ac * 3);
  for (let i = 0; i < ac; i++) {
    const a = 36 + Math.random() * 6;
    const ang = Math.random() * Math.PI * 2;
    ap[i * 3] = Math.cos(ang) * a;
    ap[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    ap[i * 3 + 2] = Math.sin(ang) * a;
  }
  asteroidGeo.setAttribute('position', new THREE.BufferAttribute(ap, 3));
  scene.add(new THREE.Points(asteroidGeo, new THREE.PointsMaterial({ color: 0x887766, size: 0.15, transparent: true, opacity: 0.6 })));

  function animateCamera(pos, look) {
    camFrom.copy(camera.position);
    camTo.copy(pos);
    lookFrom.copy(controls.target);
    lookTo.copy(look);
    camT = 0;
  }

  function focusPlanet(id) {
    const b = bodies[id];
    if (!b) return;
    onPlanetChange?.(b.data);
    focusTarget = b.mesh.getWorldPosition(new THREE.Vector3());
    focusMesh = b.mesh;
    const dist = b.data.size * 6 + 8;
    const offset = new THREE.Vector3(dist * 0.6, dist * 0.35, dist);
    animateCamera(focusTarget.clone().add(offset), focusTarget);
  }

  function resetView() {
    animateCamera(new THREE.Vector3(0, 45, 95), new THREE.Vector3(0, 0, 0));
    onPlanetChange?.(PLANETS[0]);
    focusMesh = null;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    for (const hit of hits) {
      let o = hit.object;
      while (o) {
        if (o.userData?.planetId) {
          focusPlanet(o.userData.planetId);
          return;
        }
        o = o.parent;
      }
    }
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    if (disposed) return;
    rafId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    if (orbitAnim) {
      Object.values(bodies).forEach(b => {
        if (!b.pivot || !b.data?.speed) return;
        b.angle += b.data.speed * dt * 0.12;
        b.pivot.rotation.y = b.angle;
      });
      if (bodies.earthMoon) bodies.earthMoon.pivot.rotation.y += dt * 0.8;
    }

    Object.values(bodies).forEach(b => {
      if (b.mesh && b.spin) b.mesh.rotation.y += b.spin * dt;
    });

    if (bodies.sun) {
      const s = 1 + Math.sin(t * 2) * 0.03;
      bodies.sun.mesh.scale.setScalar(s);
    }

    stars.rotation.y += dt * 0.002;

    if (camT < 1) {
      camT = Math.min(1, camT + dt * 0.8);
      const ease = 1 - Math.pow(1 - camT, 3);
      camera.position.lerpVectors(camFrom, camTo, ease);
      controls.target.lerpVectors(lookFrom, lookTo, ease);
    }

    if (focusMesh) focusTarget = focusMesh.getWorldPosition(new THREE.Vector3());

    controls.update();
    renderer.render(scene, camera);
  }

  renderer.domElement.addEventListener('click', onClick);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  animate();

  await preloadTextures();
  if (disposed) return null;
  buildSolarSystem();
  resetView();
  renderer.render(scene, camera);

  return {
    focusPlanet,
    resetView,
    setOrbitAnim(v) { orbitAnim = v; },
    setShowLabels(v) {
      showLabels = v;
      orbitLines.forEach(l => { l.material.opacity = showLabels ? 0.35 : 0.15; });
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      renderer.domElement.removeEventListener('click', onClick);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
