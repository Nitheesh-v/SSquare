import * as THREE from "three";

// ── Gear geometry: involute-approximated tooth profile ───────────────────────
export function createGearGeometry(
  teeth: number,
  rootRadius: number,
  tipRadius: number,
  depth: number,
  boreRatio = 0.32,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  const halfTooth = step * 0.19;

  for (let i = 0; i < teeth; i++) {
    const base = i * step;
    const pts: [number, number][] = [
      [base - halfTooth, rootRadius],
      [base - halfTooth * 0.3, tipRadius],
      [base + halfTooth * 0.3, tipRadius],
      [base + halfTooth, rootRadius],
    ];
    // Root fillet to next tooth
    if (i < teeth - 1) {
      pts.push([base + step - halfTooth, rootRadius]);
    }
    pts.forEach(([ang, r], j) => {
      const x = Math.cos(ang) * r,
        y = Math.sin(ang) * r;
      if (i === 0 && j === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();

  // Center bore
  const bore = new THREE.Path();
  bore.absarc(0, 0, rootRadius * boreRatio, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  // Lightening holes
  const nHoles = Math.min(6, Math.floor(teeth / 4));
  if (nHoles >= 3) {
    const holeR = rootRadius * (1 - boreRatio - 0.08) * 0.26;
    const holePitch = rootRadius * (boreRatio + 0.5) * 0.88;
    for (let i = 0; i < nHoles; i++) {
      const ha = (i / nHoles) * Math.PI * 2 + step * 0.5;
      const h = new THREE.Path();
      h.absarc(
        Math.cos(ha) * holePitch,
        Math.sin(ha) * holePitch,
        holeR,
        0,
        Math.PI * 2,
        true,
      );
      shape.holes.push(h);
    }
  }

  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.09,
    bevelSize: depth * 0.055,
    bevelSegments: 2,
  });
}

// ── 6-lobe elastomer spider shape ────────────────────────────────────────────
export function createElastomerSpiderGeometry(
  lobes = 6,
  outerR = 0.52,
  innerR = 0.17,
  depth = 0.13,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / lobes;
  const valleyR = innerR * 1.35;

  for (let i = 0; i < lobes; i++) {
    const a0 = i * step;
    const aMid = a0 + step * 0.5;
    const a1 = (i + 1) * step;

    const startX = Math.cos(a0 - step * 0.28) * valleyR;
    const startY = Math.sin(a0 - step * 0.28) * valleyR;
    if (i === 0) shape.moveTo(startX, startY);

    // Bezier out to lobe tip
    shape.bezierCurveTo(
      Math.cos(a0 + step * 0.05) * outerR * 0.6,
      Math.sin(a0 + step * 0.05) * outerR * 0.6,
      Math.cos(aMid - step * 0.18) * outerR,
      Math.sin(aMid - step * 0.18) * outerR,
      Math.cos(aMid) * outerR,
      Math.sin(aMid) * outerR,
    );
    // Bezier back to valley
    shape.bezierCurveTo(
      Math.cos(aMid + step * 0.18) * outerR,
      Math.sin(aMid + step * 0.18) * outerR,
      Math.cos(a1 - step * 0.05) * outerR * 0.6,
      Math.sin(a1 - step * 0.05) * outerR * 0.6,
      Math.cos(a1 - step * 0.28) * valleyR,
      Math.sin(a1 - step * 0.28) * valleyR,
    );
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.1,
    bevelSize: 0.011,
    bevelSegments: 3,
  });
}

// ── Radial cooling fin array ─────────────────────────────────────────────────
function buildFins(
  count: number,
  bodyRadius: number,
  height: number,
  finWidth: number,
  finDepth: number,
  mat: THREE.Material,
  yOffset = 0,
): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(finWidth, height, finDepth), mat);
    fin.position.set(
      Math.cos(angle) * (bodyRadius + finDepth * 0.5),
      yOffset,
      Math.sin(angle) * (bodyRadius + finDepth * 0.5),
    );
    fin.rotation.y = -angle;
    fin.castShadow = true;
    g.add(fin);
  }
  return g;
}

// ── Public assembly return type ───────────────────────────────────────────────
export interface EngineeringAssembly {
  root: THREE.Group;
  upperHousing: THREE.Group;
  lowerHousing: THREE.Group;
  gearTrain: THREE.Group;
  spiderCoupler: THREE.Group;
  rubberMounts: THREE.Group;
  sunGear: THREE.Mesh;
  planetGears: THREE.Mesh[];
  shaft: THREE.Mesh;
  coreLight: THREE.PointLight;
  calloutPositions: Array<{ id: string; label: string; world: THREE.Vector3 }>;
}

