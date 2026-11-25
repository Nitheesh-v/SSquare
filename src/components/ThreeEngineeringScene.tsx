import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildEngineeringAssembly } from '../three/buildEngineeringAssembly';
import type { Assembly, PartId } from '../three/buildEngineeringAssembly';
import { createStudioEnvironment } from '../three/createStudioEnvironment';

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface SceneSettings {
  /** OrbitControls auto-rotate. */
  autoRotate: boolean;
  /** Gear kinematics speed multiplier (0 … 2). */
  gearSpeed: number;
  /** Elastomer vibration amplitude (0 … 1). */
  vibration: number;
  /** Manual exploded-view override; null = scroll-driven. */
  explode: number | null;
  /** Soft dynamic shadows on/off. */
  shadows: boolean;
  /** Environment reflection intensity (0 … 2). */
  envIntensity: number;
  /** Wireframe x-ray mode. */
  xray: boolean;
  /** Bump to trigger a camera reset. */
  resetNonce: number;
}

interface Props {
  settings: SceneSettings;
  highlightPart: PartId | null;
  selectedPart: PartId | null;
  onSelectPart: (id: PartId | null) => void;
}

/* ------------------------------------------------------------------ */
/*  Scroll-driven exploded view                                        */
/* ------------------------------------------------------------------ */

