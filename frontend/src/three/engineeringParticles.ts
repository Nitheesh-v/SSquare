import * as THREE from "three";

const PARTICLE_COUNT = 96;

/** Single GPU draw-call floating telemetry particles via InstancedMesh. */
export function createTelemetryParticles(): {
  mesh: THREE.InstancedMesh;
  update: (time: number, explodeProgress: number) => void;
  dispose: () => void;
} {
  const geo = new THREE.SphereGeometry(0.013, 4, 3);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00e8f5,
    transparent: true,
    opacity: 0.72,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, PARTICLE_COUNT);
  mesh.frustumCulled = false;

  // Seed per-particle data once
  const seeds = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    theta: Math.random() * Math.PI * 2,
    phi: Math.random() * Math.PI,
    r: 0.7 + Math.random() * 1.5,
    speed: 0.18 + Math.random() * 0.55,
    phase: (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4,
    yDrift: (Math.random() - 0.5) * 1.4,
    size: 0.5 + Math.random() * 0.9,
  }));

  const dummy = new THREE.Object3D();

  const update = (time: number, explodeProgress: number) => {
    const spread = 1.0 + explodeProgress * 2.4;
    seeds.forEach((s, i) => {
      const t = time * s.speed + s.phase;
      const theta = s.theta + t * 0.3;
      const phi = s.phi + Math.sin(t * 0.4) * 0.3;
      const r = s.r * spread;

      dummy.position.set(
        Math.sin(phi) * Math.cos(theta) * r,
        Math.cos(phi) * r * 0.6 + s.yDrift * explodeProgress,
        Math.sin(phi) * Math.sin(theta) * r,
      );
      const scale = s.size * (0.55 + Math.sin(t * 2.2) * 0.28);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Fade outer particles
      const alpha = Math.max(0.1, 1.0 - (r / 4.5) * explodeProgress);
      mesh.setColorAt(i, new THREE.Color().setHSL(0.52, 0.9, 0.55 * alpha));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  const dispose = () => {
    geo.dispose();
    mat.dispose();
  };

  return { mesh, update, dispose };
}
