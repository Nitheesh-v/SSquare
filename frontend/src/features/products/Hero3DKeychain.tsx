"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useQuoteModal } from "@/hooks";

const DEG = Math.PI / 180;

// Collision group helper: membership in upper 16 bits, filter in lower 16 bits
const GROUP_NONE = 0;
const GROUP_TAGS = 1 << 1;
const GROUP_CHAIN = 1 << 2;
const makeGroups = (membership: number, filter: number) =>
  ((membership & 0xffff) << 16) | (filter & 0xffff);

function createHolographicSpecTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 256, 320);
  const stops = [
    "#b8f1ff",
    "#c9b8ff",
    "#ffc2ec",
    "#fff1b8",
    "#b8ffd9",
    "#9fc4ff",
    "#e2b8ff",
  ];
  stops.forEach((col, idx) => grad.addColorStop(idx / (stops.length - 1), col));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 320);

  for (let i = 0; i < 24; i++) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#8fa0ff";
    ctx.beginPath();
    ctx.ellipse(
      (i * 53) % 256,
      (i * 79) % 320,
      28 + (i % 5) * 9,
      16 + (i % 4) * 7,
      (i * 0.4) % Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // Crisp industrial spec marking
  ctx.fillStyle = "rgba(13, 19, 36, 0.72)";
  ctx.font = "700 22px Poppins, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("S SQUARE", 128, 74);
  ctx.font = "600 13px Poppins, sans-serif";
  ctx.fillText("DIE MOLD · CNC", 128, 96);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildHangingLoop(
  loopMat: THREE.Material,
  radius = 0.075,
  tube = 0.0225,
  y = 0.56
): THREE.Mesh {
  const geo = new THREE.TorusGeometry(radius, tube, 14, 28);
  const mesh = new THREE.Mesh(geo, loopMat);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(0, y, 0);
  return mesh;
}

// Charm 1: Clear Holographic Die-Mold Inspection Block
function buildDieMoldCharm(loopMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const glassGeo = new RoundedBoxGeometry(0.8, 1.02, 0.15, 5, 0.06);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe9eeff,
    roughness: 0.08,
    metalness: 0.0,
    transmission: 1.0,
    thickness: 0.35,
    ior: 1.42,
    iridescence: 1.0,
    iridescenceIOR: 1.7,
    iridescenceThicknessRange: [180, 820],
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  group.add(new THREE.Mesh(glassGeo, glassMat));

  const labelGeo = new RoundedBoxGeometry(0.58, 0.8, 0.05, 4, 0.04);
  const labelMat = new THREE.MeshPhysicalMaterial({
    map: createHolographicSpecTexture(),
    metalness: 0.45,
    roughness: 0.18,
    iridescence: 1.0,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [250, 900],
    clearcoat: 1.0,
  });
  group.add(new THREE.Mesh(labelGeo, labelMat));

  const windowGeo = new RoundedBoxGeometry(0.22, 0.5, 0.07, 4, 0.03);
  const windowMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e2e7a,
    metalness: 0.35,
    roughness: 0.24,
    clearcoat: 1.0,
  });
  group.add(new THREE.Mesh(windowGeo, windowMat));

  const reelGeo = new THREE.TorusGeometry(0.07, 0.026, 14, 28);
  const topReel = new THREE.Mesh(reelGeo, loopMat);
  topReel.position.set(0, 0.16, 0.03);
  const botReel = new THREE.Mesh(reelGeo, loopMat);
  botReel.position.set(0, -0.18, 0.03);
  group.add(topReel, botReel);

  group.add(buildHangingLoop(loopMat, 0.075, 0.0225, 0.59));
  return group;
}

// Charm 2: Cobalt Bonded Elastomer Sphere Charm
function buildCobaltBeadCharm(beadMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const endSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 24, 24),
    beadMat
  );
  group.add(endSphere);
  return group;
}

