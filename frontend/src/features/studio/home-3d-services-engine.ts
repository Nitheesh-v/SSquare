// @ts-nocheck
/* eslint-disable */
/**
 * Scroll-linked "OUR SERVICES" 3D choreography.
 *
 * Visual target: the supplied reference screenshots. This module owns its own
 * canvas, renderer and damped OrbitControls so the separate homepage WebGL
 * engine is never touched. Wheel zoom and touch rotation are deliberately
 * disabled in OrbitControls; a horizontal-only touch gesture inspects the
 * scene while vertical swipes remain page scrolls.
 */

export async function createServices3DEngine(options) {
  const { section, canvas, progressEl, percentEl, cardsEl, onSpec } = options;
  const THREE = await import("three");
  const { OrbitControls } = await import(
    "three/addons/controls/OrbitControls.js"
  );

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const ease = (t) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceMQ.matches;
  let cancelled = false;
  let raf = 0;
  let needsRender = true;
  let smoothP = 0;
  let last = performance.now();
  let touchYaw = 0;
  let stageScale = 1;
  let lastStep = -1;
  const ac = new AbortController();
  const signal = ac.signal;

  delete section.dataset.fallback;
  section.dataset.reduced = String(reduced);
  section.dataset.step = reduced ? "all" : "0";
  percentEl.textContent = reduced ? "55%" : "00%";
  progressEl.style.transform = reduced ? "scaleX(.55)" : "scaleX(0)";

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
  const target = new THREE.Vector3(0, 1.1, 0);
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
  controls.touches.ONE = -1;
  controls.touches.TWO = -1;
  canvas.style.touchAction = "pan-y";
  controls.addEventListener("change", () => {
    needsRender = true;
  });

  /* ---------------- lighting ---------------- */
  scene.add(new THREE.AmbientLight(0xc9dcff, 0.46));
  const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x080e19, 0.8);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
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
  follow.position.set(-6, 4.2, 3.2);
  scene.add(follow);

  /* ---------------- materials ---------------- */
  const RED = 0xe84b3b;
  const mat = {
    steel: new THREE.MeshStandardMaterial({ color: 0xc9d2dc, roughness: 0.3, metalness: 0.92 }),
    steelDark: new THREE.MeshStandardMaterial({ color: 0x7f8a98, roughness: 0.38, metalness: 0.85 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x20242d, roughness: 0.78, metalness: 0.05 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf1ede5, roughness: 0.62, metalness: 0.08 }),
    red: new THREE.MeshStandardMaterial({ color: RED, roughness: 0.48, metalness: 0.18 }),
    navy: new THREE.MeshStandardMaterial({ color: 0x172b45, roughness: 0.6, metalness: 0.3 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0b111c, roughness: 0.82, metalness: 0.18 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x8fb3d9, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.78 }),
    line: new THREE.MeshBasicMaterial({ color: 0x45c8e0, transparent: true, opacity: 0.45 }),
    cyan: new THREE.MeshBasicMaterial({ color: 0x7bd3ff, transparent: true, opacity: 0.65 }),
  };

  const clickables = [];
  function tag(mesh, spec) {
    mesh.userData.spec = spec;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    clickables.push(mesh);
    return mesh;
  }

  function makeHousingGeometry() {
    const pts = [
      [0.18, -0.5], [0.45, -0.5], [0.45, -0.4], [0.32, -0.4],
      [0.32, -0.12], [0.285, -0.1], [0.285, -0.02], [0.32, 0],
      [0.32, 0.28], [0.37, 0.3], [0.37, 0.43], [0.34, 0.47], [0.18, 0.47],
    ].map((p) => new THREE.Vector2(p[0], p[1]));
    return new THREE.LatheGeometry(pts, 48);
  }

  function makeBillet(spec) {
    const g = new THREE.Group();
    const billet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.1, 32),
      mat.steel.clone(),
    );
    billet.position.y = 0.6;
    billet.rotation.z = Math.PI / 2;
    g.add(tag(billet, spec));
    return g;
  }

  function makeWireBox() {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.2, 2.2, 2.2));
    return new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ color: 0x7bd3ff, transparent: true, opacity: 0.45 }),
    );
  }

  // Corrugated silver container with a bold red flowing graphic, inspired by
  // the supplied truck reference. It is an original texture, not the screenshot.
  function makeTruckSideTexture() {
    const c = document.createElement("canvas");
    c.width = 1536;
    c.height = 576;
    const x = c.getContext("2d");
    const base = x.createLinearGradient(0, 0, 0, c.height);
    base.addColorStop(0, "#e9ebea");
    base.addColorStop(.48, "#c9cfce");
    base.addColorStop(1, "#9ea7a6");
    x.fillStyle = base;
    x.fillRect(0, 0, c.width, c.height);

    x.fillStyle = "#bd2528";
    x.beginPath();
    x.moveTo(65, 490);
    x.bezierCurveTo(110, 337, 255, 234, 432, 258);
    x.bezierCurveTo(548, 273, 578, 385, 691, 397);
    x.bezierCurveTo(836, 412, 934, 239, 1138, 135);
    x.lineTo(1480, 20);
    x.lineTo(1480, 220);
    x.bezierCurveTo(1220, 256, 1093, 338, 931, 474);
    x.bezierCurveTo(814, 571, 689, 584, 565, 535);
    x.bezierCurveTo(430, 480, 373, 408, 264, 421);
    x.bezierCurveTo(170, 432, 118, 469, 65, 490);
    x.closePath();
    x.fill();
    x.fillStyle = "rgba(38, 45, 50, .78)";
    x.beginPath();
    x.moveTo(815, 447);
    x.bezierCurveTo(982, 276, 1115, 194, 1365, 105);
    x.lineTo(1510, 150);
    x.bezierCurveTo(1272, 228, 1094, 349, 979, 482);
    x.closePath();
    x.fill();

    // Narrow corrugations stay visible over the painted artwork.
    for (let i = 0; i < c.width; i += 28) {
      x.fillStyle = "rgba(255,255,255,.24)";
      x.fillRect(i, 0, 6, c.height);
      x.fillStyle = "rgba(24,35,40,.16)";
      x.fillRect(i + 17, 0, 4, c.height);
    }
    x.fillStyle = "rgba(23,35,39,.86)";
    x.font = '700 36px "Inter Variable", Arial, sans-serif';
    x.fillText("S SQUARE", 58, 80);
    x.fillStyle = "rgba(23,35,39,.64)";
    x.font = '500 19px "DM Mono", monospace';
    x.fillText("ENGINEERING SERVICES", 59, 111);
    x.strokeStyle = "rgba(36,45,47,.48)";
    x.lineWidth = 7;
    x.strokeRect(4, 4, c.width - 8, c.height - 8);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ---------------- ground / route ---------------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 34),
    new THREE.MeshStandardMaterial({ color: 0x252536, roughness: 0.96, metalness: 0.04 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 6),
    new THREE.MeshStandardMaterial({ color: 0x162b4a, roughness: 0.88, metalness: 0.08 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.005, 0.4);
  road.receiveShadow = true;
  scene.add(road);

  const grid = new THREE.GridHelper(36, 36, 0x22324c, 0x1a2740);
  grid.position.y = 0.012;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
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
  routeMesh.position.y = 0.04;
  scene.add(routeMesh);

  const dashGroup = new THREE.Group();
  const dashGeo = new THREE.BoxGeometry(0.55, 0.025, 0.075);
  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    const pt = route.getPointAt(t);
    const tan = route.getTangentAt(t);
    const dash = new THREE.Mesh(dashGeo, mat.line.clone());
    dash.position.set(pt.x, 0.06, pt.z);
    dash.rotation.y = Math.atan2(-tan.z, tan.x);
    dash.material.opacity = 0.42;
    dashGroup.add(dash);
  }
  scene.add(dashGroup);

  /* ---------------- 01 customization: billet + seal + machined profile ---------------- */
  const custom = new THREE.Group();
  custom.position.set(-5.4, 0, 1.7);
  scene.add(custom);

  const customBillet = makeBillet(0);
  customBillet.position.set(-0.7, 0.55, 0);
  custom.add(customBillet);

  const customHousing = new THREE.Mesh(
    makeHousingGeometry(),
    mat.steel.clone(),
  );
  customHousing.position.set(0.55, 0.9, 0);
  customHousing.scale.setScalar(0.85);
  customHousing.rotation.set(-0.35, 0, 0.2);
  custom.add(tag(customHousing, 0));

  const customSeal = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.1, 14, 40),
    mat.rubber.clone(),
  );
  customSeal.position.set(0.05, 0.28, 0.55);
  customSeal.rotation.x = Math.PI / 2.4;
  custom.add(tag(customSeal, 0));

  const wire = makeWireBox();
  wire.position.y = 1.1;
  custom.add(wire);

  const customMats = [];
  custom.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material = o.material.clone();
      o.material.transparent = true;
      customMats.push(o.material);
    }
  });

  /* ---------------- 02 QA: caliper arch + tolerance rings ---------------- */
  const qa = new THREE.Group();
  qa.position.set(0, 0, 1.7);
  scene.add(qa);

  const archTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.18, 0.22), mat.red.clone());
  archTop.position.y = 2.55;
  qa.add(archTop);
  const legGeo = new THREE.BoxGeometry(0.2, 2.5, 0.22);
  [-1.35, 1.35].forEach((x) => {
    const leg = new THREE.Mesh(legGeo, mat.navy.clone());
    leg.position.set(x, 1.28, 0);
    leg.castShadow = true;
    qa.add(leg);
  });

  const qaHousing = new THREE.Mesh(makeHousingGeometry(), mat.steel.clone());
  qaHousing.position.set(-0.5, 1.0, 0);
  qaHousing.scale.setScalar(0.85);
  qaHousing.rotation.set(-0.35, 0, 0.2);
  qa.add(tag(qaHousing, 1));

  const qaBillet = makeBillet(1);
  qaBillet.position.set(0.7, 0.02, 0.05);
  qa.add(qaBillet);

  const qaRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.95 + i * 0.16, 0.025, 8, 64),
      mat.cyan.clone(),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.05, 0.14 + i * 0.05, 0.15);
    qa.add(ring);
    qaRings.push(ring);
  }

  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 2.7),
    new THREE.MeshBasicMaterial({
      color: 0x7bd3ff,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  scan.rotation.x = -Math.PI / 2;
  scan.position.y = 0.8;
  qa.add(scan);

  const qaMats = [];
  qa.traverse((o) => {
    if ((o.isMesh || o.isLineSegments) && o.material) {
      o.material = o.material.clone();
      o.material.transparent = true;
      qaMats.push(o.material);
    }
  });

  /* ---------------- 03 delivery: articulated container truck ---------------- */
  const truck = new THREE.Group();
  scene.add(truck);

  function truckBox(size, position, material, clickable = false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    truck.add(clickable ? tag(mesh, 2) : mesh);
    return mesh;
  }

  // A low chassis, long ribbed cargo box and white cab follow the reference's
  // side-on proportions. The inspected parts are carried inside the container.
  truckBox([6.2, 0.22, 1.72], [-0.04, 0.61, 0], mat.dark, true);
  truckBox([4.65, 1.82, 1.82], [-0.76, 1.64, 0], mat.cream, true);
  const truckTex = makeTruckSideTexture();
  const sideMaterial = new THREE.MeshStandardMaterial({
    map: truckTex, roughness: 0.72, metalness: 0.16,
  });
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(4.58, 1.76), sideMaterial);
    panel.position.set(-0.76, 1.64, side * 0.917);
    if (side < 0) panel.rotation.y = Math.PI;
    truck.add(tag(panel, 2));
  });
  // Upper and lower container rails / rear framing.
  [-1, 1].forEach((side) => {
    truckBox([4.68, 0.065, 0.05], [-0.76, 2.55, side * 0.93], mat.steelDark);
    truckBox([4.68, 0.07, 0.05], [-0.76, 0.74, side * 0.93], mat.steelDark);
  });
  truckBox([0.08, 1.82, 1.86], [-3.08, 1.64, 0], mat.steelDark);

  // Cab, sleeper roof and separate dark windows make the tractor recognisable.
  truckBox([1.48, 1.47, 1.72], [2.05, 1.35, 0], mat.cream, true);
  truckBox([1.22, 0.32, 1.66], [2.0, 2.18, 0], mat.cream);
  truckBox([0.08, 0.65, 1.42], [2.80, 1.76, 0], mat.glass);
  [-1, 1].forEach((side) => {
    truckBox([0.83, 0.55, 0.035], [2.25, 1.80, side * 0.872], mat.glass);
    truckBox([0.035, 0.98, 0.035], [1.83, 1.46, side * 0.88], mat.steelDark);
    truckBox([0.36, 0.045, 0.04], [2.15, 1.36, side * 0.89], mat.dark);
    truckBox([0.28, 0.12, 0.11], [2.68, 1.78, side * 1.0], mat.dark);
    truckBox([0.65, 0.14, 0.08], [1.76, 0.72, side * 0.92], mat.steelDark);
  });
  truckBox([0.16, 0.22, 1.78], [2.86, 0.70, 0], mat.dark);
  truckBox([0.055, 0.36, 1.10], [2.82, 1.08, 0], mat.dark);
  [-0.62, 0.62].forEach((z) => {
    truckBox([0.065, 0.16, 0.28], [2.87, 0.91, z], mat.cream);
  });

  const tireGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.23, 28);
  tireGeo.rotateX(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.245, 24);
  hubGeo.rotateX(Math.PI / 2);
  const centerGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.26, 16);
  centerGeo.rotateX(Math.PI / 2);
  const lugGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const wheels = [];
  // Three rear trailer axles and two tractor axles, as in the reference.
  [-2.55, -1.95, -1.35, 1.2, 2.5].forEach((x) => {
    [-1, 1].forEach((side) => {
      const wheel = new THREE.Group();
      wheel.position.set(x, 0.40, side * 0.90);
      const tire = new THREE.Mesh(tireGeo, mat.rubber);
      tire.castShadow = true;
      wheel.add(tire);
      wheel.add(new THREE.Mesh(hubGeo, mat.steelDark));
      wheel.add(new THREE.Mesh(centerGeo, mat.steel));
      for (let i = 0; i < 6; i++) {
        const lug = new THREE.Mesh(lugGeo, mat.cream);
        const a = (i / 6) * Math.PI * 2;
        lug.position.set(Math.cos(a) * 0.15, Math.sin(a) * 0.15, side * 0.135);
        wheel.add(lug);
      }
      truck.add(wheel);
      wheels.push(wheel);
    });
  });

  /* tall dispatch gate behind the truck, as in the reference */
  const gate = new THREE.Group();
  gate.position.set(6.2, 0, -2.2);
  scene.add(gate);
  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.24, 0.26), mat.red.clone());
  gateTop.position.y = 3.5;
  gate.add(gateTop);
  const gateLegGeo = new THREE.BoxGeometry(0.24, 3.5, 0.26);
  [-1.7, 1.7].forEach((x) => {
    const leg = new THREE.Mesh(gateLegGeo, mat.navy.clone());
    leg.position.set(x, 1.75, 0);
    leg.castShadow = true;
    gate.add(leg);
  });

  /* ---------------- pose / scroll choreography ---------------- */
  function applyPose(p, t, dt) {
    const truckT = clamp(0.06 + 0.88 * ease(p), 0, 1);
    const pos = route.getPointAt(truckT);
    const tan = route.getTangentAt(truckT);
    truck.position.set(pos.x, 0, pos.z);
    truck.rotation.y = Math.atan2(-tan.z, tan.x);
    follow.position.set(pos.x, 4.2, pos.z + 3.2);

    const form = ease(clamp(p / 0.26));
    custom.visible = p < 0.5;
    custom.scale.setScalar(stageScale * (0.02 + form * 0.98));
    custom.position.set(-5.4 + form * 1.1, 0, 1.7);
    custom.rotation.y = t * 0.0003;
    const customFade = form * (1 - clamp((p - 0.36) / 0.12));
    customMats.forEach((m) => {
      m.opacity = customFade;
    });
    wire.material.opacity = 0.45 * customFade;
    customHousing.rotation.y = t * 0.0003;
    customBillet.rotation.y = t * 0.0004;

    const qaOn = clamp((p - 0.24) / 0.12) * (1 - clamp((p - 0.62) / 0.16));
    qa.visible = qaOn > 0.01;
    qa.scale.setScalar(stageScale * (0.92 + 0.08 * qaOn));
    qaMats.forEach((m, i) => {
      m.opacity = (i < 4 ? 0.95 : 0.6) * qaOn;
    });
    qaHousing.rotation.y = -t * 0.00025;
    qaRings.forEach((r, i) => {
      r.scale.setScalar(1 + 0.12 * Math.sin(t * 0.002 + i));
      r.material.opacity = 0.25 + 0.5 * qaOn;
    });
    scan.position.y = 0.3 + 1.5 * (0.5 + 0.5 * Math.sin(t * 0.003));
    scan.material.opacity = 0.2 * qaOn;

    const deliver = ease(clamp((p - 0.52) / 0.44));
    gate.visible = p > 0.52;
    gate.scale.setScalar(stageScale * (0.02 + deliver * 0.98));
    routeMesh.material.opacity = 0.25 + 0.45 * deliver;
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

  /* ---------------- mobile card centering ---------------- */
  function centerCard(step) {
    if (lastStep === step) return;
    lastStep = step;
    if (cardsEl.scrollWidth <= cardsEl.clientWidth + 8) return;
    const card = cardsEl.querySelector('[data-i="' + step + '"]');
    if (!card) return;
    const left = card.offsetLeft - (cardsEl.clientWidth - card.offsetWidth) / 2;
    cardsEl.scrollTo({ left: Math.max(0, left), behavior: reduced ? "auto" : "smooth" });
  }

  /* ---------------- resize ---------------- */
  function resize() {
    const w = Math.max(1, canvas.clientWidth || section.clientWidth);
    const h = Math.max(1, canvas.clientHeight || window.innerHeight);
    const mobile = w < 820;
    stageScale = mobile ? 0.74 : 1;
    camera.aspect = w / h;
    camera.fov = mobile ? 46 : 38;
    camera.position.set(0, mobile ? 8.2 : 6.1, mobile ? 22 : 17);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    custom.scale.setScalar(stageScale);
    qa.scale.setScalar(stageScale);
    truck.scale.setScalar(stageScale);
    gate.scale.setScalar(stageScale);
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
  window.addEventListener("pointercancel", () => { down = null; }, { signal });

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
  const endTouch = () => { touch = null; };
  canvas.addEventListener("touchend", endTouch, { passive: true, signal });
  canvas.addEventListener("touchcancel", endTouch, { passive: true, signal });

  /* ---------------- reduced motion toggle ---------------- */
  const onReduce = (event) => {
    reduced = event.matches;
    section.dataset.reduced = String(reduced);
    controls.enableDamping = !reduced;
    if (reduced) {
      section.dataset.step = "all";
      percentEl.textContent = "55%";
      progressEl.style.transform = "scaleX(.55)";
      applyPose(0.55, performance.now(), 16);
    } else {
      section.dataset.step = "0";
      smoothP = 0;
      lastStep = -1;
      percentEl.textContent = "00%";
      progressEl.style.transform = "scaleX(0)";
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
      if (section.dataset.step !== String(step)) {
        section.dataset.step = String(step);
        centerCard(step);
      }
      percentEl.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
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
      renderer.dispose();
    } catch (_) {}
    section.dataset.reduced = "false";
  };
}
