import * as THREE from 'three';

/**
 * createStudioEnvironment()
 * -------------------------
 * Builds a virtual 3D studio light-tent (overhead tungsten softbox, cyan rim
 * strip, warm amber strip and a soft frontal fill), then bakes it into a
 * cubemap reflection texture with THREE.PMREMGenerator.
 *
 * Zero external image downloads — the HDR environment is generated in code on
 * startup, giving realistic metallic reflections for the PBR materials.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();

  // ---- Light-tent shell -------------------------------------------------
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(24, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x0a0d12, side: THREE.BackSide }),
  );
  envScene.add(shell);

  const addStrip = (
    w: number,
    h: number,
    color: number,
    intensity: number,
    position: [number, number, number],
    rotation: [number, number, number],
  ) => {
    const mat = new THREE.MeshBasicMaterial({ color });
    mat.color.multiplyScalar(intensity);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    envScene.add(mesh);
  };

  // Overhead tungsten softbox (warm key).
  addStrip(10, 4, 0xffe7c2, 6.0, [0, 11, 0], [-Math.PI / 2, 0, 0]);
  addStrip(4, 10, 0xffd9a0, 3.2, [0, 11, -6], [-Math.PI / 2, 0, 0]);

  // Cyan rim strip (left).
  addStrip(3, 14, 0x00f0ff, 3.4, [-11.5, 1, 0], [0, Math.PI / 2, 0]);

  // Warm amber strip (right).
  addStrip(3, 14, 0xf97316, 2.6, [11.5, 1, 0], [0, -Math.PI / 2, 0]);

  // Soft frontal fill + subtle floor bounce.
  addStrip(12, 6, 0xdfe9f2, 1.6, [0, 2, 11.5], [0, Math.PI, 0]);
  addStrip(16, 16, 0x2c3440, 1.1, [0, -11.5, 0], [Math.PI / 2, 0, 0]);

  // Cool back kicker for edge separation.
  addStrip(8, 3, 0x8ab4c8, 1.8, [0, 4, -11.5], [0, 0, 0]);

  const texture = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  // The tent geometry is fully consumed by PMREM — free it immediately.
  envScene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | undefined;
    if (mat) mat.dispose();
  });

  return texture;
}