// Charm 3: Molded Platinum-Pearl Silicone O-Ring Seal
function buildSiliconeORingCharm(loopMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const torusGeo = new THREE.TorusGeometry(0.33, 0.15, 36, 72);
  const pearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xf7f4f2,
    metalness: 0.05,
    roughness: 0.24,
    iridescence: 0.9,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [300, 700],
    sheen: 1.0,
    sheenColor: new THREE.Color(0xffe6f6),
    sheenRoughness: 0.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
  });
  group.add(new THREE.Mesh(torusGeo, pearlMat));
  group.add(buildHangingLoop(loopMat, 0.075, 0.0225, 0.56));
  return group;
}

// Charm 4: Glossy S Square Crimson Precision Gear Emblem
function buildCrimsonGearCharm(loopMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const teeth = 12;
  const outerR = 0.43;
  const rootR = 0.34;
  const shape = new THREE.Shape();

  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = ((i + 0.22) / teeth) * Math.PI * 2;
    const a2 = ((i + 0.48) / teeth) * Math.PI * 2;
    const a3 = ((i + 0.7) / teeth) * Math.PI * 2;

    const p0x = Math.cos(a0) * rootR;
    const p0y = Math.sin(a0) * rootR;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);

    shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
    shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
    shape.lineTo(Math.cos(a3) * rootR, Math.sin(a3) * rootR);
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.16, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  const gearGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.032,
    bevelSize: 0.024,
    bevelSegments: 5,
    curveSegments: 20,
  });
  gearGeo.center();

  const crimsonMat = new THREE.MeshPhysicalMaterial({
    color: 0xe11d48,
    roughness: 0.2,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  group.add(new THREE.Mesh(gearGeo, crimsonMat));

  // Inner concentric stainless bearing ring
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.165, 0.032, 16, 40),
    loopMat
  );
  group.add(innerRing);

  group.add(buildHangingLoop(loopMat, 0.075, 0.0225, 0.52));
  return group;
}

// Charm 5: CNC Machined 6061 Aluminium / Stainless Stepped Key
function buildCncKeyCharm(loopMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const shape = new THREE.Shape();
  // Round bow
  const startAngle = -0.32 * Math.PI;
  const endAngle = 1.32 * Math.PI;
  shape.absarc(0, 0.36, 0.21, startAngle, endAngle, false);
  shape.lineTo(-0.06, 0.12);
  shape.lineTo(-0.06, -0.62);
  shape.lineTo(0.01, -0.7);
  shape.lineTo(0.06, -0.66);

  // Seven precision-milled teeth up the right edge
  const ys = [-0.6, -0.52, -0.45, -0.37, -0.3, -0.22, -0.14];
  ys.forEach((y, idx) => {
    const x = idx % 2 === 0 ? 0.115 : 0.065;
    shape.lineTo(x, y);
  });
  shape.lineTo(0.06, -0.08);
  shape.lineTo(0.06, 0.12);
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, 0.44, 0.055, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const keyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 28,
  });
  keyGeo.translate(0, 0.065, -0.0225);

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xe4e6ea,
    metalness: 1.0,
    roughness: 0.16,
    clearcoat: 0.4,
  });
  group.add(new THREE.Mesh(keyGeo, metalMat));
  group.add(buildHangingLoop(loopMat, 0.07, 0.021, 0.6));
  return group;
}

interface CharmSpec {
  name: string;
  ringAngleDeg: number;
  pushAngleDeg: number;
  spawnZ: number;
  colliderType: "cuboid" | "ball";
  halfExtents?: [number, number, number];
  ballRadius?: number;
  density: number;
  fixedOffset: number;
  linksCount: number;
  linkLength: number;
  isBeadChain?: boolean;
}

