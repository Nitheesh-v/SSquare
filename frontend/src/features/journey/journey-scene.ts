import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { clamp, type ComponentPose } from "./journey-data";

export type RenderItem = { slot: number; type: number; pose: ComponentPose };
export type JourneyScene = ReturnType<typeof createJourneyScene>;

/** One renderer, shared geometry, one persistent traveller. All parts are illustrative. */
export function createJourneyScene(
  canvas: HTMLCanvasElement,
  lost: () => void,
  poolSize = 11,
) {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    failIfMajorPerformanceCaveat: true,
  });
  if (!context) throw new Error("WebGL unavailable");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-600, 900, 1400);
  scene.add(key);
  const edge = new THREE.DirectionalLight(0xd3e5f8, 0.7);
  edge.position.set(700, -200, 500);
  scene.add(edge);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const geometry = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g);
    return g;
  };
  const material = (color: number, metalness: number, roughness: number) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      envMapIntensity: 0.8,
      transparent: true,
    });
    materials.add(m);
    return m;
  };
  const rubber = material(0x242e28, 0, 0.69);
  const rubberEdge = material(0x435047, 0, 0.6);
  const steel = material(0xb9c7d3, 0.85, 0.3);
  const polished = material(0xe2e9ee, 0.92, 0.24);
  const aluminium = material(0xb6cdcf, 0.82, 0.32);
  const groove = material(0x4b626d, 0.7, 0.4);
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) =>
    new THREE.Mesh(geometry(g), m);
  const circle = (outer: number, inner: number, holes = false) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const h = new THREE.Path();
    h.absarc(0, 0, inner, 0, Math.PI * 2, true);
    s.holes.push(h);
    if (holes)
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const p = new THREE.Path();
        p.absarc(
          Math.cos(a) * 0.36,
          Math.sin(a) * 0.36,
          0.04,
          0,
          Math.PI * 2,
          true,
        );
        s.holes.push(p);
      }
    return s;
  };
  const extrusion = (shape: THREE.Shape, depth: number, bevel = 0.009) => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelThickness: bevel,
      bevelSize: bevel,
      curveSegments: innerWidth < 820 ? 16 : 24,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const templates: THREE.Group[] = [];
  for (let type = 0; type < 2; type++) {
    const group = new THREE.Group();
    group.add(
      mesh(
        extrusion(
          circle(0.475, type === 0 ? 0.235 : 0.2, true),
          type === 0 ? 0.075 : 0.12,
        ),
        type === 0 ? rubber : steel,
      ),
    );
    for (const z of [-1, 1]) {
      const lip = mesh(
        extrusion(
          circle(type === 0 ? 0.285 : 0.3, type === 0 ? 0.235 : 0.2),
          type === 0 ? 0.018 : 0.09,
          0.005,
        ),
        type === 0 ? rubberEdge : polished,
      );
      lip.position.z = z * (type === 0 ? 0.04 : 0.07);
      group.add(lip);
      for (const r of type === 0 ? [0.436, 0.3] : [0.442, 0.405]) {
        const ring = mesh(
          new THREE.TorusGeometry(r, 0.0035, 4, 80),
          type === 0 ? rubberEdge : polished,
        );
        ring.position.z = z * (type === 0 ? 0.045 : 0.073);
        group.add(ring);
      }
    }
    group.rotation.x = 0.16;
    group.rotation.y = -0.08;
    templates.push(group);
  }
  const profile = new THREE.Shape();
  const side = [
    [-0.24, -0.24],
    [-0.075, -0.24],
    [-0.075, -0.185],
    [-0.145, -0.185],
    [-0.145, -0.115],
    [0.145, -0.115],
    [0.145, -0.185],
    [0.075, -0.185],
    [0.075, -0.24],
    [0.24, -0.24],
  ];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < side.length; j++) {
      const [x, y] = side[j];
      const a = (i * Math.PI) / 2;
      const px = x * Math.cos(a) - y * Math.sin(a),
        py = x * Math.sin(a) + y * Math.cos(a);
      if (i === 0 && j === 0) profile.moveTo(px, py);
      else profile.lineTo(px, py);
    }
  profile.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.052, 0, Math.PI * 2, true);
  profile.holes.push(bore);
  const rail = new THREE.Group();
  const railGeometry = extrusion(profile, 0.92, 0.003);
  railGeometry.rotateX(Math.PI / 2);
  rail.add(mesh(railGeometry, aluminium));
  for (const x of [-0.18, 0.18]) {
    const rib = mesh(new THREE.BoxGeometry(0.008, 0.89, 0.005), polished);
    rib.position.set(x, 0, 0.243);
    rail.add(rib);
  }
  const hole = mesh(
    new THREE.CylinderGeometry(0.051, 0.051, 0.92, 24, 1, true),
    groove,
  );
  rail.add(hole);
  rail.rotation.set(0.23, -0.35, 0.04);
  templates.push(rail);

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(64, 64, 3, 64, 64, 64);
  grad.addColorStop(0, "rgba(25,25,40,.48)");
  grad.addColorStop(0.45, "rgba(25,25,40,.18)");
  grad.addColorStop(1, "rgba(25,25,40,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeometry = geometry(new THREE.PlaneGeometry(1.4, 1.18));
  const makeItem = () => {
    const root = new THREE.Group();
    root.rotation.order = "ZYX";
    scene.add(root);
    const ownMaterials = new Map<THREE.Material, THREE.Material>();
    const models = templates.map((template) => {
      const model = template.clone(true);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const source = child.material as THREE.Material;
          let own = ownMaterials.get(source);
          if (!own) {
            own = source.clone();
            ownMaterials.set(source, own);
            materials.add(own);
          }
          child.material = own;
        }
      });
      root.add(model);
      return model;
    });
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.3,
    });
    materials.add(shadowMaterial);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.renderOrder = -1;
    scene.add(shadow);
    return { root, models, ownMaterials, shadow };
  };
  // The contained homepage study needs no copies; the full journey retains its pool.
  const pool = Array.from({ length: poolSize }, makeItem);
  const traveller = makeItem();
  canvas.dataset.travellerId = traveller.root.uuid;
  const raycaster = new THREE.Raycaster();
  let pickable: THREE.Object3D[] = [];
  let vw = 0,
    vh = 0,
    renders = 0,
    disposed = false;
  let fence: WebGLSync | null = null;
  let lastDraw = 0;
  function resize(width: number, height: number) {
    vw = width;
    vh = height;
    renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, width < 820 ? 1.75 : 2),
    );
    renderer.setSize(width, height, false);
    const D = clamp(1500 * Math.min(width / 1440, height / 900), 1000, 2200);
    camera.fov = (2 * Math.atan(height / 2 / D) * 180) / Math.PI;
    camera.aspect = width / height;
    camera.near = 10;
    camera.far = 4 * D;
    camera.position.set(0, 0, D);
    camera.updateProjectionMatrix();
  }
  function place(
    item: ReturnType<typeof makeItem>,
    state: ComponentPose,
    type: number,
    slot: number,
  ) {
    const { root, models, ownMaterials, shadow } = item;
    root.visible =
      state.op > 0.01 && state.y + state.h > 0 && state.y - state.h < vh;
    shadow.visible = root.visible;
    if (!root.visible) return;
    root.position.set(state.x - vw / 2, vh / 2 - state.y, state.z);
    root.scale.set(state.h * state.sx, state.h * state.sy, state.h);
    root.rotation.set(
      (state.rx * Math.PI) / 180,
      (state.ry * Math.PI) / 180,
      (-state.rz * Math.PI) / 180,
      "ZYX",
    );
    models.forEach((model, i) => {
      model.visible = i === type;
      model.userData.slot = slot;
    });
    ownMaterials.forEach((m) => {
      m.opacity = state.op;
      m.depthWrite = state.op > 0.9;
    });
    pickable.push(models[type]);
    shadow.position.set(
      state.x - vw / 2,
      vh / 2 - state.y - state.h * 0.05,
      state.z - state.h * 0.32,
    );
    shadow.scale.set(
      state.h * Math.max(0.3, Math.abs(Math.cos((state.ry * Math.PI) / 180))),
      state.h,
      1,
    );
    shadow.rotation.z = (-state.rz * Math.PI) / 180;
    shadow.material.opacity = 0.5 * state.op * state.shadow;
  }
  function render(items: RenderItem[], selected: RenderItem) {
    if (disposed) return true;
    // Back-pressure prevents a slow/software GPU from queuing seconds of frames.
    // Native GPUs still get smooth motion, capped at 45fps (30 on phones).
    if (fence) {
      const status = context!.clientWaitSync(fence, 0, 0);
      if (status === context!.TIMEOUT_EXPIRED) return false;
      context!.deleteSync(fence);
      fence = null;
    }
    const now = performance.now();
    if (now - lastDraw < 1000 / (vw < 820 ? 30 : 45)) return false;
    lastDraw = now;
    pickable = [];
    pool.forEach((item, i) =>
      items[i]
        ? place(item, items[i].pose, items[i].type, items[i].slot)
        : (item.root.visible = item.shadow.visible = false),
    );
    place(traveller, selected.pose, selected.type, selected.slot);
    renderer.render(scene, camera);
    fence = context!.fenceSync(context!.SYNC_GPU_COMMANDS_COMPLETE, 0);
    context!.flush();
    canvas.dataset.renderCount = String(++renders);
    canvas.dataset.travellerX = selected.pose.x.toFixed(2);
    canvas.dataset.travellerY = selected.pose.y.toFixed(2);
    canvas.dataset.travellerHeight = selected.pose.h.toFixed(2);
    canvas.dataset.angle = selected.pose.ry.toFixed(2);
    canvas.dataset.visibleComponents = String(
      items.filter((i) => i.pose.op > 0.05).length +
        (selected.pose.op > 0.05 ? 1 : 0),
    );
    return true;
  }
  function hit(x: number, y: number) {
    raycaster.setFromCamera(
      new THREE.Vector2((x / vw) * 2 - 1, (-y / vh) * 2 + 1),
      camera,
    );
    const hits = raycaster.intersectObjects(pickable, true);
    if (!hits.length) return null;
    let node: THREE.Object3D | null = hits[0].object;
    while (node && node.userData.slot === undefined) node = node.parent;
    return (node?.userData.slot as number | undefined) ?? null;
  }
  function contextLost(e: Event) {
    e.preventDefault();
    lost();
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  return {
    resize,
    render,
    hit,
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", contextLost);
      if (fence) context!.deleteSync(fence);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      shadowTexture.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