const EXPLODE_STOPS: Array<[number, number]> = [
  [0.0, 0.0],
  [0.12, 0.02],
  [0.28, 0.3],
  [0.46, 0.52],
  [0.64, 0.74],
  [0.82, 0.92],
  [1.0, 1.0],
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/**
 * Maps normalized page scroll progress (0…1) to exploded-view target (0…1),
 * with eased plateaus between chapter stops.
 */
export function getScrollExplodeTarget(scrollProgress: number): number {
  const p = clamp01(scrollProgress);
  for (let i = 0; i < EXPLODE_STOPS.length - 1; i++) {
    const [p0, e0] = EXPLODE_STOPS[i];
    const [p1, e1] = EXPLODE_STOPS[i + 1];
    if (p <= p1) {
      const local = (p - p0) / (p1 - p0);
      return e0 + (e1 - e0) * smoothstep(local);
    }
  }
  return 1;
}

/* ------------------------------------------------------------------ */
/*  Callout pins (3D anchors projected to 2D screen space)             */
/* ------------------------------------------------------------------ */

const PINS: Array<{ partId: PartId; label: string; sub: string }> = [
  { partId: 'housing', label: 'FINNED HOUSING', sub: '6061-T6 · 18 CNC fins' },
  { partId: 'gear-train', label: 'GEAR TRAIN', sub: 'EN24 · 16:12 mesh' },
  { partId: 'coupler', label: 'SPIDER COUPLER', sub: 'EPDM · 6-lobe' },
  { partId: 'seals', label: 'DUAL-LIP SEALS', sub: 'Viton FKM' },
  { partId: 'bushings', label: 'BRONZE BUSHINGS', sub: 'C54400 flanged' },
  { partId: 'mounts', label: 'A/V MOUNTS', sub: 'EPDM ribbed ×4' },
];

/* ------------------------------------------------------------------ */
/*  Canvas-generated studio floor texture (zero image downloads)       */
/* ------------------------------------------------------------------ */

function createFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0e13';
  ctx.fillRect(0, 0, size, size);

  // Technical grid.
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.10)';
  ctx.lineWidth = 1;
  const step = size / 24;
  for (let i = 0; i <= 24; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(size, i * step);
    ctx.stroke();
  }

  // Radial vignette so the grid fades before the horizon.
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size * 0.52);
  grad.addColorStop(0, 'rgba(10, 14, 19, 0)');
  grad.addColorStop(1, 'rgba(7, 9, 12, 1)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

/* ================================================================== */
/*  ThreeEngineeringScene                                              */
/* ================================================================== */

export default function ThreeEngineeringScene({
  settings,
  highlightPart,
  selectedPart,
  onSelectPart,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const hoverRef = useRef<PartId | null>(null);
  const pinRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fpsRef = useRef<HTMLSpanElement | null>(null);
  const drawRef = useRef<HTMLSpanElement | null>(null);
  const trisRef = useRef<HTMLSpanElement | null>(null);

  // Latest selection/highlight values for the loop + pointer handlers.
  const selectRef = useRef(onSelectPart);
  selectRef.current = onSelectPart;
  const selectedRef = useRef(selectedPart);
  selectedRef.current = selectedPart;
  const highlightRef = useRef(highlightPart);
  highlightRef.current = highlightPart;

  const sceneApiRef = useRef<{
    applyHighlight: (id: PartId | null) => void;
    applyXray: (on: boolean) => void;
    applyEnv: (intensity: number) => void;
  } | null>(null);

  /* ---- Emissive highlight (hover + chapter + selection) ----------- */
  useEffect(() => {
    sceneApiRef.current?.applyHighlight(selectedPart ?? hoverRef.current ?? highlightPart);
  }, [selectedPart, highlightPart]);

  /* ---- X-ray + environment intensity ----------------------------- */
  useEffect(() => {
    sceneApiRef.current?.applyXray(settings.xray);
  }, [settings.xray]);
  useEffect(() => {
    sceneApiRef.current?.applyEnv(settings.envIntensity);
  }, [settings.envIntensity]);

  /* ---- Scene lifecycle -------------------------------------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* Renderer ---------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    /* Scene + camera ---------------------------------------------- */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090c);
    scene.fog = new THREE.Fog(0x07090c, 15, 36);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      120,
    );
    camera.position.set(7.2, 3.6, 7.6);

    /* Procedural studio HDR environment --------------------------- */
    const envTexture = createStudioEnvironment(renderer);
    scene.environment = envTexture;

    /* Lights ------------------------------------------------------ */
    const keyLight = new THREE.DirectionalLight(0xfff2df, 2.35);
    keyLight.position.set(6.5, 10, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;

    const hemiLight = new THREE.HemisphereLight(0x9db8c8, 0x2b2f36, 0.55);
    const rimCyan = new THREE.DirectionalLight(0x00f0ff, 1.05);
    rimCyan.position.set(-8, 3.5, -6.5);
    const fillWarm = new THREE.DirectionalLight(0xf97316, 0.5);
    fillWarm.position.set(7, 2.5, -5.5);

    scene.add(keyLight, hemiLight, rimCyan, fillWarm);

    /* Studio floor ------------------------------------------------ */
    const floorTexture = createFloorTexture();
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(22, 72),
      new THREE.MeshStandardMaterial({
        map: floorTexture,
        color: 0x323c47,
        metalness: 0.12,
        roughness: 0.92,
        envMapIntensity: 0.35,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.32;
    floor.receiveShadow = true;
    scene.add(floor);

    const padRing = new THREE.Mesh(
      new THREE.RingGeometry(3.5, 3.62, 96),
      new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.35,
      }),
    );
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.y = -2.305;
    scene.add(padRing);

    /* Procedural SSQ-9400 assembly -------------------------------- */
    const assembly: Assembly = buildEngineeringAssembly();
    scene.add(assembly.root);

    /* Telemetry particles — 96 instances, 1 draw call -------------- */
    const PARTICLE_COUNT = 96;
    const particleGeo = new THREE.SphereGeometry(0.022, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_COUNT);
    particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(particles);

    const particleSeeds: Array<{ base: THREE.Vector3; phase: number; speed: number }> = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 6.2;
      particleSeeds.push({
        base: new THREE.Vector3(
          Math.cos(angle) * radius,
          -1.9 + Math.random() * 7.5,
          Math.sin(angle) * radius,
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.3,
      });
    }
    const particleMatrix = new THREE.Matrix4();

    /* OrbitControls (inertia damping + multi-touch) ---------------- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.55, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 4.5;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.autoRotateSpeed = 0.55;
    controls.update();
    controls.saveState();

    /* Raycasting --------------------------------------------------- */
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);

    const readPointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickPart = (): PartId | null => {
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(assembly.root.children, true);
      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          const pid = obj.userData.partId as PartId | undefined;
          if (pid) return pid;
          obj = obj.parent;
        }
      }
      return null;
    };

    const applyHighlight = (id: PartId | null) => {
      for (const key of Object.keys(assembly.partGroups) as PartId[]) {
        const on = key === id;
        for (const group of assembly.partGroups[key]) {
          group.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (!mesh.isMesh) return;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const m of mats) {
              const std = m as THREE.MeshStandardMaterial;
              if (!std.emissive) continue;
              if (on) {
                const glow = std.userData.glow as THREE.Color | undefined;
                std.emissive.copy(glow ?? new THREE.Color(0x00f0ff));
                std.emissiveIntensity = 0.55;
              } else {
                std.emissiveIntensity = (std.userData.restEmissive as number) ?? 0;
              }
            }
          });
        }
      }
    };
    sceneApiRef.current = {
      applyHighlight,
      applyXray: (on) => {
        assembly.root.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) (m as THREE.MeshStandardMaterial).wireframe = on;
        });
      },
      applyEnv: (intensity) => {
        assembly.root.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            const std = m as THREE.MeshStandardMaterial;
            if (std.userData.baseEnv === undefined) {
              std.userData.baseEnv = std.envMapIntensity;
            }
            std.envMapIntensity = (std.userData.baseEnv as number) * intensity;
          }
        });
      },
    };

    const onPointerMove = (e: PointerEvent) => {
      readPointer(e);
      const part = pickPart();
      if (part !== hoverRef.current) {
        hoverRef.current = part;
        renderer.domElement.style.cursor = part ? 'pointer' : 'grab';
        applyHighlight(selectedRef.current ?? part ?? highlightRef.current);
      }
    };

    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > 6) return; // it was an orbit drag, not a click
      readPointer(e);
      const part = pickPart();
      selectRef.current(part);
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    /* Scroll-driven explode + camera sweep -------------------------- */
    const experienceEl = document.getElementById('experience');
    let lastScrollY = window.scrollY;
    let sweepVel = 0;

    /* Animation loop ----------------------------------------------- */
    const clock = new THREE.Clock();
    let currentExplode = 0;
    let lastResetNonce = settingsRef.current.resetNonce;

    // Adaptive resolution bookkeeping.
    let frameAccum = 0;
    let frameCount = 0;
    let fpsAccum = 0;
    let fpsFrames = 0;
    let statsTimer = 0;
    const maxPixelRatio = Math.min(window.devicePixelRatio, 2);

    const yAxis = new THREE.Vector3(0, 1, 0);
    const tempVec3 = new THREE.Vector3();

    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const s = settingsRef.current;

      /* Scroll progress → explode target */
      let explodeTarget: number;
      if (s.explode !== null) {
        explodeTarget = s.explode;
      } else if (experienceEl) {
        const rect = experienceEl.getBoundingClientRect();
        const total = experienceEl.offsetHeight - window.innerHeight;
        const progress = total > 0 ? clamp01(-rect.top / total) : 0;
        explodeTarget = getScrollExplodeTarget(progress);
      } else {
        explodeTarget = 0;
      }

      // Delta-time damped interpolation toward the target.
      currentExplode += (explodeTarget - currentExplode) * Math.min(1, dt * 3.4);
      assembly.setExplode(currentExplode);

      /* Scroll velocity → gentle spherical azimuth sweep */
      const scrollY = window.scrollY;
      sweepVel += (scrollY - lastScrollY) * 0.00115;
      lastScrollY = scrollY;
      const applied = sweepVel * Math.min(1, dt * 7.5);
      sweepVel -= applied;
      if (Math.abs(applied) > 1e-6) {
        camera.position.sub(controls.target).applyAxisAngle(yAxis, applied).add(controls.target);
      }

      /* Reset view */
      if (s.resetNonce !== lastResetNonce) {
        lastResetNonce = s.resetNonce;
        sweepVel = 0;
        controls.reset();
      }

      /* Mechanical kinematics */
      assembly.tick(t, dt, {
        gearSpeed: s.gearSpeed,
        vibration: s.vibration,
      });

      /* Telemetry particles (single draw call) */
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed = particleSeeds[i];
        const y = ((seed.base.y + t * seed.speed + 2.2) % 9.6) - 2.2;
        tempVec3.set(
          seed.base.x + Math.sin(t * 0.5 + seed.phase) * 0.35,
          y,
          seed.base.z + Math.cos(t * 0.42 + seed.phase) * 0.35,
        );
        particleMatrix.makeTranslation(tempVec3.x, tempVec3.y, tempVec3.z);
        particles.setMatrixAt(i, particleMatrix);
      }
      particles.instanceMatrix.needsUpdate = true;

      /* Scene options */
      controls.autoRotate = s.autoRotate;
      keyLight.castShadow = s.shadows;

      /* Camera + render */
      controls.update();
      renderer.render(scene, camera);

      /* Project the 6 callout pins → 2D screen space (no React renders) */
      const width = container.clientWidth;
      const height = container.clientHeight;
      for (let i = 0; i < assembly.pinAnchors.length; i++) {
        const el = pinRefs.current[i];
        if (!el) continue;
        assembly.pinAnchors[i].getWorldPosition(tempVec3);
        tempVec3.project(camera);
        const visible =
          tempVec3.z < 1 && Math.abs(tempVec3.x) < 1.12 && Math.abs(tempVec3.y) < 1.12;
        const x = (tempVec3.x * 0.5 + 0.5) * width;
        const y = (-tempVec3.y * 0.5 + 0.5) * height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = visible ? '1' : '0';
      }

      /* Adaptive resolution + stats HUD */
      frameAccum += dt;
      frameCount++;
      if (frameCount >= 40) {
        const avg = frameAccum / frameCount;
        const current = renderer.getPixelRatio();
        if (avg > 0.022 && current > 1) {
          renderer.setPixelRatio(Math.max(1, current - 0.25));
          renderer.setSize(container.clientWidth, container.clientHeight);
        } else if (avg < 0.012 && current < maxPixelRatio) {
          renderer.setPixelRatio(Math.min(maxPixelRatio, current + 0.1));
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
        frameAccum = 0;
        frameCount = 0;
      }

      fpsAccum += dt;
      fpsFrames++;
      statsTimer += dt;
      if (statsTimer >= 0.5) {
        if (fpsRef.current) {
          fpsRef.current.textContent = String(Math.round(fpsFrames / fpsAccum));
        }
        if (drawRef.current) {
          drawRef.current.textContent = String(renderer.info.render.calls);
        }
        if (trisRef.current) {
          const tris = renderer.info.render.triangles;
          trisRef.current.textContent =
            tris > 999 ? `${(tris / 1000).toFixed(1)}k` : String(tris);
        }
        statsTimer = 0;
        fpsAccum = 0;
        fpsFrames = 0;
      }
    });

    /* Resize -------------------------------------------------------- */
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener('resize', resize);

    /* Cleanup ------------------------------------------------------- */
    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      sceneApiRef.current = null;

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material
            ? [mesh.material]
            : [];
        for (const m of mats) m.dispose();
      });
      envTexture.dispose();
      floorTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // Mount once — runtime options flow through settingsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0">
      {/* WebGL canvas mounts here */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Spatial callout pins — positions written straight to the DOM */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PINS.map((pin, i) => (
          <div
            key={pin.partId}
            ref={(el) => {
              pinRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 opacity-0 transition-opacity duration-300"
            style={{ willChange: 'transform' }}
          >
            {/* Projector dot */}
            <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.9)]" />
            <span className="absolute top-0 left-0 h-6 w-px origin-top rotate-45 bg-gradient-to-b from-[#00f0ff]/80 to-transparent" />
            {/* Label card */}
            <button
              type="button"
              onClick={() => onSelectPart(pin.partId)}
              className="glass pointer-events-auto absolute top-3 left-8 hidden rounded-md px-2.5 py-1.5 text-left whitespace-nowrap transition-colors hover:border-[#00f0ff]/50 md:block"
            >
              <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] text-[#00f0ff]">
                {pin.label}
              </span>
              <span className="block font-mono text-[9px] tracking-wider text-slate-400">
                {pin.sub}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Live telemetry HUD */}
      <div className="pointer-events-none absolute right-4 bottom-4 flex flex-col items-end gap-1.5 font-mono text-[10px] tracking-wider text-slate-400">
        <div className="glass flex items-center gap-3 rounded-md px-3 py-1.5">
          <span>
            FPS <span ref={fpsRef} className="font-semibold text-[#00f0ff]">60</span>
          </span>
          <span className="h-3 w-px bg-slate-600/60" />
          <span>
            DRAW <span ref={drawRef} className="font-semibold text-slate-200">0</span>
          </span>
          <span className="h-3 w-px bg-slate-600/60" />
          <span>
            TRIS <span ref={trisRef} className="font-semibold text-slate-200">0</span>
          </span>
        </div>
        <div className="glass rounded-md px-3 py-1 text-[9px] text-slate-500">
          96 PARTICLES · 1 DRAW CALL · PROCEDURAL · 0 ASSETS
        </div>
      </div>
    </div>
  );
}
