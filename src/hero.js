/*
 * Portfolio hero: me (a 3D style illustration, assets/me.webp) standing on a
 * little stage, with my skills floating around me as glossy 3D shapes.
 * The shapes pass in front of and behind me, and the whole stage tilts gently
 * toward the cursor. Built with Three.js, no downloaded models.
 *
 * Talks to the rest of the page through events:
 *   listens  guide:talk {on}   a soft sway while the speech bubble types / reads aloud
 *            guide:wave        a little hello hop
 *            portfolio:select  a skill was picked (here or in the list below)
 *   calls    window.Portfolio.select / preview   (app.js)
 *
 * Build: cd src && npm install && npm run build   ->  assets/hero.js
 */
import {
  AmbientLight, BufferGeometry, CanvasTexture, Float32BufferAttribute, Points, PointsMaterial, CapsuleGeometry, Clock, Color, CylinderGeometry, DirectionalLight,
  DodecahedronGeometry, Group, HemisphereLight, IcosahedronGeometry, MathUtils, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, NeutralToneMapping, OctahedronGeometry, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Raycaster, Scene, SRGBColorSpace, TextureLoader, TorusGeometry,
  TorusKnotGeometry, Vector2, Vector3, WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ME = { src: "assets/me.webp", aspect: 404 / 1477, height: 5.0 };

const SHORT = {
  agents: "AI agents", ml: "Machine learning", backend: "Backend", reliability: "Testing",
  frontend: "Frontend", speech: "Speech", finance: "Finance", algorithms: "Algorithms",
};
// one shape + colour per skill, so each reads as its own little object
const LOOK = {
  agents: { geo: () => new IcosahedronGeometry(0.3, 0), color: 0x3b4bdb },
  ml: { geo: () => new TorusKnotGeometry(0.18, 0.07, 96, 12), color: 0x8b7cf6 },
  backend: { geo: () => new RoundedBoxGeometry(0.42, 0.42, 0.42, 4, 0.08), color: 0x22a6b3 },
  reliability: { geo: () => new OctahedronGeometry(0.3, 0), color: 0x2fb67c },
  frontend: { geo: () => new TorusGeometry(0.21, 0.09, 20, 48), color: 0xf07167 },
  speech: { geo: () => new CapsuleGeometry(0.14, 0.24, 8, 20), color: 0xff9f43 },
  finance: { geo: () => new CylinderGeometry(0.24, 0.24, 0.1, 40), color: 0xf2b134 },
  algorithms: { geo: () => new DodecahedronGeometry(0.27, 0), color: 0x5ab0f0 },
};

export function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

const mat = (color, o = {}) => new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, ...o });

