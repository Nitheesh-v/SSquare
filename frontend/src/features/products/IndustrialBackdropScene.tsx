"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { heroScrollProgress } from "./hero-depth";

type SceneProps = {
  root: RefObject<HTMLElement | null>;
  onReady: () => void;
  onUnavailable: () => void;
};

/** A replaceable gear study, not S Square CAD or a dimensioned production part. */
function gearShape(radius: number, teeth: number, perforated: boolean) {
  const shape = new THREE.Shape();
  for (let tooth = 0; tooth < teeth; tooth++) {
    for (const [step, height] of [
      [0, 0.88],
      [0.17, 0.88],
      [0.28, 1],
      [0.65, 1],
      [0.77, 0.88],
      [1, 0.88],
    ]) {
      const angle = ((tooth + step) / teeth) * Math.PI * 2;
      const x = Math.cos(angle) * radius * height;
      const y = Math.sin(angle) * radius * height;
      if (!tooth && !step) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  }
  shape.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, radius * 0.2, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  if (perforated)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const hole = new THREE.Path();
      hole.absarc(
        Math.cos(angle) * radius * 0.55,
        Math.sin(angle) * radius * 0.55,
        radius * 0.14,
        0,
        Math.PI * 2,
        true,
      );
      shape.holes.push(hole);
    }
  return shape;
}

export default function IndustrialBackdropScene({
  root,
  onReady,
  onUnavailable,
}: SceneProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    const scrollRoot = root.current;
    if (!host || !scrollRoot) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const canvas = document.createElement("canvas");
    canvas.dataset.testid = "hero-depth-canvas";
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: !mobile,
      failIfMajorPerformanceCaveat: true,
    });
    if (!context) {
      onUnavailable();
      return;
    }
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: !mobile,
        powerPreference: "low-power",
      });
    } catch {
      onUnavailable();
      return;
    }
    host.appendChild(canvas);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6),
    );
    renderer.setClearColor(0x0b1019, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 70);
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, 0.035);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xdceaf5, 0x182431, 1.3));
    const key = new THREE.DirectionalLight(0xdceeff, 4.2);
    key.position.set(2, 5, 7);
    scene.add(key);
    const edge = new THREE.DirectionalLight(0x8db5dd, 3.6);
    edge.position.set(-4, -1, 3);
    scene.add(edge);
    const warm = new THREE.DirectionalLight(0xff9e58, 3.5);
    warm.position.set(5, 0, -1);
    scene.add(warm);

    const metal = new THREE.MeshStandardMaterial({
      color: 0x7d8a96,
      metalness: 0.98,
      roughness: 0.29,
    });
    const polished = new THREE.MeshStandardMaterial({
      color: 0xc6d0d8,
      metalness: 1,
      roughness: 0.21,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x1a2735,
      metalness: 0.85,
      roughness: 0.37,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0xaf592b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const assembly = new THREE.Group();
    scene.add(assembly);
    const makeGear = (
      radius: number,
      teeth: number,
      thickness: number,
      perforated = true,
    ) => {
      const group = new THREE.Group();
      const options = {
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: 0.026,
        bevelSize: 0.025,
        bevelSegments: mobile ? 1 : 2,
        steps: 1,
        curveSegments: mobile ? 12 : 22,
      };
      const geometry = new THREE.ExtrudeGeometry(
        gearShape(radius, teeth, perforated),
        options,
      );
      geometry.translate(0, 0, -thickness / 2);
      group.add(new THREE.Mesh(geometry, [metal, polished]));
      const hubShape = new THREE.Shape();
      hubShape.absarc(0, 0, radius * 0.31, 0, Math.PI * 2, false);
      const inner = new THREE.Path();
      inner.absarc(0, 0, radius * 0.2, 0, Math.PI * 2, true);
      hubShape.holes.push(inner);
      const hub = new THREE.Mesh(
        new THREE.ExtrudeGeometry(hubShape, {
          ...options,
          depth: thickness * 1.25,
        }),
        polished,
      );
      hub.position.z = -thickness * 0.12;
      group.add(hub);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 0.74, 0.012, 4, mobile ? 64 : 100),
        dark,
      );
      ring.position.z = thickness / 2 + 0.029;
      group.add(ring);
      const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 0.325, 0.012, 4, mobile ? 32 : 64),
        accent,
      );
      innerRing.position.z = thickness * 1.13;
      group.add(innerRing);
      assembly.add(group);
      return group;
    };
    const large = makeGear(2.7, mobile ? 32 : 40, 0.56);
    large.position.set(0.1, 0.55, 0.3);
    const lower = makeGear(1.7, mobile ? 20 : 26, 0.45, false);
    lower.position.set(3.47, -1.87, -0.04);
    const rear = makeGear(1.95, mobile ? 24 : 30, 0.42);
    rear.position.set(-2.55, -2.65, -0.85);

    const orbit = new THREE.Group();
    assembly.add(orbit);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6488a3,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    for (const radius of [3.14, 3.28]) {
      const points = Array.from({ length: 101 }, (_, i) => {
        const angle = (i / 100) * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          -0.5,
        );
      });
      orbit.add(
        new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          lineMaterial,
        ),
      );
    }
    orbit.position.set(0.1, 0.55, 0);

    let disposed = false;
    let visible = true;
    let frame = 0;
    let reportedReady = false;
    let renders = 0;
    const render = () => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const p = heroScrollProgress(scrollRoot);
      const wide = camera.aspect > 1.2;
      // Camera dollies forward and around a genuinely extruded gear assembly.
      camera.position.set(p * 0.65, 0.18 + p * 0.45, 14.6 - p * 2.5);
      camera.lookAt(0, 0, 0);
      assembly.position.set(
        wide ? 3.55 - p * 0.6 : 1.45 - p * 0.2,
        wide ? 0.25 : 1.4,
        -0.3,
      );
      assembly.rotation.set(
        -0.18 + p * 0.22,
        -0.32 + p * 0.65,
        -0.24 + p * 0.14,
      );
      large.rotation.z = -p * Math.PI * 0.42;
      lower.rotation.z = 0.12 + p * Math.PI * 0.42 * (40 / 26);
      rear.rotation.z = 0.03 + p * Math.PI * 0.42 * (40 / 30);
      rear.position.z = -0.85 - p * 0.3;
      warm.intensity = 3.5 + p * 2;
      renderer.render(scene, camera);
      canvas.dataset.scrollProgress = p.toFixed(4);
      canvas.dataset.renderCount = String(++renders);
      if (!reportedReady) {
        reportedReady = true;
        onReady();
      }
    };
    const schedule = () => {
      if (!frame && visible && !disposed && !document.hidden)
        frame = requestAnimationFrame(render);
    };
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height || disposed) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    canvas.addEventListener("webglcontextlost", lost);
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", schedule);
      canvas.removeEventListener("webglcontextlost", lost);
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line)
          geometries.add(child.geometry);
      });
      geometries.forEach((geometry) => geometry.dispose());
      [metal, polished, dark, accent, lineMaterial].forEach((material) =>
        material.dispose(),
      );
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [root, onReady, onUnavailable]);

  return <div ref={container} className="hero-webgl-scene" />;
}