export interface AssemblyMaterials {
  aluminium: THREE.MeshStandardMaterial;
  aluminiumAccent: THREE.MeshStandardMaterial;
  steelHard: THREE.MeshStandardMaterial;
  steelSS: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  rubberRib: THREE.MeshStandardMaterial;
  bushing: THREE.MeshStandardMaterial;
}

// ── Main builder ──────────────────────────────────────────────────────────────
export function buildEngineeringAssembly(
  mats: AssemblyMaterials,
): EngineeringAssembly {
  const root = new THREE.Group();
  const { aluminium, aluminiumAccent, steelHard, steelSS, rubber, rubberRib, bushing } = mats;

  // ── UPPER ALUMINIUM HOUSING CAP ─────────────────────────────────────────
  const upperHousing = new THREE.Group();
  upperHousing.userData = {
    partId: "upper-housing",
    baseY: 0,
    explodeDelta: new THREE.Vector3(0, 1.55, 0),
  };

  const capBody = new THREE.Mesh(new THREE.CylinderGeometry(1.04, 1.1, 0.42, 48, 1), aluminium);
  capBody.position.y = 0.21;
  capBody.castShadow = true;
  capBody.receiveShadow = true;
  upperHousing.add(capBody);

  // Cyan accent ring
  const capRing = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.022, 8, 56), aluminiumAccent);
  capRing.rotation.x = Math.PI / 2;
  capRing.position.y = 0.0;
  upperHousing.add(capRing);

  // Top flange
  const topFlange = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.065, 48), aluminium);
  topFlange.position.y = 0.455;
  topFlange.castShadow = true;
  upperHousing.add(topFlange);

  // Cooling fins
  upperHousing.add(buildFins(18, 1.1, 0.34, 0.038, 0.21, aluminium, 0.21));

  // 8 perimeter bolts
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const boltShank = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8), steelSS);
    boltShank.position.set(Math.cos(a) * 1.14, 0.42, Math.sin(a) * 1.14);
    boltShank.castShadow = true;
    upperHousing.add(boltShank);
    const boltHead = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.028, 6), steelSS);
    boltHead.position.set(Math.cos(a) * 1.14, 0.49, Math.sin(a) * 1.14);
    upperHousing.add(boltHead);
  }

  root.add(upperHousing);

  // ── LOWER ALUMINIUM BASE FLANGE ─────────────────────────────────────────
  const lowerHousing = new THREE.Group();
  lowerHousing.userData = {
    partId: "lower-housing",
    baseY: 0,
    explodeDelta: new THREE.Vector3(0, -1.55, 0),
  };

  const baseBody = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.08, 0.5, 48, 1), aluminium);
  baseBody.position.y = -0.25;
  baseBody.castShadow = true;
  baseBody.receiveShadow = true;
  lowerHousing.add(baseBody);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.022, 8, 56), aluminiumAccent);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.0;
  lowerHousing.add(baseRing);

  // Base mounting plate
  const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.078, 48), aluminium);
  basePlate.position.y = -0.54;
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  lowerHousing.add(basePlate);

  lowerHousing.add(buildFins(18, 1.08, 0.38, 0.038, 0.21, aluminium, -0.21));

  root.add(lowerHousing);

  // ── PLANETARY GEAR TRAIN ─────────────────────────────────────────────────
  const gearTrain = new THREE.Group();
  gearTrain.userData = {
    partId: "gear-train",
    baseY: 0,
    explodeDelta: new THREE.Vector3(0, 0.5, 0),
  };

  // Ring gear shell
  const ringGear = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.075, 10, 56), steelHard);
  ringGear.rotation.x = Math.PI / 2;
  ringGear.castShadow = true;
  gearTrain.add(ringGear);

  // Carrier discs (top + bottom)
  for (const y of [0.11, -0.11]) {
    const carrier = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.038, 36), steelSS);
    carrier.position.y = y;
    carrier.castShadow = true;
    gearTrain.add(carrier);
  }

  // Sun gear (16 teeth)
  const sunGeoData = createGearGeometry(16, 0.21, 0.295, 0.17);
  const sunGear = new THREE.Mesh(sunGeoData, steelHard);
  sunGear.rotation.x = Math.PI / 2;
  sunGear.castShadow = true;
  gearTrain.add(sunGear);

  // Central shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.65, 16), steelSS);
  shaft.castShadow = true;
  gearTrain.add(shaft);

  // 4 Planet pinions (12 teeth, counter-rotating)
  const planetGears: THREE.Mesh[] = [];
  const PLANET_R = 0.57;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const pGeo = createGearGeometry(12, 0.155, 0.218, 0.17);
    const planet = new THREE.Mesh(pGeo, steelHard);
    planet.rotation.x = Math.PI / 2;
    planet.position.set(Math.cos(a) * PLANET_R, 0, Math.sin(a) * PLANET_R);
    planet.castShadow = true;
    planet.userData = { orbitAngle: a, orbitRadius: PLANET_R };
    planetGears.push(planet);
    gearTrain.add(planet);

    // Phosphor-bronze bushing
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.22, 10), bushing);
    pin.position.set(Math.cos(a) * PLANET_R, 0, Math.sin(a) * PLANET_R);
    gearTrain.add(pin);
  }

  root.add(gearTrain);

  // ── ELASTOMER SPIDER COUPLER ─────────────────────────────────────────────
  const spiderCoupler = new THREE.Group();
  spiderCoupler.userData = {
    partId: "spider-coupler",
    baseY: 0,
    explodeDelta: new THREE.Vector3(0, -0.95, 0),
  };

  const spiderGeo = createElastomerSpiderGeometry(6, 0.5, 0.165, 0.13);
  const spider = new THREE.Mesh(spiderGeo, rubber);
  spider.rotation.x = Math.PI / 2;
  spider.position.y = -0.62;
  spider.castShadow = true;
  spiderCoupler.add(spider);

  // Dual-lip hydraulic seals + O-rings
  for (const yPos of [-0.555, -0.69]) {
    const seal = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.027, 10, 56), rubber);
    seal.rotation.x = Math.PI / 2;
    seal.position.y = yPos;
    spiderCoupler.add(seal);
    const oring = new THREE.Mesh(new THREE.TorusGeometry(0.375, 0.011, 8, 56), rubberRib);
    oring.rotation.x = Math.PI / 2;
    oring.position.y = yPos;
    spiderCoupler.add(oring);
  }

  root.add(spiderCoupler);

  // ── RUBBER ANTI-VIBRATION MOUNTS ─────────────────────────────────────────
  const rubberMounts = new THREE.Group();
  rubberMounts.userData = {
    partId: "rubber-mounts",
    baseY: 0,
    explodeDelta: new THREE.Vector3(0, -2.0, 0),
  };

  const MOUNT_POS = [
    new THREE.Vector3(-0.88, -0.72, -0.88),
    new THREE.Vector3(0.88, -0.72, -0.88),
    new THREE.Vector3(-0.88, -0.72, 0.88),
    new THREE.Vector3(0.88, -0.72, 0.88),
  ];
  MOUNT_POS.forEach((pos) => {
    const mg = new THREE.Group();
    mg.position.copy(pos);

    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.25, 12), rubber);
    core.castShadow = true;
    mg.add(core);

    // 3 compression ribs
    for (let r = 0; r < 3; r++) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.015, 6, 24), rubberRib);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = -0.088 + r * 0.088;
      mg.add(rib);
    }

    // SS stud + nut
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), steelSS);
    mg.add(stud);
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.024, 6), steelSS);
    nut.position.y = 0.21;
    mg.add(nut);

    rubberMounts.add(mg);
  });

  root.add(rubberMounts);

  // ── INTERNAL CORE LIGHT ──────────────────────────────────────────────────
  const coreLight = new THREE.PointLight(0x00f5ff, 0, 2.5);
  coreLight.position.set(0, 0, 0);
  root.add(coreLight);

  // ── CALLOUT ANCHOR POSITIONS ──────────────────────────────────────────────
  const calloutPositions = [
    { id: "upper-housing", label: "6061-T6 Aluminium\nHousing Cap", world: new THREE.Vector3(1.3, 0.45, 0) },
    { id: "gear-train", label: "EN24 Steel\nPlanetary Gears", world: new THREE.Vector3(0.75, 0.0, 0) },
    { id: "spider-coupler", label: "EPDM Elastomer\nSpider Coupler", world: new THREE.Vector3(-1.0, -0.62, 0) },
    { id: "rubber-mounts", label: "NBR Anti-Vibration\nMounts", world: new THREE.Vector3(1.0, -0.9, 0.9) },
    { id: "lower-housing", label: "CNC Aluminium\nBase Flange", world: new THREE.Vector3(-1.35, -0.38, 0) },
    { id: "shaft", label: "SS316L Splined\nOutput Shaft", world: new THREE.Vector3(0.1, 1.0, 0) },
  ];

  return {
    root,
    upperHousing,
    lowerHousing,
    gearTrain,
    spiderCoupler,
    rubberMounts,
    sunGear,
    planetGears,
    shaft: shaft as THREE.Mesh,
    coreLight,
    calloutPositions,
  };
}
