"use client";

import { useEffect, useRef } from "react";
import type * as THREETypes from "three";
import type { OrbitControls as OrbitControlsType } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * three.js is ~600 KB of parser-blocking work. The stage mounts lazily, so the
 * library is imported here, at mount time, instead of with the page chunk.
 */
async function loadThree() {
  const [THREE, controls, environments] = await Promise.all([
    import("three"),
    import("three/examples/jsm/controls/OrbitControls.js"),
    import("three/examples/jsm/environments/RoomEnvironment.js"),
  ]);
  return {
    THREE,
    OrbitControls: controls.OrbitControls,
    RoomEnvironment: environments.RoomEnvironment,
  };
}

/**
 * Scroll-linked 3D choreography for "Our Services".
 *
 * One continuous Three.js stage sits inside the sticky section:
 *   01 raw billet / rubber seal / drawing outline form a machined flange,
 *   02 caliper jaws and scanning rings verify it, then
 *   03 the container truck takes the verified load and drives to dispatch.
 *
 * Progress arrives from ServiceStory through the `ar:services` window event.
 * OrbitControls is drag-only (no zoom, no pan) and never captures the wheel, so
 * the document keeps its native scroll. DPR is capped at 2 and reduced motion
 * renders a single still frame.
 */

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Smooth 0→1 ramp across a progress window. */
const ramp = (v: number, from: number, to: number) =>
  smooth(clamp((v - from) / Math.max(0.0001, to - from)));