const CHARM_SPECS: CharmSpec[] = [
  {
    name: "die-mold",
    ringAngleDeg: -50,
    pushAngleDeg: -64,
    spawnZ: -0.2,
    colliderType: "cuboid",
    halfExtents: [0.42, 0.52, 0.15],
    density: 1.4,
    fixedOffset: 0.64,
    linksCount: 8,
    linkLength: 0.06,
  },
  {
    name: "cobalt-strand",
    ringAngleDeg: -18,
    pushAngleDeg: -16,
    spawnZ: 0.4,
    colliderType: "ball",
    ballRadius: 0.12,
    density: 30,
    fixedOffset: 0.22,
    linksCount: 9,
    linkLength: 0.135,
    isBeadChain: true,
  },
  {
    name: "silicone-ring",
    ringAngleDeg: 14,
    pushAngleDeg: 10,
    spawnZ: 0.8,
    colliderType: "cuboid",
    halfExtents: [0.5, 0.5, 0.12],
    density: 1.4,
    fixedOffset: 0.62,
    linksCount: 9,
    linkLength: 0.06,
  },
  {
    name: "crimson-gear",
    ringAngleDeg: 40,
    pushAngleDeg: 46,
    spawnZ: 0.15,
    colliderType: "cuboid",
    halfExtents: [0.42, 0.48, 0.12],
    density: 1.4,
    fixedOffset: 0.6,
    linksCount: 10,
    linkLength: 0.06,
  },
  {
    name: "cnc-key",
    ringAngleDeg: 84,
    pushAngleDeg: 88,
    spawnZ: -0.25,
    colliderType: "cuboid",
    halfExtents: [0.22, 0.64, 0.05],
    density: 4.0,
    fixedOffset: 0.7,
    linksCount: 9,
    linkLength: 0.06,
  },
];

