"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A lightweight, always-behind WebGL field for the animated homepage.
 *
 * It is deliberately *not* a product viewer: it draws a slow industrial
 * orrery (gears, rings and drifting swarf) that reacts to the active ring
 * station. One renderer, one canvas, no shadows, no post-processing, no
 * per-frame allocations. It stops completely when the tab is hidden, and is
 * never mounted for reduced motion, paused motion or WebGL-less devices.
 */

type AccentEvent = CustomEvent<{ color?: string }>;

function makeGear(
  radius: number,
  teeth: number,
  thickness: number,
  material: THREE.Material,
) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, thickness, 10, 84),
    material,
  );
  group.add(ring);
  const toothGeometry = new THREE.BoxGeometry(
    thickness * 1.5,
    thickness * 1.9,
    thickness * 1.15,
  );
  for (let i = 0; i < teeth; i += 1) {
    const angle = (i / teeth) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeometry, material);
    tooth.position.set(
      Math.cos(angle) * (radius + thickness * 0.65),
      Math.sin(angle) * (radius + thickness * 0.65),
      0,
    );
    tooth.rotation.z = angle;
    group.add(tooth);
  }
  return group;
}

export default function ThreeBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      // CSS ambient layers remain as the graceful fallback.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 0.15, 9);

    const rig = new THREE.Group();
    scene.add(rig);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x8d99a8,
      metalness: 0.9,
      roughness: 0.31,
    });
    const alloyMat = new THREE.MeshStandardMaterial({
      color: 0x3d7bff,
      metalness: 0.72,
      roughness: 0.26,
      emissive: 0x102a63,
      emissiveIntensity: 0.6,
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x202329,
      metalness: 0.08,
      roughness: 0.88,
    });

    const gearA = makeGear(1.62, 22, 0.15, steelMat);
    gearA.position.set(-2.35, -0.65, -1.1);
    gearA.rotation.z = 0.25;
    rig.add(gearA);

    const gearB = makeGear(1.08, 16, 0.13, alloyMat);
    gearB.position.set(2.55, 0.85, -0.35);
    gearB.rotation.z = -0.4;
    rig.add(gearB);

    const gearC = makeGear(0.72, 12, 0.16, rubberMat);
    gearC.position.set(0.35, -2.05, 0.3);
    gearC.rotation.z = 0.8;
    rig.add(gearC);

    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x7aa4ff,
      transparent: true,
      opacity: 0.24,
    });
    const orbitA = new THREE.Mesh(
      new THREE.TorusGeometry(3.55, 0.012, 6, 160),
      orbitMat,
    );
    orbitA.rotation.x = 0.42;
    rig.add(orbitA);
    const orbitB = new THREE.Mesh(
      new THREE.TorusGeometry(4.25, 0.008, 6, 160),
      orbitMat.clone(),
    );
    orbitB.rotation.x = -0.58;
    orbitB.rotation.y = 0.35;
    rig.add(orbitB);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.62, 1),
      new THREE.MeshStandardMaterial({
        color: 0x1b2230,
        metalness: 0.85,
        roughness: 0.22,
        flatShading: true,
        transparent: true,
        opacity: 0.9,
      }),
    );
    rig.add(core);

    // Drifting swarf / telemetry dust.
    const particleCount = 380;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x7aa4ff,
      size: 0.028,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xdbe6ff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 5, 6);
    scene.add(key);
    const accentLight = new THREE.PointLight(0x3d7bff, 18, 22);
    accentLight.position.set(-4, -2, 4);
    scene.add(accentLight);

    const accentTarget = new THREE.Color(0x3d7bff);
    const accentCurrent = accentTarget.clone();
    const white = new THREE.Color(0xffffff);
    const mouse = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector2(0, 0);

    const onPointer = (event: PointerEvent) => {
      mouseTarget.set(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    const onAccent = (event: Event) => {
      const detail = (event as AccentEvent).detail;
      if (detail?.color) {
        try {
          accentTarget.set(detail.color);
        } catch {
          /* ignore invalid colours */
        }
      }
    };
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("ar:accent", onAccent);
    resize();
    canvas.dataset.ready = "true";

    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    let alive = true;

    const tick = (now: number) => {
      if (!alive) return;
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      accentCurrent.lerp(accentTarget, 0.045);
      accentLight.color.copy(accentCurrent);
      alloyMat.emissive.copy(accentCurrent).multiplyScalar(0.28);
      particleMaterial.color.copy(accentCurrent).lerp(white, 0.35);

      gearA.rotation.z += dt * 0.13;
      gearB.rotation.z -= dt * 0.2;
      gearC.rotation.z += dt * 0.29;
      orbitA.rotation.z += dt * 0.035;
      orbitB.rotation.z -= dt * 0.026;
      core.rotation.x += dt * 0.21;
      core.rotation.y += dt * 0.34;
      particles.rotation.y += dt * 0.012;
      rig.rotation.y = Math.sin(elapsed * 0.13) * 0.16;
      rig.rotation.x = Math.cos(elapsed * 0.1) * 0.07;

      mouse.lerp(mouseTarget, 0.035);
      camera.position.x += (mouse.x * 0.55 - camera.position.x) * 0.045;
      camera.position.y += (0.15 - mouse.y * 0.38 - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      alive = false;
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("ar:accent", onAccent);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ar-webgl"
      data-testid="ar-webgl"
      aria-hidden="true"
    />
  );
}