/** Livery decal for the shipping container. */
function containerTexture(THREE: typeof THREETypes) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#eef2f5";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = "rgba(12, 24, 40, 0.06)";
  for (let x = 0; x < 1024; x += 34) ctx.fillRect(x, 0, 13, 512);
  ctx.fillStyle = "#152435";
  ctx.font = "700 84px Arial, sans-serif";
  ctx.fillText("S SQUARE", 58, 150);
  ctx.fillStyle = "#5c6b7a";
  ctx.font = "500 27px Arial, sans-serif";
  ctx.fillText("CUSTOM METAL & RUBBER", 60, 196);
  ctx.fillStyle = "#d9483b";
  ctx.fillRect(0, 372, 1024, 84);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText("DOOR DELIVERY · DHL / FEDEX · 3-4 DAYS", 58, 424);
  ctx.fillStyle = "#f0b45a";
  ctx.fillRect(0, 456, 1024, 14);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function ServiceChoreography({
  reduced,
}: {
  reduced: boolean;
}) {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    type ThreeNS = typeof THREETypes;
    type OrbitControlsInstance = InstanceType<typeof OrbitControlsType>;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
    const { THREE, OrbitControls, RoomEnvironment } = await loadThree();
    if (disposed) return;

    // Constructor aliases keep the scene code terse without a static import.
    const {
      WebGLRenderer,
      Scene,
      Fog,
      PMREMGenerator,
      PerspectiveCamera,
      AmbientLight,
      DirectionalLight,
      SpotLight,
      PointLight,
      Mesh,
      Group,
      CircleGeometry,
      RingGeometry,
      PlaneGeometry,
      BoxGeometry,
      CylinderGeometry,
      TorusGeometry,
      LineLoop,
      Line,
      BufferGeometry,
      Vector3,
      MeshStandardMaterial,
      MeshBasicMaterial,
      LineBasicMaterial,
      CanvasTexture,
      SRGBColorSpace,
      ACESFilmicToneMapping,
      PCFSoftShadowMap,
      DoubleSide,
    } = THREE;

    // Device class drives the expensive switches: DPR, shadow filtering, AA.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lightDevice =
      coarsePointer ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      Math.min(window.innerWidth, window.innerHeight) < 500;
    const dprCap = lightDevice ? 1.5 : 2;
    const shadowMapSize = lightDevice ? 512 : 1024;

    let renderer: InstanceType<ThreeNS["WebGLRenderer"]>;
    try {
      renderer = new THREE.WebGLRenderer({
        // Software-rendered framebuffers dominate cost on low-end hardware.
        antialias: !lightDevice,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      holder.dataset.state = "unavailable";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = lightDevice ? THREE.PCFShadowMap : PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x0a1324, 0);
    renderer.domElement.className = "ssq-stage-canvas";
    holder.appendChild(renderer.domElement);
    holder.dataset.state = "ready";

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a1324, 9, 27);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.06);
    scene.environment = envRT.texture;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 90);
    camera.position.set(0.5, 2.15, 8.4);

    // ── Soft dynamic light + shadows ───────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xa9c4ea, 0.42));
    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(-5.5, 9.5, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 36;
    key.shadow.camera.left = -11;
    key.shadow.camera.right = 11;
    key.shadow.camera.top = 11;
    key.shadow.camera.bottom = -11;
    key.shadow.bias = -0.0011;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x74a9ff, 1.0);
    fill.position.set(7, 4.5, -5);
    scene.add(fill);
    const rim = new THREE.SpotLight(0x8ad8ff, 22, 20, 0.7, 0.7, 1.8);
    rim.position.set(3.5, 6.4, 1.5);
    rim.target.position.set(0, 0.8, 0);
    scene.add(rim, rim.target);
    const warm = new THREE.PointLight(0xff9c6b, 12, 14, 2);
    warm.position.set(-4.2, 1.6, 3.4);
    scene.add(warm);

    // ── Platform + road ───────────────────────────────────────────────────
    const platform = new THREE.Mesh(
      new THREE.CircleGeometry(9.5, 72),
      new THREE.MeshStandardMaterial({
        color: 0x0c1727,
        roughness: 0.55,
        metalness: 0.5,
      }),
    );
    platform.rotation.x = -Math.PI / 2;
    platform.receiveShadow = true;
    scene.add(platform);
    for (const [radius, opacity] of [
      [3.4, 0.36],
      [5.9, 0.26],
      [8.6, 0.18],
    ] as const) {
      const edge = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.018, 96),
        new THREE.MeshBasicMaterial({
          color: 0x5f9fd6,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
        }),
      );
      edge.rotation.x = -Math.PI / 2;
      edge.position.y = 0.004;
      scene.add(edge);
    }

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 4.6),
      new THREE.MeshStandardMaterial({
        color: 0x16263c,
        roughness: 0.62,
        metalness: 0.3,
      }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.012, 0.5);
    road.receiveShadow = true;
    scene.add(road);

    const laneMat = new THREE.MeshBasicMaterial({ color: 0xe8b967 });
    for (let i = -5; i <= 5; i += 1) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.012, 0.07), laneMat);
      dash.position.set(i * 2.7, 0.02, 0.5);
      scene.add(dash);
    }
    const railMat = new THREE.MeshBasicMaterial({
      color: 0x3fd0e0,
      transparent: true,
      opacity: 0.55,
    });
    for (const z of [-1.7, 2.7]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(30, 0.02, 0.045), railMat);
      rail.position.set(0, 0.02, z);
      scene.add(rail);
    }

    // ── Shared materials ──────────────────────────────────────────────────
    const steel = new THREE.MeshStandardMaterial({
      color: 0xcfd8e2,
      roughness: 0.18,
      metalness: 1,
      envMapIntensity: 1.35,
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x2b3547,
      roughness: 0.42,
      metalness: 0.8,
    });
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xcf4132,
      roughness: 0.36,
      metalness: 0.34,
    });
    const redDark = new THREE.MeshStandardMaterial({
      color: 0x8f2a24,
      roughness: 0.52,
      metalness: 0.28,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: 0x2b323c,
      roughness: 0.62,
      metalness: 0.12,
      envMapIntensity: 1.1,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x8fc4e8,
      roughness: 0.08,
      metalness: 0.45,
      transparent: true,
      opacity: 0.62,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: 0xd6c39a,
      roughness: 0.3,
      metalness: 0.95,
      envMapIntensity: 1.2,
    });

    const shadowed = (group: THREETypes.Object3D) => {
      group.traverse((object) => {
        if (object instanceof Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
    };

    // ── 01 · raw material and the forming part ────────────────────────────
    // Two low plinths lift the raw stock into frame, clear of the cards.
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x18283d,
      roughness: 0.9,
      metalness: 0.2,
    });
    const plinthGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.12, 40);
    const plinthA = new THREE.Mesh(plinthGeo, plinthMat);
    plinthA.position.set(-2.7, 0.06, -0.6);
    const plinthB = new THREE.Mesh(plinthGeo, plinthMat);
    plinthB.position.set(-1.45, 0.06, -1.35);
    shadowed(plinthA);
    shadowed(plinthB);
    scene.add(plinthA, plinthB);

    const billet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.4, 56),
      brass,
    );
    billet.position.set(-2.7, 0.32, -0.6);
    scene.add(billet);


    // Rubber seal with a steel retaining band, displayed upright on a pad.
    const sealGroup = new THREE.Group();
    sealGroup.position.set(-1.45, 0.64, -1.35);
    scene.add(sealGroup);
    const seal = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.16, 22, 72), rubber);
    sealGroup.add(seal);
    const sealBand = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 12, 72), steel);
    sealBand.position.z = 0.11;
    sealGroup.add(sealBand);
    const sealBandBack = sealBand.clone();
    sealBandBack.position.z = -0.11;
    sealGroup.add(sealBandBack);
    shadowed(sealGroup);

    // Blueprint outline that draws itself over the platform.
    const outline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.05, 0, -0.85),
        new THREE.Vector3(1.05, 0, -0.85),
        new THREE.Vector3(1.05, 0, 1.1),
        new THREE.Vector3(-1.05, 0, 1.1),
      ]),
      new THREE.LineBasicMaterial({ color: 0x6f9cff, transparent: true }),
    );
    outline.position.set(0.2, 0.018, 0.5);
    scene.add(outline);

    // Machined part: upright flange with bore, bolt circle and a hub boss.
    const part = new THREE.Group();
    const partHome = new THREE.Vector3(0.25, 0.92, 0.55);
    part.position.copy(partHome);
    scene.add(part);

    const flange = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.22, 64), steel);
    disc.rotation.x = Math.PI / 2;
    flange.add(disc);
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.4, 40), steel);
    boss.rotation.x = Math.PI / 2;
    boss.position.z = 0.1;
    flange.add(boss);
    const bore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.46, 32),
      darkMetal,
    );
    bore.rotation.x = Math.PI / 2;
    bore.position.z = 0.02;
    flange.add(bore);
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const stud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.36, 14),
        steel,
      );
      stud.rotation.x = Math.PI / 2;
      stud.position.set(Math.cos(angle) * 0.53, Math.sin(angle) * 0.53, 0.02);
      flange.add(stud);
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 6), steel);
      nut.rotation.x = Math.PI / 2;
      nut.position.set(Math.cos(angle) * 0.53, Math.sin(angle) * 0.53, 0.2);
      flange.add(nut);
    }
    shadowed(flange);
    part.add(flange);
    // Machining stand under the part so it never looks like it floats.
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.28, 0.56, 28), darkMetal);
    stand.position.y = -0.72;
    stand.castShadow = true;
    stand.receiveShadow = true;
    part.add(stand);

    // ── 02 · QA calipers + scanning rings ─────────────────────────────────
    const qa = new THREE.Group();
    scene.add(qa);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8fb4ff,
      roughness: 0.25,
      metalness: 0.7,
      emissive: 0x2b5cc4,
      emissiveIntensity: 0.9,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.024, 14, 110), ringMat);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.016, 14, 110), ringMat);
    ringA.position.copy(partHome);
    ringB.position.copy(partHome);
    qa.add(ringA, ringB);

    const jawGeo = new THREE.BoxGeometry(0.07, 0.95, 0.34);
    const jawL = new THREE.Mesh(jawGeo, steel);
    const jawR = new THREE.Mesh(jawGeo, steel);
    jawL.position.set(partHome.x - 1.5, partHome.y + 0.05, partHome.z);
    jawR.position.set(partHome.x + 1.5, partHome.y + 0.05, partHome.z);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.13), steel);
    const beam2 = beam.clone();
    for (const [jaw, sign] of [
      [beam, 1],
      [beam2, -1],
    ] as const) {
      jaw.position.set(partHome.x, partHome.y + 0.52 + (sign > 0 ? 0 : -1.04), partHome.z);
    }
    qa.add(jawL, jawR, beam, beam2);

    const scanPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({
        color: 0x4bdcea,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.copy(partHome);
    qa.add(scanPlane);
    qa.traverse((object) => {
      if (object instanceof Mesh && object !== scanPlane) {
        (object as THREETypes.Mesh).castShadow = true;
      }
    });
    qa.visible = false;

    // ── Distant industrial yard (depth, no interaction) ───────────────────
    const yard = new THREE.Group();
    const yardMat = new THREE.MeshStandardMaterial({
      color: 0x14243a,
      roughness: 0.95,
      metalness: 0.1,
    });
    const yardAccent = new THREE.MeshStandardMaterial({
      color: 0x1b3350,
      roughness: 0.9,
      metalness: 0.12,
    });
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 16; i += 1) {
      const w = 1.1 + rand() * 1.7;
      const h = 0.5 + rand() * 0.9;
      const d = 1.0 + rand() * 0.9;
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        i % 3 === 0 ? yardAccent : yardMat,
      );
      block.position.set(-14 + i * 2.0, h / 2, -11.5 - rand() * 4);
      yard.add(block);
      if (rand() > 0.55) {
        const stacked = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.9, h * 0.8, d * 0.9),
          yardMat,
        );
        stacked.position.set(block.position.x, h + h * 0.4, block.position.z);
        yard.add(stacked);
      }
    }
    // Crane mast silhouettes.
    for (const [x, height] of [
      [-11, 7.5],
      [6.5, 6.2],
    ] as const) {
      const mast = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, height, 0.5),
        yardAccent,
      );
      mast.position.set(x, height / 2, -9.5);
      yard.add(mast);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.34, 0.34), yardAccent);
      arm.position.set(x + 2.2, height - 0.4, -9.5);
      yard.add(arm);
    }
    scene.add(yard);

    // Horizon glow so the backdrop never reads as flat empty sky.
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 32;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext("2d");
    if (glowCtx) {
      const gradient = glowCtx.createLinearGradient(0, 256, 0, 0);
      gradient.addColorStop(0, "rgba(78, 148, 214, 0.55)");
      gradient.addColorStop(0.35, "rgba(40, 92, 150, 0.22)");
      gradient.addColorStop(1, "rgba(10, 19, 36, 0)");
      glowCtx.fillStyle = gradient;
      glowCtx.fillRect(0, 0, 32, 256);
      const glowTex = new THREE.CanvasTexture(glowCanvas);
      glowTex.colorSpace = THREE.SRGBColorSpace;
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(46, 15),
        new THREE.MeshBasicMaterial({
          map: glowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.9,
        }),
      );
      glow.position.set(0, 5.2, -13.5);
      scene.add(glow);
    }

    // ── 03 · container truck ──────────────────────────────────────────────
    const TRUCK_SCALE = 0.6;
    const truck = new THREE.Group();

    const containerMat = new THREE.MeshStandardMaterial({
      color: 0xe6eaee,
      roughness: 0.58,
      metalness: 0.22,
    });
    const container = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.66, 1.74), containerMat);
    container.position.set(-1.15, 1.24, 0);
    truck.add(container);

    const labelTex = containerTexture(THREE);
    if (labelTex) {
      for (const z of [0.876, -0.876]) {
        const label = new THREE.Mesh(
          new THREE.PlaneGeometry(3.42, 1.5),
          new THREE.MeshBasicMaterial({
            map: labelTex,
            toneMapped: false,
            side: THREE.DoubleSide,
          }),
        );
        label.position.set(-1.15, 1.24, z);
        if (z < 0) label.rotation.y = Math.PI;
        truck.add(label);
      }
    }

    // Cab, windscreen, bumper, mirrors.
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.3, 1.62), redMat);
    cab.position.set(1.28, 0.98, 0);
    truck.add(cab);
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 1.5), redDark);
    sleeper.position.set(0.52, 1.42, 0);
    truck.add(sleeper);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.52), glassMat);
    screen.position.set(1.97, 1.14, 0.2);
    screen.rotation.y = Math.PI / 2;
    truck.add(screen);
    const sideWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.42), glassMat);
    sideWindow.position.set(1.3, 1.16, 0.815);
    truck.add(sideWindow);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 1.66), redDark);
    bumper.position.set(1.98, 0.36, 0);
    truck.add(bumper);
    const grill = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 1.1), darkMetal);
    grill.position.set(2.02, 0.78, 0);
    truck.add(grill);
    for (const z of [0.58, -0.58]) {
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.17, 0.3),
        new THREE.MeshStandardMaterial({
          color: 0xfff3d0,
          emissive: 0xffd79a,
          emissiveIntensity: 2.2,
        }),
      );
      lamp.position.set(2.03, 0.62, z);
      truck.add(lamp);
    }
    for (const z of [0.92, -0.92]) {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.1), darkMetal);
      mirror.position.set(1.78, 1.5, z);
      truck.add(mirror);
    }
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.18, 1.32), darkMetal);
    chassis.position.set(-1.0, 0.6, 0);
    truck.add(chassis);

    // Wheels: holders rotate the cylinder axis to Z, tyres spin on local Y.
    const tyres: THREETypes.Mesh[] = [];
    const tyreGeo = new THREE.CylinderGeometry(0.47, 0.47, 0.3, 30);
    const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.34, 26);
    const hubGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.4, 18);
    for (const x of [-2.35, -1.1, 1.5]) {
      for (const z of [0.82, -0.82]) {
        const holder = new THREE.Group();
        holder.position.set(x, 0.47, z);
        holder.rotation.x = Math.PI / 2;
        const tyre = new THREE.Mesh(tyreGeo, rubber);
        const rim = new THREE.Mesh(rimGeo, steel);
        const hub = new THREE.Mesh(hubGeo, darkMetal);
        holder.add(tyre, rim, hub);
        tyres.push(tyre);
        truck.add(holder);
      }
    }
    shadowed(truck);

    // Dispatch route line that lights up as the truck travels it.
    const routeMat = new THREE.MeshBasicMaterial({
      color: 0x5fe6ff,
      transparent: true,
      opacity: 0.75,
    });
    const route = new THREE.Mesh(new THREE.BoxGeometry(1, 0.014, 0.1), routeMat);
    route.position.set(0, 0.03, 0.1);
    scene.add(route);

    const truckRig = new THREE.Group();
    truck.scale.setScalar(TRUCK_SCALE);
    truckRig.add(truck);
    truckRig.position.set(12, 0, 0.5);
    scene.add(truckRig);

    // Dispatch gantry the truck rolls under.
    const gate = new THREE.Group();
    for (const [z, height] of [
      [-3.1, 4.2],
      [3.9, 4.2],
    ] as const) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, height, 0.2), darkMetal);
      post.position.set(0, height / 2, z);
      gate.add(post);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.62), darkMetal);
      foot.position.set(0, 0.06, z);
      gate.add(foot);
    }
    const gateBeam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 7.0), redMat);
    gateBeam.position.set(0, 4.2, 0.4);
    gate.add(gateBeam);
    const gateLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.12, 1.5),
      new THREE.MeshStandardMaterial({
        color: 0x9ff0ff,
        emissive: 0x5fe6ff,
        emissiveIntensity: 2.4,
      }),
    );
    gateLamp.position.set(0, 4.0, 0.4);
    gate.add(gateLamp);
    gate.position.set(-4.8, 0, 0);
    shadowed(gate);
    scene.add(gate);

    // ── Orbit controls: damped drag only, never hijacks the page scroll ──
    const controls: OrbitControlsInstance = new OrbitControls(
      camera,
      renderer.domElement,
    );
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.55;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = 0.72;
    controls.maxPolarAngle = 1.36;
    controls.minAzimuthAngle = -0.62;
    controls.maxAzimuthAngle = 0.62;
    controls.target.set(0.25, 0.5, 0.2);
    // OrbitControls registers a non-passive wheel listener that calls
    // preventDefault. Zoom is off, so that handler is a no-op for us and only
    // risks swallowing page scroll — detach it entirely.
    const wheelHandler = (
      controls as OrbitControlsInstance & {
        _onMouseWheel?: (event: WheelEvent) => void;
      }
    )._onMouseWheel;
    if (wheelHandler) {
      renderer.domElement.removeEventListener("wheel", wheelHandler);
    }
    renderer.domElement.style.touchAction = "pan-y";

    let camX = 0.4;
    let camY = 0.5;
    let camZ = 8.4;

    // 0 on wide viewports, 1 on portrait phones — used to damp horizontal
    // camera drift and pull back so nothing important leaves the frame.
    let narrow = 0;
    const resize = () => {
      const width = holder.clientWidth || 1;
      const height = holder.clientHeight || 1;
      const aspect = width / height;
      renderer.setSize(width, height, false);
      camera.aspect = aspect;
      // Portrait viewports need a wider lens and a little more distance.
      narrow = aspect < 0.9 ? 1 : 0;
      camera.fov = aspect < 0.9 ? 46 : 28;
      camera.position.z = 8.4 + narrow * 2.6;
      camZ = camera.position.z;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(holder);
    resize();

    // The stage is lazily mounted, so the user may already be part-way through
    // the section (deep link, restored scroll position) before the first
    // `ar:services` event arrives. Seed from the section's current progress.
    const section = holder.closest<HTMLElement>("#our-services");
    const seeded = Number.parseFloat(section?.dataset.serviceProgress ?? "0");
    let pendingFrame = false;
    let target = Number.isFinite(seeded) ? clamp(seeded) : 0;
    let progress = target;
    let lastApplied = -1;
    const apply = (p: number) => {
      const materialIn = ramp(p, 0, 0.1);
      const form = ramp(p, 0.05, 0.3);
      const materialOut = ramp(p, 0.3, 0.4);
      const qaIn = ramp(p, 0.3, 0.42);
      const scan = ramp(p, 0.4, 0.62);
      const load = ramp(p, 0.72, 0.86);

      // 01 · raw material enters and dissolves as the part takes shape.
      const materialScale = (0.5 + materialIn * 0.5) * (1 - materialOut);
      billet.scale.setScalar(materialScale);
      billet.position.set(
        -2.55 - (1 - materialIn) * 1.0,
        0.62 - (1 - materialIn) * 0.4,
        -1.15,
      );
      billet.rotation.y = p * 2.4;
      sealGroup.scale.setScalar(0.4 + materialScale * 0.6);
      sealGroup.position.set(
        -1.45 - (1 - materialIn) * 1.6,
        0.64 - (1 - materialIn) * 0.3,
        -1.35,
      );
      sealGroup.rotation.y = p * 0.9;
      seal.rotation.z = p * 1.7;
      billet.visible = sealGroup.visible = materialScale > 0.015;
      plinthA.visible = plinthB.visible = materialOut < 0.98;

      outline.visible = form < 0.98;
      (outline.material as THREETypes.LineBasicMaterial).opacity =
        (1 - form) * 0.9;
      outline.scale.setScalar(0.5 + form * 0.5);

      part.scale.setScalar((0.42 + form * 0.58) * 0.82);
      flange.rotation.z = p * 1.0;

      // 02 · calipers close in, the rings sweep the part.
      const qaVisible = qaIn > 0.02 && load < 0.5;
      qa.visible = qaVisible;
      if (qaVisible) {
        qa.scale.setScalar(0.4 + qaIn * 0.6);
        const jawOffset = 1.7 - scan * 0.75;
        jawL.position.x = partHome.x - jawOffset;
        jawR.position.x = partHome.x + jawOffset;
        jawL.position.z = jawR.position.z = partHome.z;
        jawL.position.y = jawR.position.y = partHome.y + 0.05;
        for (const [bar, sign] of [
          [beam, 1],
          [beam2, -1],
        ] as const) {
          bar.scale.x = jawOffset / 0.7;
          bar.position.set(
            partHome.x,
            partHome.y + sign * (0.52 + scan * 0.05),
            partHome.z,
          );
        }
        ringA.rotation.z = scan * 1.5;
        ringB.rotation.z = -scan * 1.9;
        ringA.scale.setScalar(0.84 + scan * 0.22);
        ringB.scale.setScalar(1.12 - scan * 0.22);
        ringMat.emissiveIntensity = 0.3 + Math.sin(scan * Math.PI) * 1.7;
        scanPlane.position.set(partHome.x, partHome.y - 0.95 + ((scan * 1.9) % 1.9), partHome.z);
        (scanPlane.material as THREETypes.MeshBasicMaterial).opacity =
          0.04 + 0.2 * Math.sin(scan * Math.PI);
      }

      // 03 · the truck arrives at the bay, takes the machine part, clears the
      // gate and carries it out of frame.
      // Rolls in from the left, parks under the gantry for loading, then pulls
      // away to the right on the last stretch of scroll.
      const enter = ramp(p, 0.26, 0.68);
      const depart = ramp(p, 0.9, 1);
      const truckX = -14 + enter * 13.6 + depart * 1.6;
      truckRig.position.x = truckX;
      const routeSpan = Math.max(0.001, (truckX + 6.2) * 0.5);
      route.scale.x = Math.max(0.001, Math.abs(truckX + 6.2) + 1);
      route.position.x = truckX + 6.2 - route.scale.x * 0.5;
      routeMat.opacity = 0.12 + Math.min(0.7, routeSpan * 0.3);
      const roll = Math.max(0, enter * 1.4 + depart * 1.2);
      truckRig.position.y = Math.sin(p * Math.PI * 11) * 0.006;
      truck.rotation.x = Math.sin(p * Math.PI * 11) * 0.003;
      tyres.forEach((tyre) => {
        tyre.rotation.y = -roll * 26;
      });

      if (load > 0) {
        // The verified part lifts off the stand and is stowed in the container.
        // The verified part is loaded onto the container roof, facing the camera
        // so the inspection result stays legible until it is stowed.
        const bay = new THREE.Vector3(
          truckX - 1.2 * TRUCK_SCALE,
          1.85 * TRUCK_SCALE + 0.3,
          0.5,
        );
        const hoist = Math.sin(load * Math.PI) * 0.5;
        part.position.lerpVectors(partHome, bay, load);
        part.position.y += hoist;
        part.scale.setScalar(
          (0.42 + form * 0.58) * 0.82 * (1 - ramp(load, 0.45, 1) * 0.5),
        );
        part.visible = true;
        // Settle flat on the roof: the flange lies down like real cargo.
        part.rotation.x = -load * (Math.PI / 2);
        flange.rotation.z = p * 1.0 + load * 0.6;
      } else {
        part.position.copy(partHome);
        part.rotation.x = 0;
        part.visible = true;
      }

      // Camera: gentle lateral drift shared by gaze and position, so it never
      // fights OrbitControls' damping.
      const driftX = (-0.3 + p * 1.0) * (1 - narrow * 0.55);
      const driftZ =
        8.4 + qaIn * (1.5 - narrow * 0.5) + ramp(p, 0.62, 1) * 0.55 + narrow * 2.6;
      const driftY = 0.5 + qaIn * 0.32 + ramp(p, 0.7, 1) * 0.42;
      const dx = driftX - camX;
      const dy = driftY - camY;
      const dz = driftZ - camZ;
      if (
        Math.abs(dx) > 0.0005 ||
        Math.abs(dy) > 0.0005 ||
        Math.abs(dz) > 0.0005
      ) {
        camX = driftX;
        camY = driftY;
        camZ = driftZ;
        camera.position.x += dx;
        camera.position.y += dy;
        camera.position.z += dz;
        controls.target.x += dx;
        controls.target.y += dy;
      }
      controls.update();
    };

    const onService = (event: Event) => {
      const detail = (event as CustomEvent<{ progress?: number }>).detail;
      if (typeof detail?.progress !== "number") return;
      target = clamp(detail.progress);
      // Frozen mode runs no loop, so draw the seeked frame right away.
      if (reduced) {
        progress = target;
        lastApplied = progress;
        apply(progress);
        render();
      }
    };
    window.addEventListener("ar:services", onService);

    let raf = 0;
    let alive = true;
    let onScreen = true;
    // Nothing needs drawing while the section is off screen; stopping the loop
    // there keeps the rest of the page (hero autoplay, scroll work) responsive.
    const render = () => {
      // The hero orrery is hidden here; supersampling a canvas that another
      // WebGL context is also competing for is what makes scrolling stutter.
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, onScreen ? dprCap : 1),
      );
      renderer.render(scene, camera);
    };
    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      if (document.hidden || !onScreen) return;
      // Big jumps (anchor links, deep links, fast flicks) snap; small deltas
      // ease, so the truck never lags behind the page by more than a beat.
      if (Math.abs(target - progress) > 0.3) progress = target;
      else progress += (target - progress) * 0.12;
      if (Math.abs(target - progress) < 0.0015) progress = target;
      // Idle frames are skipped once the story has settled on a value.
      if (progress === lastApplied && !pendingFrame) return;
      pendingFrame = false;
      lastApplied = progress;
      apply(progress);
      holder.dataset.progress = progress.toFixed(3);
      render();
    };

    const visibility = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        window.dispatchEvent(
          new CustomEvent("ar:stage-visible", { detail: { visible: onScreen } }),
        );
        if (onScreen) render();
      },
      { rootMargin: "120px" },
    );
    visibility.observe(holder);

    if (reduced) {
      // Frozen: one still frame, re-rendered only when dragging or when a new
      // scroll value arrives, so nothing animates on its own.
      apply(progress);
      lastApplied = progress;
      render();
      controls.addEventListener("change", render);
    } else {
      apply(progress);
      tick();
    }

    const onLost = (event: Event) => {
      event.preventDefault();
      alive = false;
      cancelAnimationFrame(raf);
      renderer.domElement.classList.add("is-lost");
      holder.dataset.state = "unavailable";
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    cleanup = () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("ar:services", onService);
      controls.removeEventListener("change", render);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      observer.disconnect();
      visibility.disconnect();
      window.dispatchEvent(
        new CustomEvent("ar:stage-visible", { detail: { visible: false } }),
      );
      controls.dispose();
      labelTex?.dispose();
      envRT.dispose();
      pmrem.dispose();
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Line) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      holder.dataset.state = "";
    };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced]);

  return (
    <div
      ref={holderRef}
      className="ssq-stage-3d"
      data-testid="service-choreography"
      aria-hidden="true"
    />
  );
}
