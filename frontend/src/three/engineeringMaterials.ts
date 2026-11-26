import * as THREE from "three";

export interface EngineeringMaterials {
  aluminium: THREE.MeshStandardMaterial;
  aluminiumAccent: THREE.MeshStandardMaterial;
  steelHard: THREE.MeshStandardMaterial;
  steelSS: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  rubberRib: THREE.MeshStandardMaterial;
  bushing: THREE.MeshStandardMaterial;
}

/** Create all PBR materials for the SSQ-9400 assembly. */
export function createEngineeringMaterials(): EngineeringMaterials {
  return {
    // 6061-T6 Aluminium: brushed satin, cyan anodized
    aluminium: new THREE.MeshStandardMaterial({
      color: 0xb2bec8,
      metalness: 0.84,
      roughness: 0.23,
    }),
    aluminiumAccent: new THREE.MeshStandardMaterial({
      color: 0x00e8f5,
      metalness: 0.72,
      roughness: 0.28,
      emissive: new THREE.Color(0x003a4a),
      emissiveIntensity: 0.45,
    }),
    // EN24 Hardened Steel: very high metalness, low roughness
    steelHard: new THREE.MeshStandardMaterial({
      color: 0x7a8a94,
      metalness: 0.96,
      roughness: 0.11,
    }),
    // SS316L Stainless: crisp specular
    steelSS: new THREE.MeshStandardMaterial({
      color: 0xc4d0d8,
      metalness: 0.94,
      roughness: 0.14,
    }),
    // Vulcanized Rubber (EPDM): low metalness, matte
    rubber: new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      metalness: 0.06,
      roughness: 0.73,
    }),
    rubberRib: new THREE.MeshStandardMaterial({
      color: 0x282828,
      metalness: 0.06,
      roughness: 0.78,
    }),
    // Phosphor-bronze bushing
    bushing: new THREE.MeshStandardMaterial({
      color: 0xc87832,
      metalness: 0.78,
      roughness: 0.28,
    }),
  };
}

/**
 * Build a procedural studio HDR environment using PMREMGenerator.
 * Returns a CubeRenderTarget texture — zero external downloads.
 */
export function createStudioEnvironment(
  renderer: THREE.WebGLRenderer,
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileCubemapShader();

  // Build a minimal virtual light-tent scene
  const envScene = new THREE.Scene();

  // Ceiling-like background
  envScene.background = new THREE.Color(0x0a1520);

  // Overhead tungsten warm fill
  const overhead = new THREE.PointLight(0xfff0cc, 6, 25);
  overhead.position.set(0, 10, 0);
  envScene.add(overhead);

  // Cyan rim (left-rear)
  const rimCyan = new THREE.PointLight(0x00e8f5, 3.5, 20);
  rimCyan.position.set(-7, 2, 5);
  envScene.add(rimCyan);

  // Warm amber softbox (right-front)
  const softAmber = new THREE.PointLight(0xf97316, 2.5, 20);
  softAmber.position.set(6, 3, -4);
  envScene.add(softAmber);

  // Cool backlight
  const backlight = new THREE.PointLight(0x4488cc, 1.5, 15);
  backlight.position.set(0, -4, -8);
  envScene.add(backlight);

  // Ambient
  envScene.add(new THREE.AmbientLight(0x334466, 1.0));

  const rt = pmrem.fromScene(envScene, 0.03);
  pmrem.dispose();
  return rt.texture;
}

/** Dispose all materials in the set. */
export function disposeEngineeringMaterials(mats: EngineeringMaterials): void {
  Object.values(mats).forEach((m) => m.dispose());
}