export function Hero3DKeychain() {
  const { openQuoteModal } = useQuoteModal();

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loaderTextRef = useRef<HTMLSpanElement | null>(null);
  const headlineInnerRef = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaWrapRef = useRef<HTMLDivElement | null>(null);

  const [loaderRemoved, setLoaderRemoved] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setLoaderRemoved(true);
    }

    let disposed = false;
    let rafId = 0;
    let isHeroVisible = true;
    let renderer: THREE.WebGLRenderer | null = null;
    let pmremGen: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;

    const loadStartTime = performance.now();
    let entranceTriggered = false;

    // Animate loader text rise-in
    if (!prefersReduced && loaderTextRef.current) {
      gsap.set(loaderTextRef.current, { yPercent: 110 });
      gsap.to(loaderTextRef.current, {
        yPercent: 0,
        duration: 0.7,
        delay: 0.12,
        ease: "expo.out",
      });
    }

    // Set initial hidden states for Hero copy
    if (!prefersReduced) {
      if (headlineInnerRef.current) {
        gsap.set(headlineInnerRef.current, { yPercent: 105 });
      }
      if (subRef.current) {
        gsap.set(subRef.current, { y: 24, opacity: 0 });
      }
      if (ctaWrapRef.current) {
        gsap.set(ctaWrapRef.current, { y: 24, opacity: 0 });
      }
    }

    let triggerPhysicsEntrance: (() => void) | null = null;

    function runExitAndEntrance() {
      if (entranceTriggered || disposed) return;
      entranceTriggered = true;

      if (prefersReduced) {
        setLoaderRemoved(true);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          if (!disposed) setLoaderRemoved(true);
        },
      });

      if (loaderTextRef.current) {
        tl.to(loaderTextRef.current, {
          yPercent: -110,
          duration: 0.5,
          ease: "expo.in",
        });
      }

      if (loaderRef.current) {
        tl.to(
          loaderRef.current,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.8,
            ease: "expo.inOut",
            onStart: () => {
              // Trigger hero copy & 3D drop-in simultaneously with wipe start
              if (headlineInnerRef.current) {
                gsap.to(headlineInnerRef.current, {
                  yPercent: 0,
                  duration: 1.2,
                  delay: 0.25,
                  ease: "expo.out",
                });
              }
              if (subRef.current) {
                gsap.to(subRef.current, {
                  y: 0,
                  opacity: 1,
                  duration: 1.0,
                  delay: 0.45,
                  ease: "expo.out",
                });
              }
              if (ctaWrapRef.current) {
                gsap.to(ctaWrapRef.current, {
                  y: 0,
                  opacity: 1,
                  duration: 1.0,
                  delay: 0.55,
                  ease: "expo.out",
                });
              }
              if (triggerPhysicsEntrance) {
                triggerPhysicsEntrance();
              }
            },
          },
          "-=0.15"
        );
      } else {
        setLoaderRemoved(true);
      }
    }

    // Failsafe timer so loader never hangs if WebGL is slow
    const failsafeTimer = window.setTimeout(() => {
      runExitAndEntrance();
    }, 4500);

    // IntersectionObserver to pause WebGL + physics when hero is offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        isHeroVisible = Boolean(entries[0]?.isIntersecting);
      },
      { threshold: 0.01 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Pointer state for radial push field
    const pointerNDC = new THREE.Vector2(99, 99);
    let pointerInsideHero = false;

    function onPointerMove(e: PointerEvent) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        pointerInsideHero = true;
        pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      } else {
        pointerInsideHero = false;
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Boot Three.js + Rapier 3D
    (async () => {
      try {
        const RAPIER = await import("@dimforge/rapier3d-compat");
        await RAPIER.init();
        if (disposed || !canvasRef.current || !sectionRef.current) return;

        const canvas = canvasRef.current;
        const container = sectionRef.current;

        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0xe3e9f2, 0);

        const scene = new THREE.Scene();
        pmremGen = new THREE.PMREMGenerator(renderer);
        envRT = pmremGen.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = envRT.texture;
        scene.environmentIntensity = 1.05;

        // Rim & Key Directional Lights
        const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
        rimLight.position.set(-29, -14.8, -35);
        rimLight.target.position.set(0, 2.2, 0);
        scene.add(rimLight, rimLight.target);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
        keyLight.position.set(6, 10, 12);
        scene.add(keyLight);

        // Camera & Rig
        const cameraRig = new THREE.Group();
        cameraRig.position.set(0, prefersReduced ? 0 : -4, 10);
        scene.add(cameraRig);

        const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 500);
        cameraRig.add(camera);

        function handleResize() {
          if (!renderer || !container) return;
          const w = container.clientWidth || window.innerWidth;
          const h = container.clientHeight || window.innerHeight;
          renderer.setSize(w, h, false);
          const aspect = w / Math.max(1, h);
          camera.aspect = aspect;
          if (aspect >= 0.9) {
            camera.position.set(0, 1.06, -4.4);
          } else {
            camera.position.set(0, -0.9, 2.2);
          }
          camera.updateProjectionMatrix();
        }
        handleResize();
        window.addEventListener("resize", handleResize, { passive: true });

        // Shared Materials
        const steelRingMat = new THREE.MeshStandardMaterial({
          color: 0xcfd3da,
          metalness: 1.0,
          roughness: 0.18,
        });

        const chainLinkMat = new THREE.MeshStandardMaterial({
          color: 0xa9afba,
          metalness: 1.0,
          roughness: 0.2,
        });

        const cobaltBeadMat = new THREE.MeshPhysicalMaterial({
          color: 0x1430e0,
          roughness: 0.12,
          metalness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
        });

        // Master Top Keyring at (0, 3.2, 0)
        const masterRingMesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.5, 0.04, 20, 64),
          steelRingMat
        );
        masterRingMesh.position.set(0, 3.2, 0);
        scene.add(masterRingMesh);

        // Rapier Physics World
        const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
        const allDynamicBodies: any[] = [];

        interface ChainRigRuntime {
          startRingBody: any;
          startRingMesh: THREE.Mesh;
          endRingBody: any;
          endRingMesh: THREE.Mesh;
          charmBody: any;
          charmGroup: THREE.Group;
          linkBodies: any[];
          instancedLinks: THREE.InstancedMesh;
          smoothedDirs: THREE.Vector3[];
          isBeadChain: boolean;
        }

        const chainRigs: ChainRigRuntime[] = [];

        // Link geometries for instancing
        const ovalLinkGeo = new THREE.TorusGeometry(0.062, 0.02, 12, 24);
        ovalLinkGeo.scale(1, 1.5, 1);
        const beadLinkGeo = new THREE.SphereGeometry(0.068, 20, 20);

        const charmVisuals = [
          buildDieMoldCharm(steelRingMat),
          buildCobaltBeadCharm(cobaltBeadMat),
          buildSiliconeORingCharm(steelRingMat),
          buildCrimsonGearCharm(steelRingMat),
          buildCncKeyCharm(steelRingMat),
        ];

        CHARM_SPECS.forEach((spec, cIdx) => {
          const thetaRad = (spec.ringAngleDeg - 90) * DEG;
          const baseX = 0.5 * Math.cos(thetaRad);
          const baseY = 3.2 + 0.5 * Math.sin(thetaRad);

          // 1. Fixed anchor on master keyring
          const anchorBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.fixed().setTranslation(baseX, baseY, 0)
          );

          // 2. Start ring
          const startRingBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
              .setTranslation(baseX, baseY, 0)
              .setLinearDamping(2.3)
              .setAngularDamping(2.9)
              .setCanSleep(true)
          );
          world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.0144, 0.12, 0.12)
              .setDensity(5)
              .setCollisionGroups(
                makeGroups(GROUP_CHAIN, GROUP_TAGS | GROUP_CHAIN)
              ),
            startRingBody
          );
          world.createImpulseJoint(
            RAPIER.JointData.spherical(
              { x: 0, y: 0, z: 0 },
              { x: 0, y: 0, z: 0 }
            ),
            anchorBody,
            startRingBody,
            true
          );
          allDynamicBodies.push(startRingBody);

          const startRingMesh = new THREE.Mesh(
            new THREE.TorusGeometry(0.12, 0.0144, 12, 28),
            steelRingMat
          );
          startRingMesh.rotation.y = Math.PI / 2;
          scene.add(startRingMesh);

          // 3. N Chain Links
          const linkBodies: any[] = [];
          const smoothedDirs: THREE.Vector3[] = [];
          for (let i = 0; i < spec.linksCount; i++) {
            const lb = world.createRigidBody(
              RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(
                  baseX + 0.35,
                  baseY - (i + 1) * spec.linkLength,
                  spec.spawnZ * ((i + 1) / spec.linksCount)
                )
                .setLinearDamping(2.3)
                .setAngularDamping(2.9)
                .setCanSleep(true)
            );
            world.createCollider(
              RAPIER.ColliderDesc.ball(0.1)
                .setDensity(1)
                .setCollisionGroups(makeGroups(GROUP_CHAIN, GROUP_NONE)),
              lb
            );
            linkBodies.push(lb);
            allDynamicBodies.push(lb);
            smoothedDirs.push(new THREE.Vector3(0, -1, 0));

            if (i === 0) {
              world.createImpulseJoint(
                RAPIER.JointData.spherical(
                  { x: 0, y: -0.12, z: 0 },
                  { x: 0, y: 0, z: 0 }
                ),
                startRingBody,
                lb,
                true
              );
            } else {
              world.createImpulseJoint(
                RAPIER.JointData.rope(
                  spec.linkLength,
                  { x: 0, y: 0, z: 0 },
                  { x: 0, y: 0, z: 0 }
                ),
                linkBodies[i - 1],
                lb,
                true
              );
            }
          }

          // 4. End ring
          const endY = baseY - spec.linksCount * spec.linkLength - 0.08;
          const endRingBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
              .setTranslation(baseX + 0.35, endY, spec.spawnZ)
              .setLinearDamping(2.3)
              .setAngularDamping(2.9)
              .setCanSleep(true)
          );
          world.createCollider(
            RAPIER.ColliderDesc.cuboid(0.012, 0.08, 0.08)
              .setDensity(5)
              .setCollisionGroups(
                makeGroups(GROUP_CHAIN, GROUP_TAGS | GROUP_CHAIN)
              ),
            endRingBody
          );
          world.createImpulseJoint(
            RAPIER.JointData.spherical(
              { x: 0, y: -0.08, z: 0 },
              { x: 0, y: 0, z: 0 }
            ),
            linkBodies[linkBodies.length - 1],
            endRingBody,
            true
          );
          allDynamicBodies.push(endRingBody);

          const endRingMesh = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.012, 12, 24),
            steelRingMat
          );
          endRingMesh.rotation.y = Math.PI / 2;
          endRingMesh.visible = !spec.isBeadChain;
          scene.add(endRingMesh);

          // 5. Charm body
          const charmBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
              .setTranslation(
                baseX + 0.35,
                endY - spec.fixedOffset,
                spec.spawnZ
              )
              .setLinearDamping(2.3)
              .setAngularDamping(2.9)
              .setCanSleep(true)
          );

          if (spec.colliderType === "ball") {
            world.createCollider(
              RAPIER.ColliderDesc.ball(spec.ballRadius || 0.12)
                .setDensity(spec.density)
                .setCollisionGroups(makeGroups(GROUP_TAGS, GROUP_TAGS)),
              charmBody
            );
          } else {
            const [hx, hy, hz] = spec.halfExtents!;
            world.createCollider(
              RAPIER.ColliderDesc.cuboid(hx, hy, hz)
                .setDensity(spec.density)
                .setCollisionGroups(makeGroups(GROUP_TAGS, GROUP_TAGS)),
              charmBody
            );
          }

          world.createImpulseJoint(
            RAPIER.JointData.fixed(
              { x: 0, y: 0, z: 0 },
              { x: 0, y: 0, z: 0, w: 1 },
              { x: 0, y: spec.fixedOffset, z: 0 },
              { x: 0, y: 0, z: 0, w: 1 }
            ),
            endRingBody,
            charmBody,
            true
          );
          allDynamicBodies.push(charmBody);

          // 6. Constant outward fan force
          const phiRad = (spec.pushAngleDeg - 90) * DEG;
          charmBody.addForce(
            {
              x: 0.7 * Math.cos(phiRad),
              y: 0.7 * Math.sin(phiRad),
              z: spec.spawnZ * 0.35,
            },
            true
          );

          const charmGroup = charmVisuals[cIdx];
          scene.add(charmGroup);

          const instancedLinks = new THREE.InstancedMesh(
            spec.isBeadChain ? beadLinkGeo : ovalLinkGeo,
            spec.isBeadChain ? cobaltBeadMat : chainLinkMat,
            spec.linksCount
          );
          instancedLinks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          scene.add(instancedLinks);

          chainRigs.push({
            startRingBody,
            startRingMesh,
            endRingBody,
            endRingMesh,
            charmBody,
            charmGroup,
            linkBodies,
            instancedLinks,
            smoothedDirs,
            isBeadChain: Boolean(spec.isBeadChain),
          });
        });

        // Entrance physics callback
        triggerPhysicsEntrance = () => {
          const state = { p: 0 };
          const tl = gsap.timeline({
            defaults: { duration: 1.5, delay: 0.35, ease: "elastic.out(1, 1)" },
          });
          tl.to(cameraRig.position, { y: 0 }, 0);
          tl.to(
            state,
            {
              p: 1,
              onUpdate: () => {
                if (state.p < 0.98) {
                  for (const b of allDynamicBodies) {
                    b.setGravityScale(-0.25, true);
                  }
                }
              },
              onComplete: () => {
                for (const b of allDynamicBodies) {
                  b.setGravityScale(1.0, true);
                }
              },
            },
            0
          );
        };

        // Pre-settle slightly if reduced motion
        if (prefersReduced) {
          for (let i = 0; i < 240; i++) world.step();
        }

        // Reusable math helpers for zero GC pressure in render loop
        const raycaster = new THREE.Raycaster();
        const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const hitPoint = new THREE.Vector3();
        const upVec = new THREE.Vector3(0, 1, 0);
        const yAxis = new THREE.Vector3(0, 1, 0);
        const tmpPos = new THREE.Vector3();
        const nextPos = new THREE.Vector3();
        const tmpDir = new THREE.Vector3();
        const tmpQuat = new THREE.Quaternion();
        const twistQuat = new THREE.Quaternion();
        const identityQuat = new THREE.Quaternion();
        const tmpScale = new THREE.Vector3(1, 1, 1);
        const tmpMat = new THREE.Matrix4();
        const zForward = new THREE.Vector3();

        function clampBodyYaw(body: any, maxDeg: number) {
          if (body.isSleeping()) return;
          const r = body.rotation();
          tmpQuat.set(r.x, r.y, r.z, r.w);
          zForward.set(0, 0, 1).applyQuaternion(tmpQuat);
          const yaw = Math.atan2(zForward.x, zForward.z);
          const limit = maxDeg * DEG;
          if (Math.abs(yaw) > limit) {
            const corr = (yaw > 0 ? limit : -limit) - yaw;
            twistQuat.setFromAxisAngle(yAxis, corr);
            tmpQuat.premultiply(twistQuat);
            body.setRotation(
              { x: tmpQuat.x, y: tmpQuat.y, z: tmpQuat.z, w: tmpQuat.w },
              false
            );
            const av = body.angvel();
            body.setAngvel({ x: av.x, y: 0, z: av.z }, false);
          }
        }

        function syncSceneFromPhysics(dt: number) {
          const lerpAlpha = Math.min(1, 10 * dt);

          for (const rig of chainRigs) {
            clampBodyYaw(rig.startRingBody, 15);
            clampBodyYaw(rig.endRingBody, 12);
            clampBodyYaw(rig.charmBody, 12);

            if (!rig.charmBody.isSleeping()) {
              const cr = rig.charmBody.rotation();
              tmpQuat.set(cr.x, cr.y, cr.z, cr.w);
              tmpQuat.slerp(identityQuat, 0.001);
              rig.charmBody.setRotation(
                { x: tmpQuat.x, y: tmpQuat.y, z: tmpQuat.z, w: tmpQuat.w },
                false
              );
            }

            // Sync start & end rings
            const sp = rig.startRingBody.translation();
            const sr = rig.startRingBody.rotation();
            rig.startRingMesh.position.set(sp.x, sp.y, sp.z);
            rig.startRingMesh.quaternion.set(sr.x, sr.y, sr.z, sr.w);
            rig.startRingMesh.rotateY(Math.PI / 2);

            const ep = rig.endRingBody.translation();
            const er = rig.endRingBody.rotation();
            rig.endRingMesh.position.set(ep.x, ep.y, ep.z);
            rig.endRingMesh.quaternion.set(er.x, er.y, er.z, er.w);
            rig.endRingMesh.rotateY(Math.PI / 2);

            // Sync charm
            const cp = rig.charmBody.translation();
            const cRot = rig.charmBody.rotation();
            rig.charmGroup.position.set(cp.x, cp.y, cp.z);
            rig.charmGroup.quaternion.set(cRot.x, cRot.y, cRot.z, cRot.w);

            // Sync instanced chain links
            const n = rig.linkBodies.length;
            for (let i = 0; i < n; i++) {
              const p = rig.linkBodies[i].translation();
              tmpPos.set(p.x, p.y, p.z);

              if (i < n - 1) {
                const np = rig.linkBodies[i + 1].translation();
                nextPos.set(np.x, np.y, np.z);
                tmpDir.subVectors(nextPos, tmpPos);
              } else {
                const pp = rig.linkBodies[i - 1].translation();
                nextPos.set(pp.x, pp.y, pp.z);
                tmpDir.subVectors(tmpPos, nextPos);
              }

              if (tmpDir.lengthSq() > 1e-6) {
                tmpDir.normalize();
                rig.smoothedDirs[i].lerp(tmpDir, lerpAlpha).normalize();
              }

              tmpQuat.setFromUnitVectors(upVec, rig.smoothedDirs[i]);
              if (!rig.isBeadChain) {
                const twistAngle = (i * 16 + (i % 2 === 1 ? 90 : 0)) * DEG;
                twistQuat.setFromAxisAngle(upVec, twistAngle);
                tmpQuat.multiply(twistQuat);
              }

              tmpMat.compose(tmpPos, tmpQuat, tmpScale);
              rig.instancedLinks.setMatrixAt(i, tmpMat);
            }
            rig.instancedLinks.instanceMatrix.needsUpdate = true;
          }
        }

        // Render first frame before dismissing loader
        syncSceneFromPhysics(1 / 60);
        renderer.render(scene, camera);

        const elapsed = performance.now() - loadStartTime;
        const remainingWait = Math.max(0, 1100 - elapsed);
        window.setTimeout(() => {
          window.clearTimeout(failsafeTimer);
          runExitAndEntrance();
        }, remainingWait);

        if (prefersReduced) {
          return;
        }

        // Fixed-timestep accumulator loop
        let lastTime = performance.now();
        let accumulator = 0;
        const FIXED_DT = 1 / 60;

        function animate(now: number) {
          if (disposed) return;
          rafId = requestAnimationFrame(animate);

          if (!isHeroVisible || !renderer) {
            lastTime = now;
            return;
          }

          const frameDt = Math.min(0.1, (now - lastTime) / 1000);
          lastTime = now;
          accumulator += frameDt;

          let hasPoint = false;
          if (pointerInsideHero && frameDt <= 0.1) {
            raycaster.setFromCamera(pointerNDC, camera);
            hasPoint = Boolean(
              raycaster.ray.intersectPlane(planeZ0, hitPoint)
            );
          }

          while (accumulator >= FIXED_DT) {
            if (hasPoint) {
              for (const rig of chainRigs) {
                const cp = rig.charmBody.translation();
                const dx = cp.x - hitPoint.x;
                const dy = cp.y - hitPoint.y;
                const dz = cp.z - hitPoint.z;
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d > 0.001 && d < 2.0) {
                  const falloff = 1 - d / 2.0;
                  const mag = (4.4 * falloff * falloff * FIXED_DT) / d;
                  rig.charmBody.applyImpulse(
                    { x: dx * mag, y: dy * mag, z: dz * mag },
                    true
                  );
                }
              }
            }

            world.step();
            accumulator -= FIXED_DT;
          }

          syncSceneFromPhysics(frameDt || FIXED_DT);
          renderer.render(scene, camera);
        }

        rafId = requestAnimationFrame(animate);
      } catch {
        // Graceful fallback if WebGL context is unavailable
        runExitAndEntrance();
      }
    })();

    return () => {
      disposed = true;
      window.clearTimeout(failsafeTimer);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (envRT) envRT.dispose();
      if (pmremGen) pmremGen.dispose();
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Full-Viewport Curtain Loader */}
      {!loaderRemoved && (
        <div
          ref={loaderRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f7fb]"
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <p className="overflow-hidden px-6 py-2 text-center">
            <span
              ref={loaderTextRef}
              className="inline-block font-display text-xl sm:text-3xl font-medium tracking-tight text-[#0d1324]"
            >
              Precision engineered to your specification.
            </span>
          </p>
        </div>
      )}

      {/* Hero Section with Live 3D Rigid-Body Industrial Keychain */}
      <section
        ref={sectionRef}
        className="relative w-full h-[90svh] min-h-[580px] max-h-[920px] overflow-hidden select-none"
        style={{
          background:
            "linear-gradient(180deg, #dbe3ee 0%, #eef2f8 62%, #f4f7fb 100%)",
        }}
      >
        {/* 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full block"
        />

        {/* Interactive Hint Pill Top-Right */}
        <div className="pointer-events-none absolute top-5 right-6 z-10 hidden md:inline-flex items-center gap-2 rounded-full bg-white/75 border border-slate-300/70 px-3.5 py-1.5 text-xs font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-forge-600 animate-pulse" />
          Move cursor across the 3D parts
        </div>

        {/* Bottom Content Overlay (Headline Bottom-Left, Subtitle + CTA Bottom-Right) */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            {/* Bottom-Left Giant Headline */}
            <h1 className="font-display text-[2.85rem] sm:text-6xl lg:text-[5.25rem] xl:text-[5.8rem] font-medium leading-[0.95] tracking-[-0.03em] text-[#0d1324]">
              <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                <span ref={headlineInnerRef} className="inline-block">
                  Crafted to
                  <br />
                  Specification
                </span>
              </span>
            </h1>

            {/* Bottom-Right Subtitle + Springy Get Started / Quote Button */}
            <div className="lg:pb-2 max-w-sm space-y-5">
              <p
                ref={subRef}
                className="text-base sm:text-lg font-normal leading-snug text-[#1e2538]"
              >
                S Square Engineering — custom Rubber,
                <br />
                Steel &amp; Aluminium built to your print.
              </p>

              <div
                ref={ctaWrapRef}
                className="pointer-events-auto flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => openQuoteModal()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111624] px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] hover:scale-105 hover:bg-[#232b42] cursor-pointer"
                >
                  Request a Quote
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/90 px-5 py-3.5 text-sm font-semibold text-[#0d1324] hover:border-forge-600 hover:text-forge-600 transition-colors"
                >
                  Explore Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