// a soft round shadow, drawn once on a small canvas
function softShadow(alpha) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(20,24,40,${alpha})`);
  grad.addColorStop(0.55, `rgba(20,24,40,${alpha * 0.45})`);
  grad.addColorStop(1, "rgba(20,24,40,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function mountHero({ canvas, labels, skills, projects, onReady }) {
  if (!supportsWebGL()) return null;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);

  scene.add(new HemisphereLight(0xfff4ec, 0xc7cdf2, 0.9));
  scene.add(new AmbientLight(0xffffff, 0.15));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-3, 7, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xc9d2ff, 1.4);
  rim.position.set(4, 4, -5);
  scene.add(rim);

  // everything that tilts with the cursor lives in `world`
  const world = new Group();
  scene.add(world);

  // stage: a soft round plinth with a gold ring
  const plinth = new Mesh(new CylinderGeometry(1.35, 1.42, 0.16, 72),
    new MeshPhysicalMaterial({ color: dark ? 0x2b3650 : 0xffffff, roughness: 0.35, clearcoat: 0.6 }));
  plinth.position.y = 0.08;
  world.add(plinth);
  const plinthRing = new Mesh(new TorusGeometry(1.36, 0.025, 10, 96), mat(0xf2b134, { roughness: 0.3, metalness: 0.4 }));
  plinthRing.rotation.x = Math.PI / 2; plinthRing.position.y = 0.16;
  world.add(plinthRing);
  const floorShadow = new Mesh(new PlaneGeometry(4.4, 1.6), new MeshBasicMaterial({ map: softShadow(dark ? 0.6 : 0.28), transparent: true, depthWrite: false }));
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.y = 0.002;
  world.add(floorShadow);
  const feetShadow = new Mesh(new PlaneGeometry(1.5, 0.55), new MeshBasicMaterial({ map: softShadow(dark ? 0.75 : 0.45), transparent: true, depthWrite: false }));
  feetShadow.rotation.x = -Math.PI / 2;
  feetShadow.position.set(0.05, 0.165, 0.05);
  world.add(feetShadow);

  // me: the illustration on a card that always faces the camera, feet on the plinth
  const me = new Group();
  me.position.set(0, 0.16, 0);
  world.add(me);
  const meW = ME.height * ME.aspect;
  const meGeo = new PlaneGeometry(meW, ME.height);
  meGeo.translate(0, ME.height / 2, 0);   // pivot at the feet, so hops and sways look natural
  const meMat = new MeshBasicMaterial({ transparent: true, alphaTest: 0.03, toneMapped: false, opacity: 0 });
  const meCard = new Mesh(meGeo, meMat);
  meCard.renderOrder = 1;
  me.add(meCard);
  let meReady = false;
  new TextureLoader().load(ME.src, (tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    meMat.map = tex;
    meMat.needsUpdate = true;
    meReady = true;
    if (onReady) onReady();
    kick();
  });

  // sparkles: tiny lights drifting up around me
  const SPARKS = 70;
  const sparkPos = new Float32Array(SPARKS * 3), sparkCol = new Float32Array(SPARKS * 3), sparkSpeed = new Float32Array(SPARKS);
  const palette = [new Color(0xf2b134), new Color(0x8f9bff), new Color(dark ? 0xffffff : 0xffd27a)];
  for (let i = 0; i < SPARKS; i++) {
    const a = Math.random() * Math.PI * 2, rr = 0.7 + Math.random() * 2.6;
    sparkPos.set([Math.cos(a) * rr, 0.3 + Math.random() * 5.4, Math.sin(a) * rr - 0.4], i * 3);
    const c = palette[i % 3];
    sparkCol.set([c.r, c.g, c.b], i * 3);
    sparkSpeed[i] = 0.12 + Math.random() * 0.25;
  }
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute("position", new Float32BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("color", new Float32BufferAttribute(sparkCol, 3));
  const dot = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  })();
  const sparkMat = new PointsMaterial({ size: 0.15, map: dot, vertexColors: true, transparent: true, depthWrite: false, opacity: 0.85, toneMapped: false });
  const sparks = new Points(sparkGeo, sparkMat);
  world.add(sparks);

  // a ring of light that ripples out across the stage when a skill is picked
  const pulse = new Mesh(new TorusGeometry(1.36, 0.035, 8, 96), new MeshBasicMaterial({ color: 0xf2b134, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  pulse.rotation.x = Math.PI / 2; pulse.position.y = 0.17;
  world.add(pulse);
  let pulseT = 1;

  // skills orbiting as glossy objects
  const orbit = new Group();
  orbit.position.y = 2.3;
  orbit.rotation.x = 0.16;
  world.add(orbit);
  const counts = skills.map((s) => projects.filter((p) => p.skills.includes(s.id)).length);
  const R = 2.45;
  const items = skills.map((s, i) => {
    const look = LOOK[s.id] || { geo: () => new IcosahedronGeometry(0.28, 0), color: 0x3b4bdb };
    const m = new MeshPhysicalMaterial({ color: look.color, roughness: 0.18, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15,
      emissive: look.color, emissiveIntensity: 0.05 });
    const mesh = new Mesh(look.geo(), m);
    const scale = 0.85 + counts[i] * 0.05;
    mesh.scale.setScalar(scale);
    const holder = new Group();
    const a = (i / skills.length) * Math.PI * 2;
    holder.position.set(Math.cos(a) * R, Math.sin(a * 2) * 0.55 + (i % 2 ? 0.45 : -0.3), Math.sin(a) * R);
    holder.add(mesh);
    orbit.add(holder);
    mesh.userData = { id: s.id, i, base: scale, hot: 0, spin: 0.4 + (i % 3) * 0.2, bob: i * 0.8, color: new Color(look.color) };
    return { holder, mesh };
  });

  // labels (HTML) under each object
  const labelEls = items.map(({ mesh }) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "orbit-label";
    el.textContent = SHORT[mesh.userData.id] || mesh.userData.id;
    el.tabIndex = -1;
    el.setAttribute("aria-hidden", "true");
    el.addEventListener("click", () => choose(mesh.userData.id));
    el.addEventListener("pointerenter", () => setHover(mesh.userData.id));
    el.addEventListener("pointerleave", () => setHover(null));
    labels.append(el);
    return { el, mesh, w: 0 };
  });

  /* ---- state & interaction ---- */
  const P = window.Portfolio;
  let hovered = null, active = null, talking = false, hopT = 0;
  const pointer = new Vector2(), look = new Vector2();
  let spin = 0, spinVel = 0, dragging = false, lastX = 0, moved = 0;

  function refreshLabels() {
    const f = hovered || active;
    labelEls.forEach(({ el, mesh }) => {
      el.classList.toggle("on", mesh.userData.id === active);
      el.classList.toggle("dim", !!f && mesh.userData.id !== f);
    });
  }
  function setHover(id) {
    hovered = id;
    canvas.style.cursor = id ? "pointer" : "grab";
    refreshLabels();
    if (P) P.preview(id);
  }
  function choose(id) {
    if (tapping) return;
    const next = active === id ? null : id;
    if (!P) { active = next; refreshLabels(); return; }
    if (!next || reduced) { P.select(next, "hero"); return; }
    tapTo(id, () => P.select(next, "hero"));
  }

  /* ---- her hand reaches out and taps the shape ---- */
  const HAND = `<svg viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="17" cy="41" rx="7" ry="10" transform="rotate(-28 17 41)" class="h-skin"/>
    <rect x="26" y="3" width="12" height="32" rx="6" class="h-skin"/>
    <rect x="17" y="25" width="33" height="30" rx="13" class="h-skin"/>
    <path d="M38 30 h8 M38 37 h9 M38 44 h8" class="h-line"/>
    <rect x="28" y="5" width="5" height="7" rx="2.5" class="h-nail"/>
    <rect x="21" y="52" width="25" height="10" rx="4" class="h-cuff"/>
  </svg>`;
  let tapping = false;
  const tapLayer = document.createElement("div");
  tapLayer.className = "tap-layer";
  canvas.parentElement.append(tapLayer);
  function screenOf(vec) {
    const p = vec.clone().project(camera);
    return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H };
  }
  function tapTo(id, done) {
    const it = items.find((x) => x.mesh.userData.id === id);
    if (!it) { done(); return; }
    tapping = true;
    const end = screenOf(it.mesh.getWorldPosition(new Vector3()));
    const start = screenOf(new Vector3(end.x > W / 2 ? meW * 0.32 : -meW * 0.32, ME.height * 0.79, 0.2));
    const ang = Math.atan2(end.x - start.x, start.y - end.y) * 180 / Math.PI;

    // a glowing arc from her shoulder to the shape
    const svgNS = "http://www.w3.org/2000/svg";
    const trail = document.createElementNS(svgNS, "svg");
    trail.setAttribute("class", "tap-trail");
    trail.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const cx = (start.x + end.x) / 2, cy = Math.min(start.y, end.y) - 60;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", `M${start.x} ${start.y} Q${cx} ${cy} ${end.x} ${end.y}`);
    trail.append(path);
    const hand = document.createElement("div");
    hand.className = "tap-hand";
    hand.innerHTML = HAND;
    const ripple = document.createElement("div");
    ripple.className = "tap-ripple";
    ripple.style.left = `${end.x}px`; ripple.style.top = `${end.y}px`;
    ripple.style.setProperty("--c", "#" + it.mesh.userData.color.getHexString());
    tapLayer.append(trail, hand);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.animate([{ strokeDashoffset: len, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.55 }, { strokeDashoffset: 0, opacity: 0 }],
      { duration: 1100, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    const at = (x, y, s) => `translate(${(x - 42).toFixed(1)}px, ${(y - 5).toFixed(1)}px) rotate(${ang.toFixed(1)}deg) scale(${s})`;
    const mid = path.getPointAtLength(len * 0.5);
    const anim = hand.animate([
      { transform: at(start.x, start.y, 0.4), opacity: 0 },
      { transform: at(mid.x, mid.y, 0.9), opacity: 1, offset: 0.3 },
      { transform: at(end.x, end.y + 6, 1), opacity: 1, offset: 0.55 },
      { transform: at(end.x, end.y + 12, 0.86), opacity: 1, offset: 0.68 },
      { transform: at(end.x, end.y + 6, 1), opacity: 1, offset: 0.8 },
      { transform: at(end.x, end.y + 20, 0.9), opacity: 0 },
    ].map((k) => ({ ...k, easing: "ease-in-out" })), { duration: 1100, fill: "forwards" });
    setTimeout(() => {
      tapLayer.append(ripple);
      ripple.animate([{ transform: "translate(-50%,-50%) scale(.2)", opacity: 0.9 }, { transform: "translate(-50%,-50%) scale(2.4)", opacity: 0 }],
        { duration: 700, easing: "ease-out", fill: "forwards" });
      done();
    }, 720);
    anim.onfinish = () => { trail.remove(); hand.remove(); setTimeout(() => ripple.remove(), 400); tapping = false; };
  }
  document.addEventListener("portfolio:select", (e) => {
    active = e.detail.id;
    if (!reduced) hopT = 0.6;
    if (active && !reduced) { pulse.material.color.set(LOOK[active] ? LOOK[active].color : 0xf2b134); pulseT = 0; } refreshLabels(); kick(); });
  document.addEventListener("guide:talk", (e) => { talking = !!e.detail.on; });
  document.addEventListener("guide:wave", () => { if (!reduced) hopT = 0.6; kick(); });

  const ray = new Raycaster();
  const ndc = new Vector2();
  const meshes = items.map((it) => it.mesh);
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    return hit ? hit.object.userData.id : null;
  }
  window.addEventListener("pointermove", (e) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });
  canvas.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      spinVel = dx * 0.005; spin += spinVel;
      return;
    }
    const id = pick(e);
    if (id !== hovered) setHover(id);
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    if (moved < 6) { const id = pick(e); if (id) choose(id); }
  });
  canvas.addEventListener("pointercancel", () => { dragging = false; });
  canvas.addEventListener("pointerleave", () => { if (hovered) setHover(null); });

  /* ---- layout ---- */
  let W = 1, H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const fov = MathUtils.degToRad(camera.fov);
    // me plus the orbit, with room above my head for the speech bubble
    const needH = 7.3, needW = camera.aspect < 1 ? 6.0 : 6.9;
    const tan = Math.tan(fov / 2);
    const dist = Math.max((needH / 2) / tan, (needW / 2) / (tan * camera.aspect));
    const viewH = 2 * dist * tan;
    const lookY = viewH / 2 - 0.5;   // keep the stage near the bottom edge
    camera.position.set(0, lookY + dist * 0.05, dist);
    camera.lookAt(0, lookY, 0);
    camera.updateProjectionMatrix();
    labelEls.forEach((l) => { l.w = 0; });
  }
  new ResizeObserver(() => { resize(); frame(0); }).observe(canvas);

  /* ---- animation ---- */
  const clock = new Clock();
  const v = new Vector3(), target = new Vector3();
  let raf = 0, visible = true, pageVisible = true, slow = 0, appear = reduced ? 1 : 0;

  function frame(dt) {
    const t = clock.elapsedTime;

    // fade and rise in once the picture has loaded
    if (meReady) appear = Math.min(1, appear + dt * 1.6);
    const ease = 1 - Math.pow(1 - appear, 3);
    meMat.opacity = ease;
    me.position.y = 0.16 + (1 - ease) * -0.25;

    // the stage leans a little toward the cursor
    look.lerp(pointer, 0.05);
    if (!reduced) {
      world.rotation.y = look.x * 0.12;
      world.rotation.x = look.y * 0.03;
    }

    // me: gentle breathing, a sway while talking, a hop for hello / a picked skill
    hopT = Math.max(0, hopT - dt);
    const hop = Math.sin((hopT / 0.6) * Math.PI) * 0.12;
    if (!reduced) {
      meCard.scale.y = 1 + Math.sin(t * 2) * 0.006;
      meCard.rotation.z = talking ? Math.sin(t * 3.2) * 0.012 : meCard.rotation.z * 0.92;
      me.position.y += hop + Math.sin(t * 1.4) * 0.015;
    }
    // keep the card facing the camera even as the stage leans
    me.rotation.y = -world.rotation.y;
    const focusId = hovered || active;
    if (focusId && !reduced) {
      const it = items.find((x) => x.mesh.userData.id === focusId);
      it.mesh.getWorldPosition(target);
      me.rotation.y += MathUtils.clamp(target.x * 0.03, -0.08, 0.08);
    }
    feetShadow.scale.setScalar(1 - hop * 1.6);
    feetShadow.material.opacity = 1 - hop * 3;

    // orbit
    if (!dragging) { spin += spinVel; spinVel *= 0.94; if (!reduced && !tapping && !active) spin += dt * 0.12; }
    orbit.rotation.y = spin;
    items.forEach(({ holder, mesh }) => {
      const u = mesh.userData;
      const tgt = u.id === active ? 1 : u.id === hovered ? 0.7 : 0;
      u.hot += (tgt - u.hot) * 0.12;
      if (!reduced) { mesh.rotation.x += dt * u.spin * 0.6; mesh.rotation.y += dt * u.spin; holder.position.y += Math.sin(t * 1.3 + u.bob) * 0.0015; }
      mesh.scale.setScalar(u.base * (1 + u.hot * 0.35));
      mesh.material.emissiveIntensity = 0.05 + u.hot * 0.45;
      const dim = (hovered || active) && u.id !== (hovered || active);
      mesh.material.opacity = dim ? 0.55 : 1;
      mesh.material.transparent = dim;
    });

    // sparkles drift up and wrap around; the pulse ring spreads and fades
    if (!reduced) {
      const pos = sparkGeo.attributes.position.array;
      for (let i = 0; i < SPARKS; i++) {
        pos[i * 3 + 1] += dt * sparkSpeed[i];
        pos[i * 3] += Math.sin(t * 0.8 + i) * dt * 0.05;
        if (pos[i * 3 + 1] > 5.9) pos[i * 3 + 1] = 0.25;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkMat.opacity = 0.6 + Math.sin(t * 1.7) * 0.25;
    }
    pulseT = Math.min(1, pulseT + dt * 0.9);
    pulse.scale.setScalar(1 + pulseT * 1.1);
    pulse.material.opacity = (1 - pulseT) * 0.9;
    plinthRing.material.emissive.set(0xf2b134);
    plinthRing.material.emissiveIntensity = reduced ? 0 : 0.15 + Math.sin(t * 1.5) * 0.15;

    renderer.render(scene, camera);

    // labels under their objects, kept inside the frame, hidden while behind me
    labelEls.forEach((L) => {
      L.mesh.getWorldPosition(target);
      v.copy(target);
      const depth = v.z;
      v.y -= 0.42;
      v.project(camera);
      const w2 = (L.w || (L.w = L.el.offsetWidth || 70)) / 2;
      const x = Math.min(Math.max((v.x * 0.5 + 0.5) * W, w2 + 4), W - w2 - 4);
      const y = (-v.y * 0.5 + 0.5) * H;
      L.el.style.transform = `translate(${(x - w2).toFixed(1)}px, ${y.toFixed(1)}px)`;
      L.el.style.zIndex = String(Math.round(50 + depth * 5));
      L.el.style.setProperty("--depth", MathUtils.clamp((depth + 3) / 6, 0.45, 1).toFixed(2));
      L.el.classList.toggle("behind", depth < -0.4 && Math.abs(target.x) < meW * 0.75);
    });
  }

  function loop() {
    raf = 0;
    if (!visible || !pageVisible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    frame(dt);
    if (dt > 0.034) slow++; else slow = Math.max(0, slow - 1);
    if (slow > 90 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); resize(); slow = 0; }
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && visible && pageVisible) { clock.getDelta(); raf = requestAnimationFrame(loop); } }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }, { threshold: 0.01 }).observe(canvas);
  document.addEventListener("visibilitychange", () => { pageVisible = document.visibilityState === "visible"; kick(); });

  resize();
  frame(0);
  kick();
  return { hop() { hopT = 0.6; } };
}

function boot() {
  const canvas = document.getElementById("hero3d");
  const P = window.Portfolio;
  if (!canvas || !P) return;
  const root = document.documentElement;
  const hero = mountHero({
    canvas, labels: document.getElementById("orbit-labels"), skills: P.SKILLS, projects: P.PROJECTS,
    onReady: () => root.classList.add("hero3d-ready"),
  });
  if (!hero) root.classList.add("no-hero3d");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
