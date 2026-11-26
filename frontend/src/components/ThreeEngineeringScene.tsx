"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  buildEngineeringAssembly,
  type EngineeringAssembly,
} from "@/three/buildEngineeringAssembly";
import {
  createEngineeringMaterials,
  createStudioEnvironment,
  disposeEngineeringMaterials,
  type EngineeringMaterials,
} from "@/three/engineeringMaterials";
import { createTelemetryParticles } from "@/three/engineeringParticles";

// ── Part catalogue for the inspector card ────────────────────────────────────
const PART_INFO: Record<
  string,
  { name: string; material: string; spec: string; hardness: string; tol: string }
> = {
  "upper-housing": {
    name: "Aluminium Housing Cap",
    material: "Grade 6061-T6",
    spec: "5-Axis CNC Milled",
    hardness: "HRB 60",
    tol: "ISO 2768-m",
  },
  "lower-housing": {
    name: "CNC Aluminium Base Flange",
    material: "Grade 6061-T6",
    spec: "Precision Milled",
    hardness: "HRB 60",
    tol: "ISO 2768-f",
  },
  "gear-train": {
    name: "EN24 Planetary Gear Train",
    material: "EN24 / 36 HRC",
    spec: "16T Sun + 4× 12T Planets",
    hardness: "36 HRC (through)",
    tol: "ISO 1328 Grade 7",
  },
  "spider-coupler": {
    name: "EPDM Elastomer Spider",
    material: "EPDM 70 Shore A",
    spec: "6-Lobe Bezier Profile",
    hardness: "70 Shore A",
    tol: "ISO 3302 E2",
  },
  "rubber-mounts": {
    name: "NBR Anti-Vibration Mounts",
    material: "NBR 55 Shore A",
    spec: "3-Rib Compression",
    hardness: "55 Shore A",
    tol: "ISO 3302 E2",
  },
  shaft: {
    name: "SS316L Output Shaft",
    material: "SS316L / HRB 95",
    spec: "Ground Splined Profile",
    hardness: "HRB 95",
    tol: "h6",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function smoothstep(x: number): number {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  /** Ref to the outer scroll-section div (500svh); used to calculate progress. */
  scrollSectionRef: React.RefObject<HTMLDivElement | null>;
  paused: boolean;
  /** Which chapter/part to visually highlight (from parent chapter flow). */
  activeChapterPart?: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ThreeEngineeringScene({
  scrollSectionRef,
  paused,
  activeChapterPart,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinsContainerRef = useRef<HTMLDivElement>(null);

  // Inspector card state (clicks → React re-render is fine here)
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Store all Three.js objects in refs so the RAF loop never stales
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    assembly: EngineeringAssembly;
    materials: EngineeringMaterials;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    clock: THREE.Clock;
    particles: ReturnType<typeof createTelemetryParticles>;
    pinEls: HTMLElement[];
    // Per-subassembly current Y offset (lerped)
    currentOffsets: Map<string, THREE.Vector3>;
    scrollProgress: number;
    explodeProgress: number;
    hoveredPartId: string | null;
    frameId: number;
  } | null>(null);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const activeChapterPartRef = useRef(activeChapterPart);
  activeChapterPartRef.current = activeChapterPart;

  // ── Scroll progress calculator ──────────────────────────────────────────
  const getScrollProgress = useCallback((): number => {
    const section = scrollSectionRef.current;
    if (!section) return 0;
    const rect = section.getBoundingClientRect();
    const totalScrollable = section.offsetHeight - window.innerHeight;
    if (totalScrollable <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / totalScrollable));
  }, [scrollSectionRef]);

  // ── Main Three.js setup ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const pinsContainer = pinsContainerRef.current;
    if (!canvas || !pinsContainer) return;

    // ── Renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    renderer.setSize(W, H, false);

    // ── Scene ────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c14);
    scene.fog = new THREE.FogExp2(0x060c14, 0.055);

    // ── Camera ───────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 6.5);

    // ── Controls ─────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3.5;
    controls.maxDistance = 12;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.target.set(0, -0.1, 0);

    // ── Lighting ─────────────────────────────────────────────────────────
    // Key light (shadow caster)
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.8);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Hemisphere ambient
    scene.add(new THREE.HemisphereLight(0x334466, 0x1a0a04, 0.9));

    // Cyan rim
    const rimCyan = new THREE.DirectionalLight(0x00e8f5, 1.4);
    rimCyan.position.set(-5, 1, -3);
    scene.add(rimCyan);

    // Warm fill
    const warmFill = new THREE.DirectionalLight(0xf97316, 0.8);
    warmFill.position.set(3, -2, 4);
    scene.add(warmFill);

    // Shadow receiver plane
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.35, transparent: true }),
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.8;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x1a3a55, 0x0d1f2e);
    gridHelper.position.y = -1.8;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    scene.add(gridHelper);

    // ── Materials + Environment ──────────────────────────────────────────
    const materials = createEngineeringMaterials();
    const envTexture = createStudioEnvironment(renderer);
    scene.environment = envTexture;
    Object.values(materials).forEach((m) => {
      m.envMap = envTexture;
      m.envMapIntensity = 0.95;
      m.needsUpdate = true;
    });

    // ── Assembly ─────────────────────────────────────────────────────────
    const assembly = buildEngineeringAssembly(materials);
    scene.add(assembly.root);

    // ── Particles ────────────────────────────────────────────────────────
    const particles = createTelemetryParticles();
    scene.add(particles.mesh);

    // ── Callout pins (DOM elements) ──────────────────────────────────────
    const pinEls: HTMLElement[] = assembly.calloutPositions.map((cp) => {
      const pin = document.createElement("div");
      pin.className = "ssq-callout-pin";
      pin.setAttribute("data-part", cp.id);
      pin.innerHTML = `
        <span class="ssq-pin-dot"></span>
        <span class="ssq-pin-label">${cp.label.replace("\n", "<br/>")}</span>
      `;
      pinsContainer.appendChild(pin);
      return pin;
    });

    // ── Raycaster ────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    // ── Current lerp offsets for each sub-assembly ───────────────────────
    const currentOffsets = new Map<string, THREE.Vector3>();
    [
      assembly.upperHousing,
      assembly.lowerHousing,
      assembly.gearTrain,
      assembly.spiderCoupler,
      assembly.rubberMounts,
    ].forEach((g) => {
      currentOffsets.set(g.userData.partId as string, new THREE.Vector3());
    });

    // ── Store everything ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    threeRef.current = {
      renderer,
      scene,
      camera,
      controls,
      assembly,
      materials,
      raycaster,
      mouse,
      clock,
      particles,
      pinEls,
      currentOffsets,
      scrollProgress: 0,
      explodeProgress: 0,
      hoveredPartId: null,
      frameId: 0,
    };

    // ── RAF loop ─────────────────────────────────────────────────────────
    const tempVec = new THREE.Vector3();

    const tick = () => {
      const ref = threeRef.current;
      if (!ref) return;
      ref.frameId = requestAnimationFrame(tick);

      const { renderer, scene, camera, controls, assembly, particles, pinEls, currentOffsets, raycaster, mouse } = ref;
      const delta = Math.min(ref.clock.getDelta(), 0.05);
      const elapsed = ref.clock.elapsedTime;
      const lerpSpeed = 1 - Math.pow(0.004, delta);

      // Scroll progress (always live)
      ref.scrollProgress = getScrollProgress();
      const rawExplode = smoothstep(ref.scrollProgress);
      ref.explodeProgress = lerp(ref.explodeProgress, rawExplode, lerpSpeed);
      const ep = ref.explodeProgress;

      // Kinematic rotation (stop when paused)
      if (!pausedRef.current) {
        const sunOmega = 1.25 * delta;
        assembly.sunGear.rotation.z += sunOmega;

        const planetOmega = sunOmega * (16 / 12);
        assembly.planetGears.forEach((p, i) => {
          p.rotation.z -= planetOmega;
          // Orbit the carrier
          const a = p.userData.orbitAngle + elapsed * 0.22;
          const r = p.userData.orbitRadius as number;
          p.position.set(Math.cos(a) * r, p.position.y, Math.sin(a) * r);
        });

        // Rubber mount squash (vibration damping demo)
        assembly.rubberMounts.children.forEach((mg, i) => {
          const phase = (i / 4) * Math.PI * 2;
          mg.scale.y = 1 + Math.sin(elapsed * 7.5 + phase) * 0.028;
          mg.scale.x = 1 - Math.sin(elapsed * 7.5 + phase) * 0.014;
        });
      }

      // Core glow brightens as assembly explodes
      assembly.coreLight.intensity = ep * 2.5;

      // Explode sub-assemblies via lerp
      const subGroups = [
        assembly.upperHousing,
        assembly.lowerHousing,
        assembly.gearTrain,
        assembly.spiderCoupler,
        assembly.rubberMounts,
      ];
      subGroups.forEach((g) => {
        const delta3 = g.userData.explodeDelta as THREE.Vector3;
        const cur = currentOffsets.get(g.userData.partId as string)!;
        const targetY = delta3.y * ep;
        const targetX = delta3.x * ep;
        const targetZ = delta3.z * ep;
        cur.x = lerp(cur.x, targetX, lerpSpeed);
        cur.y = lerp(cur.y, targetY, lerpSpeed);
        cur.z = lerp(cur.z, targetZ, lerpSpeed);
        g.position.set(cur.x, cur.y, cur.z);
      });

      // Gentle camera azimuth sweep with scroll
      if (!controls.autoRotate) {
        controls.autoRotate = true;
      }

      // Adjust auto rotate speed based on scroll
      controls.autoRotateSpeed = 0.3 + ep * 0.9;

      // Particle update
      particles.update(elapsed, ep);

      // Raycasting (every frame, cheap)
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      let newHover: string | null = null;
      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.userData?.partId) {
            newHover = obj.userData.partId as string;
            break;
          }
          obj = obj.parent;
        }
        if (newHover) break;
      }
      if (newHover !== ref.hoveredPartId) {
        ref.hoveredPartId = newHover;
        // Emissive highlight
        subGroups.forEach((g) => {
          g.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              if (mat?.emissive) {
                const isHovered = g.userData.partId === newHover || g.userData.partId === activeChapterPartRef.current;
                mat.emissiveIntensity = isHovered ? 0.18 : (mat.color.getHex() === 0x00e8f5 ? 0.45 : 0);
              }
            }
          });
        });
        // Update React state (batched, cheap)
        setHoveredPart(newHover);
      }

      // 3D → 2D callout pin projection
      assembly.calloutPositions.forEach((cp, i) => {
        const pin = pinEls[i];
        if (!pin) return;
        // Apply explosion offset to world pos
        const group = subGroups.find((g) => g.userData.partId === cp.id);
        const offset = group ? group.position : new THREE.Vector3();
        tempVec.copy(cp.world).add(offset);
        tempVec.project(camera);
        const sx = ((tempVec.x + 1) / 2) * renderer.domElement.clientWidth;
        const sy = ((-tempVec.y + 1) / 2) * renderer.domElement.clientHeight;
        // Fade pins in when explode > 20%
        const visible = ep > 0.15 && tempVec.z < 1;
        pin.style.transform = `translate3d(${sx}px,${sy}px,0)`;
        pin.style.opacity = visible ? String(Math.min(1, (ep - 0.15) * 4)) : "0";
        pin.style.pointerEvents = visible ? "auto" : "none";
        pin.dataset.active = (cp.id === newHover || cp.id === activeChapterPartRef.current) ? "true" : "false";
      });

      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => {
      const ref = threeRef.current;
      if (!ref) return;
      const { renderer, camera } = ref;
      const c = renderer.domElement;
      const w = c.clientWidth;
      const h = c.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    // ── Mouse ────────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const ref = threeRef.current;
      if (!ref) return;
      const rect = canvas.getBoundingClientRect();
      ref.mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    const onMouseLeave = () => {
      if (threeRef.current) threeRef.current.mouse.set(-999, -999);
    };
    const onClick = (e: MouseEvent) => {
      const ref = threeRef.current;
      if (!ref || !ref.hoveredPartId) return;
      setSelectedPart((prev) =>
        prev === ref.hoveredPartId ? null : ref.hoveredPartId,
      );
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("click", onClick);

    // ── Scroll ───────────────────────────────────────────────────────────
    const onScroll = () => {
      /* scrollProgress is computed live in RAF via getScrollProgress() */
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Visibility ───────────────────────────────────────────────────────
    const onVisibility = () => {
      const ref = threeRef.current;
      if (!ref) return;
      if (document.hidden) {
        cancelAnimationFrame(ref.frameId);
        ref.frameId = 0;
      } else {
        ref.frameId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      const ref = threeRef.current;
      threeRef.current = null;
      if (ref) {
        cancelAnimationFrame(ref.frameId);
        ref.renderer.dispose();
        ref.particles.dispose();
        disposeEngineeringMaterials(ref.materials);
      }
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      // Remove pin DOM nodes
      pinsContainer.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update emissive highlights when chapter part changes externally
  useEffect(() => {
    const ref = threeRef.current;
    if (!ref) return;
    const subGroups = [
      ref.assembly.upperHousing,
      ref.assembly.lowerHousing,
      ref.assembly.gearTrain,
      ref.assembly.spiderCoupler,
      ref.assembly.rubberMounts,
    ];
    subGroups.forEach((g) => {
      g.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat?.emissive && mat.color.getHex() !== 0x00e8f5) {
            mat.emissiveIntensity =
              g.userData.partId === activeChapterPart ? 0.22 : 0;
            mat.emissive.set(g.userData.partId === activeChapterPart ? 0x0044aa : 0x000000);
          }
        }
      });
    });
  }, [activeChapterPart]);

  const info = selectedPart ? PART_INFO[selectedPart] : null;

  return (
    <div className="ssq-scene-wrapper" aria-label="Interactive 3D engineering assembly">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="ssq-scene-canvas"
        aria-hidden="true"
      />

      {/* Callout pins container (pins are injected here as DOM nodes) */}
      <div
        ref={pinsContainerRef}
        className="ssq-pins-container"
        aria-hidden="true"
      />

      {/* Hover tooltip */}
      {hoveredPart && !selectedPart && (
        <div className="ssq-hover-tip" aria-hidden="true">
          {PART_INFO[hoveredPart]?.name ?? hoveredPart} · click to inspect
        </div>
      )}

      {/* Part Inspector Card */}
      {info && (
        <div className="ssq-part-card" role="complementary" aria-label={`Part inspector: ${info.name}`}>
          <button
            className="ssq-part-card-close"
            onClick={() => setSelectedPart(null)}
            aria-label="Close inspector"
          >
            ✕
          </button>
          <p className="ssq-part-card-kicker">PART INSPECTOR</p>
          <h3 className="ssq-part-card-name">{info.name}</h3>
          <dl className="ssq-part-card-specs">
            <div><dt>Material</dt><dd>{info.material}</dd></div>
            <div><dt>Process</dt><dd>{info.spec}</dd></div>
            <div><dt>Hardness</dt><dd>{info.hardness}</dd></div>
            <div><dt>Tolerance</dt><dd>{info.tol}</dd></div>
          </dl>
          <p className="ssq-part-card-note">
            ILLUSTRATIVE DATA · REPLACEABLE WITH YOUR APPROVED SPEC SHEET
          </p>
        </div>
      )}
    </div>
  );
}
