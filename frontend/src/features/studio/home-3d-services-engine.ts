// @ts-nocheck
/* eslint-disable */
/**
 * Scroll-linked "OUR SERVICES" 3D choreography.
 *
 * Runs inside Services3DSection. Everything is imperative because the
 * surrounding homepage already uses an imperative Three.js engine; this module
 * owns its own canvas, renderer, OrbitControls and cleanup so the two scenes
 * never share WebGL state.
 */

export async function createServices3DEngine(options) {
  const { section, canvas, progressEl, onSpec } = options;
  const THREE = await import("three");
  const { OrbitControls } = await import(
    "three/addons/controls/OrbitControls.js"
  );

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const ease = (t) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceMQ.matches;
  let cancelled = false;
  let raf = 0;
  let needsRender = true;
  let smoothP = 0;
  let last = performance.now();
  let touchYaw = 0;
  let stageScale = 1;
  const ac = new AbortController();
  const signal = ac.signal;

  delete section.dataset.fallback;
  section.dataset.reduced = String(reduced);
  section.dataset.step = reduced ? "all" : "0";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (error) {
    section.dataset.fallback = "true";
    section.dataset.step = "all";
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const target = new THREE.Vector3(0, 1.05, 0);
  const tmpOffset = new THREE.Vector3();
  const yAxis = new THREE.Vector3(0, 1, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enableDamping = !reduced;
  controls.dampingFactor = 0.075;
  controls.enableZoom = false; // wheel handler returns before preventDefault
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.45;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minAzimuthAngle = -Math.PI * 0.42;
  controls.maxAzimuthAngle = Math.PI * 0.42;
  // Let the browser own vertical touch scrolling. Horizontal drags are handled
  // by the lightweight inspect gesture below, not by OrbitControls' rotate.
  controls.touches.ONE = -1;
  controls.touches.TWO = -1;
  canvas.style.touchAction = "pan-y";
  controls.addEventListener("change", () => {
    needsRender = true;
  });

  /* ---------------- lighting ---------------- */
  scene.add(new THREE.AmbientLight(0xc9dcff, 0.42));
  const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x080e19, 0.8);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.05);
  key.position.set(-6, 10, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -16;
  key.shadow.camera.right = 16;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7aa7ff, 0.65);
  rim.position.set(8, 5, -6);
  scene.add(rim);
  const follow = new THREE.PointLight(0xffa45c, 16, 28, 2);
  follow.position.set(-6, 4, 3);
  scene.add(follow);

  /* ---------------- materials / geometry ---------------- */
  const mat = {
    rubber: new THREE.MeshStandardMaterial({ color: 0x20242d, roughness: 0.78, metalness: 0.05 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc9d2dc, roughness: 0.26, metalness: 0.95 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xaeb8c4, roughness: 0.42, metalness: 0.85 }),
    navy: new THREE.MeshStandardMaterial({ color: 0x132b4a, roughness: 0.55, metalness: 0.35 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xe8712a, roughness: 0.42, metalness: 0.2 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x8fb3d9, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.78 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0b111c, roughness: 0.82, metalness: 0.18 }),
    line: new THREE.MeshBasicMaterial({ color: 0xe8712a, transparent: true, opacity: 0.35 }),
    cyan: new THREE.MeshBasicMaterial({ color: 0x7bd3ff, transparent: true, opacity: 0.65 }),
    sage: new THREE.MeshBasicMaterial({ color: 0x8fa8a3, transparent: true, opacity: 0.8 }),
  };

  const clickables = [];
  const partMeshes = [];
  const qaRings = [];
  const wheels = [];
  let qaPart;
  let scan;
  let label;
  let labelTex;
  const jaws = [];

  function tag(mesh, spec) {
    mesh.userData.spec = spec;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    clickables.push(mesh);
    return mesh;
  }

  function makeNutGeometry() {
    const shape = new THREE.Shape();
    const R = 0.55;
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3;
      const x = Math.cos(a) * R;
      const y = Math.sin(a) * R;
      if (i) shape.lineTo(x, y);
      else shape.moveTo(x, y);
    }
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.22, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 6,
    });
    geo.center();
    return geo;
  }

  function makeHousingGeometry() {
    const pts = [
      [0.18, -0.5], [0.45, -0.5], [0.45, -0.4], [0.32, -0.4],
      [0.32, -0.12], [0.285, -0.1], [0.285, -0.02], [0.32, 0],
      [0.32, 0.28], [0.37, 0.3], [0.37, 0.43], [0.34, 0.47], [0.18, 0.47],
    ].map((p) => new THREE.Vector2(p[0], p[1]));
    return new THREE.LatheGeometry(pts, 48);
  }

  function makeLabelTexture(text) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = "rgba(8,16,28,.92)";
    x.fillRect(0, 0, 512, 128);
    x.strokeStyle = "#8fa8a3";
    x.lineWidth = 4;
    x.strokeRect(6, 6, 500, 116);
    x.fillStyle = "#f6f3ee";
    x.font = '600 44px "DM Mono", monospace';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(text, 256, 66);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 34),
    new THREE.MeshStandardMaterial({ color: 0x0a1220, roughness: 0.96, metalness: 0.04 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(36, 36, 0x1c2c46, 0x132038);
  grid.position.y = 0.005;
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  grid.material.depthWrite = false;
  scene.add(grid);

  const route = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 0, -1.2),
    new THREE.Vector3(-5.5, 0, 0.2),
    new THREE.Vector3(0, 0, 1.15),
    new THREE.Vector3(5.5, 0, 0.25),
    new THREE.Vector3(10, 0, -1.15),
  ]);
  const routeMesh = new THREE.Mesh(
    new THREE.TubeGeometry(route, 96, 0.055, 8, false),
    mat.line.clone(),
  );
  routeMesh.position.y = 0.035;
  scene.add(routeMesh);

  const dashGroup = new THREE.Group();
  const dashGeo = new THREE.BoxGeometry(0.55, 0.025, 0.075);
  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    const pt = route.getPointAt(t);
    const tan = route.getTangentAt(t);
    const dash = new THREE.Mesh(dashGeo, mat.line.clone());
    dash.position.set(pt.x, 0.055, pt.z);
    dash.rotation.y = Math.atan2(-tan.z, tan.x);
    dash.material.opacity = 0.42;
    dashGroup.add(dash);
  }
  scene.add(dashGroup);

  /* ---------------- 01 customization: raw parts form ---------------- */
  const parts = new THREE.Group();
  parts.position.set(-6, 1.05, 2.4);
  scene.add(parts);

  const billet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 1.25, 32),
    mat.rubber.clone(),
  );
  billet.rotation.z = Math.PI / 2;
  billet.position.set(-1.15, 0, 0);
  parts.add(tag(billet, 0));
  partMeshes.push(billet);

  const seal = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.14, 18, 56),
    mat.rubber.clone(),
  );
  seal.rotation.x = Math.PI / 2.6;
  seal.position.set(0, 0.18, 0);
  parts.add(tag(seal, 0));
  partMeshes.push(seal);

  const nut = new THREE.Mesh(makeNutGeometry(), mat.steel.clone());
  nut.position.set(1.05, 0, 0);
  nut.rotation.set(-0.25, 0.3, 0.15);
  parts.add(tag(nut, 0));
  partMeshes.push(nut);

  const housing = new THREE.Mesh(makeHousingGeometry(), mat.alu.clone());
  housing.position.set(2.05, 0.05, 0);
  housing.scale.setScalar(0.78);
  housing.rotation.set(-0.35, 0, 0.25);
  parts.add(tag(housing, 0));
  partMeshes.push(housing);

  partMeshes.forEach((m) => {
    m.material = m.material.clone();
    m.material.transparent = true;
    m.material.opacity = 0;
  });

  /* ---------------- 02 QA: caliper rings / tolerance scan ---------------- */
  const qa = new THREE.Group();
  qa.position.set(0, 0, 2.15);
  scene.add(qa);

  qaPart = new THREE.Mesh(makeNutGeometry(), mat.steel.clone());
  qaPart.position.y = 1.05;
  qaPart.scale.setScalar(1.15);
  qaPart.material = qaPart.material.clone();
  qaPart.material.transparent = true;
  qa.add(tag(qaPart, 1));

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.0 + i * 0.18, 0.025, 8, 64),
      mat.cyan.clone(),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.65 + i * 0.42;
    ring.material = ring.material.clone();
    ring.material.transparent = true;
    qa.add(ring);
    qaRings.push(ring);
  }

  scan = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 2.7),
    new THREE.MeshBasicMaterial({
      color: 0x7bd3ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  scan.rotation.x = -Math.PI / 2;
  scan.position.y = 0.8;
  qa.add(scan);

  for (let i = 0; i < 2; i++) {
    const jaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 1.25, 0.16),
      mat.orange.clone(),
    );
    jaw.position.set(i ? 1.35 : -1.35, 1.05, 0);
    qa.add(jaw);
    jaws.push(jaw);
  }

  const tolerance = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.018, 6, 48),
    mat.sage.clone(),
  );
  tolerance.rotation.x = Math.PI / 2;
  tolerance.position.y = 1.92;
  qa.add(tolerance);

  /* ---------------- 03 delivery: container truck ---------------- */
  const truck = new THREE.Group();
  scene.add(truck);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.26, 1.8), mat.dark);
  chassis.position.y = 0.62;
  truck.add(tag(chassis, 2));

  const container = new THREE.Mesh(new THREE.BoxGeometry(4.15, 1.72, 1.86), mat.navy);
  container.position.set(-0.65, 1.62, 0);
  truck.add(tag(container, 2));

  const ribGeo = new THREE.BoxGeometry(0.055, 1.74, 1.9);
  for (let i = 0; i < 9; i++) {
    const rib = new THREE.Mesh(ribGeo, mat.steel);
    rib.position.set(-2.58 + i * 0.48, 1.62, 0);
    rib.castShadow = true;
    truck.add(rib);
  }

  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.38, 1.76), mat.orange);
  cab.position.set(2.15, 1.3, 0);
  truck.add(tag(cab, 2));

  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 1.42), mat.glass);
  glass.position.set(2.94, 1.52, 0);
  truck.add(glass);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.82), mat.dark);
  bumper.position.set(2.98, 0.72, 0);
  truck.add(bumper);

  const wheelGeo = new THREE.TorusGeometry(0.34, 0.12, 12, 28);
  const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16);
  hubGeo.rotateX(Math.PI / 2);
  [-2.15, -0.95, 1.7].forEach((x) => {
    [-0.96, 0.96].forEach((z) => {
      const wheel = new THREE.Mesh(wheelGeo, mat.dark);
      wheel.position.set(x, 0.42, z);
      wheel.castShadow = true;
      truck.add(wheel);
      wheels.push(wheel);
      const hub = new THREE.Mesh(hubGeo, mat.steel);
      hub.position.set(x, 0.42, z);
      truck.add(hub);
    });
  });

  labelTex = makeLabelTexture("QA VERIFIED");
  label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.48),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, opacity: 0 }),
  );
  label.position.set(-0.65, 1.62, 0.94);
  truck.add(tag(label, 2));

  const load = new THREE.Group();
  load.position.set(-0.65, 2.62, 0);
  truck.add(load);

  const pallet = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 1.45), mat.dark);
  pallet.castShadow = true;
  load.add(pallet);

  const loadSeal = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 14, 40), mat.rubber.clone());
  loadSeal.position.set(-0.75, 0.42, 0);
  loadSeal.rotation.x = Math.PI / 2.4;
  load.add(tag(loadSeal, 2));

  const loadNut = new THREE.Mesh(makeNutGeometry(), mat.steel.clone());
  loadNut.position.set(0, 0.42, 0);
  loadNut.scale.setScalar(0.72);
  load.add(tag(loadNut, 2));

  const loadHousing = new THREE.Mesh(makeHousingGeometry(), mat.alu.clone());
  loadHousing.position.set(0.78, 0.44, 0);
  loadHousing.scale.setScalar(0.55);
  load.add(tag(loadHousing, 2));

  const verified = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 40), mat.sage.clone());
  verified.position.set(0, 0.95, 0);
  load.add(verified);

  /* ---------------- pose / scroll choreography ---------------- */
  function applyPose(p, t, dt) {
    const truckT = clamp(0.06 + 0.88 * ease(p), 0, 1);
    const pos = route.getPointAt(truckT);
    const tan = route.getTangentAt(truckT);
    truck.position.set(pos.x, 0, pos.z);
    truck.rotation.y = Math.atan2(-tan.z, tan.x);
    follow.position.set(pos.x, 4.2, pos.z + 3.2);

    const form = ease(clamp(p / 0.28));
    parts.visible = p < 0.52;
    parts.scale.setScalar(stageScale * (0.02 + form * 0.98));
    parts.position.set(-6 + form * 1.15, 1.05 + Math.sin(t * 0.001) * 0.06, 2.4 - form * 0.42);
    parts.rotation.y = t * 0.00035;
    const partFade = form * (1 - clamp((p - 0.36) / 0.13));
    partMeshes.forEach((m) => {
      m.material.opacity = partFade;
    });

    const qaOn = clamp((p - 0.3) / 0.12) * (1 - clamp((p - 0.62) / 0.14));
    qa.visible = qaOn > 0.01;
    qa.scale.setScalar(stageScale * (0.9 + 0.1 * qaOn));
    qaPart.rotation.y = t * 0.0006;
    qaPart.material.opacity = qaOn;
    qaRings.forEach((r, i) => {
      r.rotation.z = t * 0.0008 * (i % 2 ? -1 : 1);
      r.scale.setScalar(1 + 0.1 * Math.sin(t * 0.002 + i));
      r.material.opacity = 0.18 + 0.55 * qaOn;
    });
    scan.position.y = 0.35 + 1.45 * (0.5 + 0.5 * Math.sin(t * 0.003));
    scan.material.opacity = 0.2 * qaOn;
    jaws.forEach((j, i) => {
      j.position.x = (i ? 1 : -1) * (1.35 - 0.38 * qaOn);
    });

    const deliver = ease(clamp((p - 0.55) / 0.4));
    load.visible = p > 0.5;
    // `load` is already a child of the stage-scaled truck group.
    load.scale.setScalar(0.02 + deliver * 0.98);
    load.rotation.y = t * 0.0004;
    label.material.opacity = deliver;
    routeMesh.material.opacity = 0.24 + 0.42 * deliver;
    follow.intensity = 14 + 16 * deliver;
    rim.intensity = 0.55 + 0.2 * Math.sin(t * 0.0005);
    key.position.x = -6 + Math.sin(t * 0.0002) * 1.4;
    wheels.forEach((w) => {
      w.rotation.z = -truckT * 34;
    });

    if (Math.abs(touchYaw) > 1e-5) {
      const k = reduced ? 1 : 1 - Math.exp(-dt / 90);
      const delta = touchYaw * k;
      tmpOffset.copy(camera.position).sub(target).applyAxisAngle(yAxis, delta).add(target);
      camera.position.copy(tmpOffset);
      camera.lookAt(target);
      touchYaw -= delta;
      needsRender = true;
    }
  }

  /* ---------------- resize ---------------- */
  function resize() {
    const w = Math.max(1, canvas.clientWidth || section.clientWidth);
    const h = Math.max(1, canvas.clientHeight || window.innerHeight);
    const mobile = w < 820;
    stageScale = mobile ? 0.78 : 1;
    camera.aspect = w / h;
    camera.fov = mobile ? 46 : 38;
    camera.position.set(0, mobile ? 8.2 : 6.1, mobile ? 22 : 17);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    parts.scale.setScalar(stageScale);
    qa.scale.setScalar(stageScale);
    truck.scale.setScalar(stageScale);
    routeMesh.scale.setScalar(stageScale);
    dashGroup.scale.setScalar(stageScale);
    controls.update();
    needsRender = true;
  }
  resize();
  applyPose(reduced ? 0.55 : 0, performance.now(), 16);

  const ro = new ResizeObserver(() => {
    if (!cancelled) {
      resize();
      needsRender = true;
    }
  });
  ro.observe(canvas);

  /* ---------------- click products for specs ---------------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  const isVisible = (obj) => {
    let o = obj;
    while (o) {
      if (!o.visible) return false;
      o = o.parent;
    }
    return true;
  };

  canvas.addEventListener(
    "pointerdown",
    (event) => {
      down = { x: event.clientX, y: event.clientY, t: performance.now() };
    },
    { signal },
  );
  window.addEventListener(
    "pointerup",
    (event) => {
      const start = down;
      down = null;
      if (!start || event.target !== canvas) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 9) return;
      if (performance.now() - start.t > 700) return;
      const rect = canvas.getBoundingClientRect();
      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(clickables, false).filter((hit) => isVisible(hit.object));
      if (hits.length && typeof hits[0].object.userData.spec === "number") {
        onSpec?.(hits[0].object.userData.spec);
      }
    },
    { signal },
  );
  window.addEventListener(
    "pointercancel",
    () => {
      down = null;
    },
    { signal },
  );

  /* ---------------- touch: vertical scroll, horizontal inspect ---------------- */
  let touch = null;
  canvas.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) {
        touch = null;
        return;
      }
      const t = event.touches[0];
      touch = { x: t.clientX, y: t.clientY, lastX: t.clientX, horizontal: false };
    },
    { passive: true, signal },
  );
  canvas.addEventListener(
    "touchmove",
    (event) => {
      if (!touch || event.touches.length !== 1) return;
      const t = event.touches[0];
      const dx = t.clientX - touch.lastX;
      const totalX = t.clientX - touch.x;
      const totalY = t.clientY - touch.y;
      if (Math.abs(totalX) > Math.abs(totalY) && Math.abs(totalX) > 7) {
        touch.horizontal = true;
        touchYaw += dx * 0.004;
        needsRender = true;
      }
      touch.lastX = t.clientX;
    },
    { passive: true, signal },
  );
  const endTouch = () => {
    touch = null;
  };
  canvas.addEventListener("touchend", endTouch, { passive: true, signal });
  canvas.addEventListener("touchcancel", endTouch, { passive: true, signal });

  /* ---------------- reduced motion toggle ---------------- */
  const onReduce = (event) => {
    reduced = event.matches;
    section.dataset.reduced = String(reduced);
    controls.enableDamping = !reduced;
    if (reduced) {
      section.dataset.step = "all";
      progressEl.style.transform = "scaleX(0)";
      applyPose(0.55, performance.now(), 16);
    } else {
      section.dataset.step = "0";
      smoothP = 0;
    }
    needsRender = true;
  };
  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onReduce);
  else reduceMQ.addListener(onReduce);

  const onContextLost = (event) => {
    event.preventDefault();
    section.dataset.fallback = "true";
    section.dataset.step = "all";
    cancelAnimationFrame(raf);
  };
  canvas.addEventListener("webglcontextlost", onContextLost, { signal });

  const counterEl = section.querySelector(".services3d-counter strong");

  /* ---------------- frame loop ---------------- */
  function frame(t) {
    if (cancelled) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(64, t - last);
    last = t;
    if (document.hidden) return;

    controls.update();

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const inView = rect.bottom > 0 && rect.top < vh;

    if (!reduced && !section.dataset.fallback) {
      const raw = clamp((vh - rect.top) / Math.max(1, rect.height), 0, 1);
      smoothP += (raw - smoothP) * (1 - Math.exp(-dt / 130));
      const p = smoothP;
      const step = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
      if (section.dataset.step !== String(step)) section.dataset.step = String(step);
      if (counterEl) counterEl.textContent = String(step + 1).padStart(2, "0");
      progressEl.style.transform = "scaleX(" + p.toFixed(4) + ")";
      applyPose(p, t, dt);
    } else if (reduced) {
      applyPose(0.55, t, dt);
    }

    if (!inView && !needsRender) return;
    renderer.render(scene, camera);
    needsRender = false;
  }
  raf = requestAnimationFrame(frame);

  /* ---------------- teardown ---------------- */
  return () => {
    cancelled = true;
    ac.abort();
    cancelAnimationFrame(raf);
    ro.disconnect();
    try {
      if (reduceMQ.removeEventListener) reduceMQ.removeEventListener("change", onReduce);
      else reduceMQ.removeListener(onReduce);
    } catch (_) {}
    try {
      controls.dispose();
    } catch (_) {}
    try {
      const geos = new Set();
      const mats = new Set();
      const textures = new Set();
      scene.traverse((o) => {
        if (o.geometry) geos.add(o.geometry);
        const mm = Array.isArray(o.material) ? o.material : [o.material];
        mm.forEach((m) => {
          if (!m) return;
          mats.add(m);
          if (m.map) textures.add(m.map);
        });
      });
      geos.forEach((g) => g.dispose && g.dispose());
      mats.forEach((m) => m.dispose && m.dispose());
      textures.forEach((tex) => tex.dispose && tex.dispose());
      labelTex?.dispose?.();
      renderer.dispose();
    } catch (_) {}
    section.dataset.reduced = "false";
  };
}
