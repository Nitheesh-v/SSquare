"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface AluminiumScrollSceneProps {
  progress: RefObject<number>;
  onUnavailable: () => void;
  onReady: () => void;
  cadModelUrl?: string;
}

// Deliberately illustrative: no production dimensions or tolerances are implied.
function profileShape() {
  const points = [
    [-0.84, -0.84],
    [-0.2, -0.84],
    [-0.2, -0.68],
    [-0.42, -0.68],
    [-0.42, -0.48],
    [0.42, -0.48],
    [0.42, -0.68],
    [0.2, -0.68],
    [0.2, -0.84],
    [0.84, -0.84],
    [0.84, -0.2],
    [0.68, -0.2],
    [0.68, -0.42],
    [0.48, -0.42],
    [0.48, 0.42],
    [0.68, 0.42],
    [0.68, 0.2],
    [0.84, 0.2],
    [0.84, 0.84],
    [0.2, 0.84],
    [0.2, 0.68],
    [0.42, 0.68],
    [0.42, 0.48],
    [-0.42, 0.48],
    [-0.42, 0.68],
    [-0.2, 0.68],
    [-0.2, 0.84],
    [-0.84, 0.84],
    [-0.84, 0.2],
    [-0.68, 0.2],
    [-0.68, 0.42],
    [-0.48, 0.42],
    [-0.48, -0.42],
    [-0.68, -0.42],
    [-0.68, -0.2],
    [-0.84, -0.2],
  ];
  const shape = new THREE.Shape(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
  );
  shape.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.31, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  for (const x of [-0.65, 0.65])
    for (const y of [-0.65, 0.65]) {
      const hole = new THREE.Path();
      hole.absarc(x, y, 0.085, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  return shape;
}

function collarShape() {
  const shape = new THREE.Shape();
  const radius = 1.08;
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 8 + (i * Math.PI) / 4;
    const x = Math.cos(angle) * radius,
      y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.44, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  for (const x of [-0.65, 0.65])
    for (const y of [-0.65, 0.65]) {
      const hole = new THREE.Path();
      hole.absarc(x, y, 0.115, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  return shape;
}

const smooth = (value: number, from: number, to: number) =>
  THREE.MathUtils.smoothstep(value, from, to);

export default function AluminiumScrollScene({
  progress,
  onUnavailable,
  onReady,
  cadModelUrl = "",
}: AluminiumScrollSceneProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const canvas = document.createElement("canvas");
    // Preflight without asking Three.js to log errors on unsupported devices.
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
        powerPreference: mobile ? "low-power" : "high-performance",
      });
    } catch {
      onUnavailable();
      return;
    }
    host.appendChild(canvas);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.75),
    );
    renderer.setClearColor(0x101925, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x172333, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa3d5ff, 2);
    rim.position.set(-4, 2, -4);
    scene.add(rim);
    const warm = new THREE.DirectionalLight(0xffa15a, 1.5);
    warm.position.set(3, -2, 1);
    scene.add(warm);

    const assembly = new THREE.Group();
    scene.add(assembly);
    const procedural = new THREE.Group();
    assembly.add(procedural);
    const surfaces: THREE.Material[] = [];
    const edges: THREE.LineBasicMaterial[] = [];
    const silver = new THREE.MeshStandardMaterial({
      color: 0xd3dce6,
      metalness: 0.96,
      roughness: 0.27,
      transparent: true,
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x687889,
      metalness: 0.88,
      roughness: 0.3,
      transparent: true,
    });
    surfaces.push(silver, darkMetal);
    const segments = mobile ? 16 : 28;
    const options = {
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.012,
      bevelSegments: mobile ? 1 : 2,
      curveSegments: segments,
    };
    const addPart = (
      geometry: THREE.BufferGeometry,
      material: THREE.Material = silver,
    ) => {
      const part = new THREE.Mesh(geometry, material);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0xaad9ec,
        transparent: true,
        opacity: 0.09,
        depthWrite: false,
      });
      edges.push(edgeMaterial);
      part.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry, 26),
          edgeMaterial,
        ),
      );
      procedural.add(part);
      return part;
    };
    const body = addPart(
      new THREE.ExtrudeGeometry(profileShape(), { ...options, depth: 2.8 }),
    );
    body.position.z = -1.4;
    const collar = addPart(
      new THREE.ExtrudeGeometry(collarShape(), { ...options, depth: 0.25 }),
    );
    collar.position.z = 1.42;
    const sleeveShape = new THREE.Shape();
    sleeveShape.absarc(0, 0, 0.432, 0, Math.PI * 2, false);
    const sleeveHole = new THREE.Path();
    sleeveHole.absarc(0, 0, 0.312, 0, Math.PI * 2, true);
    sleeveShape.holes.push(sleeveHole);
    const sleeve = addPart(
      new THREE.ExtrudeGeometry(sleeveShape, { ...options, depth: 0.7 }),
      darkMetal,
    );
    sleeve.position.z = 1.05;
    const fasteners: THREE.Mesh[] = [];
    for (const x of [-0.65, 0.65])
      for (const y of [-0.65, 0.65]) {
        const screw = addPart(
          new THREE.CylinderGeometry(0.092, 0.092, 0.42, mobile ? 8 : 12),
          darkMetal,
        );
        screw.rotation.x = Math.PI / 2;
        screw.position.set(x, y, 1.62);
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.12, 6),
          darkMetal,
        );
        head.position.y = 0.22;
        screw.add(head);
        fasteners.push(screw);
      }
    // A second cap gives the profile an identifiable rear machined face.
    const rear = addPart(
      new THREE.ExtrudeGeometry(collarShape(), { ...options, depth: 0.16 }),
    );
    rear.position.z = -1.58;
    const datums = new THREE.Group();
    assembly.add(datums);
    const datumMaterial = new THREE.LineBasicMaterial({
      color: 0xfb923c,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    for (const z of [-1.85, 2]) {
      const points = Array.from(
        { length: 65 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 64) * Math.PI * 2) * 1.38,
            Math.sin((i / 64) * Math.PI * 2) * 1.38,
            z,
          ),
      );
      datums.add(
        new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          datumMaterial,
        ),
      );
    }
    const axisMaterial = new THREE.LineDashedMaterial({
      color: 0x98b9cf,
      dashSize: 0.09,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.25,
    });
    const axis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -3),
        new THREE.Vector3(0, 0, 3.6),
      ]),
      axisMaterial,
    );
    axis.computeLineDistances();
    datums.add(axis);

    let disposed = false;
    let customModel: THREE.Group | undefined;
    const disposeObject = (object: THREE.Object3D) => {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      object.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          geometries.add(child.geometry);
          for (const material of Array.isArray(child.material)
            ? child.material
            : [child.material]) {
            materials.add(material);
            for (const value of Object.values(material))
              if (value instanceof THREE.Texture) textures.add(value);
          }
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
    };
    if (cadModelUrl) {
      // Replacement hook: same-origin optimized GLB exported from the real CAD.
      import("three/addons/loaders/GLTFLoader.js")
        .then(({ GLTFLoader }) => new GLTFLoader().loadAsync(cadModelUrl))
        .then((gltf) => {
          if (disposed) {
            disposeObject(gltf.scene);
            return;
          }
          const model = gltf.scene;
          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          model.position.sub(bounds.getCenter(new THREE.Vector3()));
          const normalized = new THREE.Group();
          normalized.add(model);
          normalized.scale.setScalar(
            3.8 / Math.max(size.x, size.y, size.z, 0.001),
          );
          model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((material) => {
              material.transparent = true;
              surfaces.push(material);
            });
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0xaad9ec,
              transparent: true,
              opacity: 0.1,
              depthWrite: false,
            });
            edges.push(lineMaterial);
            child.add(
              new THREE.LineSegments(
                new THREE.EdgesGeometry(child.geometry, 30),
                lineMaterial,
              ),
            );
          });
          customModel = normalized;
          assembly.add(normalized);
          procedural.visible = false;
          dirty = true;
        })
        .catch(() => {
          // Keep the explicitly labelled concept model if the replacement cannot load.
        });
    }

    let frame = 0,
      dirty = true,
      previousProgress = -1,
      visible = false,
      reportedReady = false;
    const resize = () => {
      if (disposed) return;
      const width = host.clientWidth,
        height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const distance = camera.aspect < 0.9 ? 13 : mobile ? 10.8 : 10.6;
      camera.position.set(distance * 0.55, distance * 0.32, distance * 0.72);
      camera.lookAt(0, 0, 0.1);
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const render = () => {
      if (disposed || !visible || document.hidden) {
        frame = 0;
        return;
      }
      const p = THREE.MathUtils.clamp(progress.current, 0, 1);
      if (dirty || Math.abs(p - previousProgress) > 0.0001) {
        const explode = smooth(p, 0.37, 0.68) * (1 - smooth(p, 0.86, 1) * 0.45);
        const cad = smooth(p, 0.72, 0.97);
        assembly.rotation.set(
          -0.24 + Math.sin(p * Math.PI) * 0.17,
          -0.45 + p * Math.PI * 1.24,
          -0.18 + p * 0.1,
        );
        assembly.position.set(0, -0.02, -0.12 - explode * 0.3);
        collar.position.z = 1.42 + explode * 0.92;
        sleeve.position.z = 1.05 + explode * 1.9;
        fasteners.forEach((screw) => {
          screw.position.z = 1.62 + explode * 1.44;
        });
        rear.position.z = -1.58 - explode * 0.55;
        datums.visible = p > 0.12;
        datumMaterial.opacity = 0.1 + explode * 0.4 + cad * 0.2;
        axisMaterial.opacity = 0.08 + explode * 0.4;
        surfaces.forEach((material) => {
          material.opacity = 1 - cad * 0.79;
          material.depthWrite = cad < 0.65;
        });
        edges.forEach((material) => {
          material.opacity = 0.1 + cad * 0.8;
        });
        if (customModel) customModel.rotation.y = 0;
        renderer.render(scene, camera);
        previousProgress = p;
        dirty = false;
        if (!reportedReady) {
          reportedReady = true;
          onReady();
        }
      }
      frame = requestAnimationFrame(render);
    };
    const restart = () => {
      if (visible && !document.hidden && !frame && !disposed) {
        dirty = true;
        frame = requestAnimationFrame(render);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) restart();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    canvas.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", restart);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", restart);
      disposeObject(scene);
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [progress, onUnavailable, onReady, cadModelUrl]);
  return <div ref={container} className="story-scene" aria-hidden="true" />;
}
