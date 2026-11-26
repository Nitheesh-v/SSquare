"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * One lightweight Three.js stage for the Services journey. It follows the
 * user's Drive reference: a red S Square container truck drives across a navy
 * blueprint road while a gear, gauge and inspector stay in the scene. Native
 * document scroll drives the truck; dragging the canvas orbits the camera.
 * No external models, textures, video, shadows or post-processing are used.
 */

type ServiceEvent = CustomEvent<{ progress?: number }>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function makeGear(
  radius: number,
  teeth: number,
  thickness: number,
  material: THREE.Material,
) {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 12, 64), material));
  const toothGeometry = new THREE.BoxGeometry(
    thickness * 1.6,
    thickness * 2.1,
    thickness * 1.2,
  );
  for (let i = 0; i < teeth; i += 1) {
    const angle = (i / teeth) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeometry, material);
    tooth.position.set(
      Math.cos(angle) * (radius + thickness * 0.6),
      Math.sin(angle) * (radius + thickness * 0.6),
      0,
    );
    tooth.rotation.z = angle;
    group.add(tooth);
  }
  return group;
}

function makeContainerLabel() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#e9edf0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#d7dde1";
  ctx.fillRect(0, 0, canvas.width, 18);
  ctx.fillStyle = "#1b2734";
  ctx.font = "700 92px Arial, sans-serif";
  ctx.fillText("S SQUARE", 70, 170);
  ctx.font = "500 34px Arial, sans-serif";
  ctx.fillStyle = "#5b6672";
  ctx.fillText("CUSTOM METAL & RUBBER EXPRESS", 74, 230);
  ctx.fillStyle = "#d9483b";
  ctx.fillRect(0, 370, canvas.width, 92);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px Arial, sans-serif";
  ctx.fillText("GLOBAL DOOR DELIVERY · 3-4 DAYS (DHL/FEDEX)", 70, 428);
  ctx.fillStyle = "#edb45b";
  ctx.fillRect(0, 462, canvas.width, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function ServiceJourneyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1324, 0.022);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    const target = new THREE.Vector3(0, 0.85, 0);
    camera.position.set(0, 3.1, 12);

    const ambient = new THREE.AmbientLight(0xdbe7ff, 1.5);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-5, 8, 7);
    scene.add(key);
    const rim = new THREE.PointLight(0x4da3ff, 22, 28);
    rim.position.set(5, 3, 6);
    scene.add(rim);

    const navy = new THREE.MeshStandardMaterial({
      color: 0x101b2c,
      roughness: 0.86,
      metalness: 0.1,
    });
    const road = new THREE.MeshStandardMaterial({
      color: 0x162b45,
      roughness: 0.75,
      metalness: 0.18,
    });
    const steel = new THREE.MeshStandardMaterial({
      color: 0x8b98a6,
      roughness: 0.34,
      metalness: 0.78,
    });
    const darkSteel = new THREE.MeshStandardMaterial({
      color: 0x253243,
      roughness: 0.5,
      metalness: 0.62,
    });
    const red = new THREE.MeshStandardMaterial({
      color: 0xd9483b,
      roughness: 0.6,
      metalness: 0.12,
    });
    const redDark = new THREE.MeshStandardMaterial({
      color: 0xa52f2b,
      roughness: 0.68,
      metalness: 0.1,
    });
    const white = new THREE.MeshStandardMaterial({
      color: 0xe9edf0,
      roughness: 0.72,
      metalness: 0.05,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x9ec9e8,
      roughness: 0.18,
      metalness: 0.2,
      transparent: true,
      opacity: 0.8,
    });
    const cyan = new THREE.MeshBasicMaterial({ color: 0x43d6e5 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xf0b45a });

    // Ground and road markings.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), navy);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);
    const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(60, 7), road);
    roadPlane.rotation.x = -Math.PI / 2;
    roadPlane.position.set(0, 0, 0.2);
    scene.add(roadPlane);
    for (const z of [-2.7, 2.9]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(60, 0.025, 0.055), cyan);
      line.position.set(0, 0.035, z);
      scene.add(line);
    }
    for (let i = -8; i <= 8; i += 1) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 0.055), amber);
      dash.position.set(i * 3.2, 0.035, 0.1);
      scene.add(dash);
    }

    // Portal / inspection frame from the reference.
    const portal = new THREE.Group();
    const postGeometry = new THREE.BoxGeometry(0.14, 3.1, 0.14);
    const leftPost = new THREE.Mesh(postGeometry, darkSteel);
    leftPost.position.set(-1.25, 1.55, -2.1);
    portal.add(leftPost);
    const rightPost = new THREE.Mesh(postGeometry, darkSteel);
    rightPost.position.set(1.25, 1.55, -2.1);
    portal.add(rightPost);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.16, 0.18), red);
    beam.position.set(0, 3.05, -2.1);
    portal.add(beam);
    portal.position.set(2.4, 0, -0.4);
    scene.add(portal);

    // Upright gear, blue part disc and a vertical gauge.
    const gear = makeGear(0.72, 18, 0.1, steel);
    gear.position.set(0.55, 0.78, 0.15);
    scene.add(gear);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.09, 40), cyan);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(-1.15, 0.12, 0.55);
    scene.add(disc);
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.35, 20), steel);
    gauge.position.set(1.45, 0.72, 0.25);
    scene.add(gauge);
    const gaugeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20), white);
    gaugeCap.position.set(1.45, 1.42, 0.25);
    scene.add(gaugeCap);

    // A small inspector figure with a moving caliper arm.
    const inspector = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0xd8ac86, roughness: 0.8 });
    const uniform = new THREE.MeshStandardMaterial({ color: 0xe58b4c, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skin);
    head.position.set(0, 1.55, 0);
    inspector.add(head);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), red);
    helmet.position.set(0, 1.66, 0);
    inspector.add(helmet);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.28), uniform);
    body.position.set(0, 1.05, 0);
    inspector.add(body);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.24), darkSteel);
    legs.position.set(0, 0.5, 0);
    inspector.add(legs);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.1), skin);
    arm.position.set(0.38, 1.18, 0);
    inspector.add(arm);
    const caliper = new THREE.Group();
    const caliperBar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.045, 0.045), white);
    caliper.add(caliperBar);
    for (const x of [-0.2, 0.16]) {
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.26, 0.045), white);
      jaw.position.x = x;
      caliper.add(jaw);
    }
    caliper.position.set(0.74, 1.18, 0);
    inspector.add(caliper);
    inspector.position.set(-2.2, 0, 0.3);
    inspector.scale.setScalar(0.82);
    scene.add(inspector);

    // Red container truck with a canvas-painted label.
    const truck = new THREE.Group();
    const container = new THREE.Mesh(new THREE.BoxGeometry(3.35, 1.72, 1.75), white);
    container.position.set(-0.85, 1.1, 0);
    truck.add(container);
    const labelTexture = makeContainerLabel();
    if (labelTexture) {
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(3.18, 1.56),
        new THREE.MeshBasicMaterial({
          map: labelTexture,
          side: THREE.DoubleSide,
          toneMapped: false,
        }),
      );
      label.position.set(-0.85, 1.1, 0.885);
      truck.add(label);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.07, 1.8), redDark);
    roof.position.set(-0.85, 1.99, 0);
    truck.add(roof);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.28, 1.6), red);
    cab.position.set(1.42, 0.9, 0);
    truck.add(cab);
    const windowPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.5), glass);
    windowPlane.position.set(1.42, 1.12, 0.81);
    truck.add(windowPlane);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.14, 1.66), redDark);
    bumper.position.set(1.42, 0.29, 0);
    truck.add(bumper);
    const wheels: THREE.Mesh[] = [];
    const wheelGeometry = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 20);
    for (const x of [-1.85, -0.35, 1.42]) {
      const wheel = new THREE.Mesh(wheelGeometry, darkSteel);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.36, 0.93);
      wheels.push(wheel);
      truck.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.26, 16), steel);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(x, 0.36, 0.95);
      truck.add(hub);
    }
    truck.position.set(-7, 0, 0.3);
    scene.add(truck);

    let targetProgress = 0;
    let currentProgress = 0;
    const section = document.getElementById("our-services");
    if (section?.dataset.progress) {
      targetProgress = clamp(Number(section.dataset.progress) || 0, 0, 1);
      currentProgress = targetProgress;
    }
    let targetAzimuth = 0;
    let azimuth = 0;
    let targetElevation = 0.15;
    let elevation = 0.15;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onService = (event: Event) => {
      const detail = (event as ServiceEvent).detail;
      if (typeof detail?.progress === "number")
        targetProgress = clamp(detail.progress, 0, 1);
    };
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      targetAzimuth += (event.clientX - lastX) * 0.006;
      targetElevation = clamp(
        targetElevation - (event.clientY - lastY) * 0.004,
        -0.18,
        0.55,
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        /* pointer already released */
      }
      canvas.style.cursor = "grab";
    };
    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };

    window.addEventListener("ar:services", onService);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.dataset.ready = "true";

    let frame = 0;
    let last = performance.now();
    let alive = true;
    const radius = 12;
    const tick = (now: number) => {
      if (!alive) return;
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      currentProgress += (targetProgress - currentProgress) * 0.09;
      azimuth += (targetAzimuth - azimuth) * 0.08;
      elevation += (targetElevation - elevation) * 0.08;

      truck.position.x = -7 + currentProgress * 14;
      wheels.forEach((wheel) => {
        wheel.rotation.z = -currentProgress * 18;
      });
      gear.rotation.z += dt * (0.45 + currentProgress * 1.4);
      disc.rotation.z -= dt * 0.35;
      arm.rotation.z = -0.25 + Math.sin(currentProgress * Math.PI) * 0.45;
      caliper.position.x = 0.72 + Math.sin(currentProgress * Math.PI) * 0.18;
      inspector.rotation.y = Math.sin(currentProgress * Math.PI * 2) * 0.12;

      camera.position.set(
        Math.sin(azimuth) * radius,
        2.7 + elevation * 3,
        Math.cos(azimuth) * radius,
      );
      camera.lookAt(target);
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
      observer.disconnect();
      window.removeEventListener("ar:services", onService);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      labelTexture?.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ssq-service-canvas"
      data-testid="service-journey-canvas"
      data-engine="three.js"
      aria-hidden="true"
    />
  );
}
