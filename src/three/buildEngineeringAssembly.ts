import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Part registry                                                      */
/* ------------------------------------------------------------------ */

export type PartId =
  | 'gear-train'
  | 'coupler'
  | 'housing'
  | 'mounts'
  | 'seals'
  | 'bushings'
  | 'shaft';

/** A sub-assembly that slides along `delta` as the exploded view opens. */
export interface Mover {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  delta: THREE.Vector3;
}

export interface Assembly {
  root: THREE.Group;
  movers: Mover[];
  /** 3D anchors for the spatial callout pins (6 pins). */
  pinAnchors: THREE.Object3D[];
  partGroups: Record<PartId, THREE.Group[]>;
  coreLight: THREE.PointLight;
  /** Continuous-kinematics handles. */
  gearParts: {
    sun: THREE.Group;
    carrier: THREE.Group;
    planets: THREE.Group[];
  };
  mounts: THREE.Group[];
  /** Apply the exploded-view progress (0 = assembled, 1 = fully exploded). */
  setExplode(p: number): void;
  /** Advance mechanical animations. */
  tick(
    t: number,
    dt: number,
    opts: { gearSpeed: number; vibration: number },
  ): void;
}

/* ------------------------------------------------------------------ */
/*  PBR material factories (fresh instances per part group so          */
/*  per-part emissive highlighting never bleeds across sub-assemblies) */
/* ------------------------------------------------------------------ */

function markGlow<T extends THREE.MeshStandardMaterial>(mat: T, glow: number): T {
  mat.userData.glow = new THREE.Color(glow);
  mat.userData.restEmissive = mat.emissiveIntensity;
  return mat;
}

/** 6061-T6 brushed aluminium — high metalness, satin roughness. */
function aluminiumMat(accent = false): THREE.MeshStandardMaterial {
  return markGlow(
    new THREE.MeshStandardMaterial({
      color: accent ? 0x00f0ff : 0x96a0ab,
      metalness: accent ? 0.55 : 0.84,
      roughness: accent ? 0.32 : 0.23,
      envMapIntensity: 1.05,
      emissive: new THREE.Color(accent ? 0x00f0ff : 0x000000),
      emissiveIntensity: accent ? 0.35 : 0,
    }),
    0x00f0ff,
  );
}

/** Open extruded shells need backface visibility. */
function aluminiumShellMat(): THREE.MeshStandardMaterial {
  const mat = aluminiumMat();
  mat.side = THREE.DoubleSide;
  return mat;
}

/** EN24 / SS316L hardened steel — crisp specular highlights. */
function steelMat(): THREE.MeshStandardMaterial {
  return markGlow(
    new THREE.MeshStandardMaterial({
      color: 0xc7ced8,
      metalness: 0.96,
      roughness: 0.12,
      envMapIntensity: 1.15,
    }),
    0x00f0ff,
  );
}

function stainlessMat(): THREE.MeshStandardMaterial {
  return markGlow(
    new THREE.MeshStandardMaterial({
      color: 0xb9c2cc,
      metalness: 0.94,
      roughness: 0.15,
      envMapIntensity: 1.1,
    }),
    0x00f0ff,
  );
}

/** Phosphor-bronze bushings. */
function bronzeMat(): THREE.MeshStandardMaterial {
  return markGlow(
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.8,
      roughness: 0.35,
      envMapIntensity: 1.0,
    }),
    0xf97316,
  );
}

/** EPDM / Viton / NBR vulcanized rubber — matte, light-scattering. */
function rubberMat(roughness = 0.78): THREE.MeshStandardMaterial {
  return markGlow(
    new THREE.MeshStandardMaterial({
      color: 0x16181c,
      metalness: 0.06,
      roughness,
      envMapIntensity: 0.6,
    }),
    0xf97316,
  );
}

/* ------------------------------------------------------------------ */
/*  createGearGeometry() — extruded involute-style steel gears          */
/*  2D tooth profile via THREE.Shape, bores + radial lightening holes   */
/*  cut with THREE.Path, extruded with chamfered bevels.               */
/* ------------------------------------------------------------------ */

export interface GearOptions {
  teeth: number;
  tipR: number;
  rootR: number;
  boreR: number;
  thickness: number;
  /** Number of radial lightening holes (0 = solid gear). */
  holes?: number;
  holeR?: number;
  holeCircleR?: number;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function createGearGeometry(opts: GearOptions): THREE.ExtrudeGeometry {
  const { teeth, tipR, rootR, boreR, thickness } = opts;
  const shape = new THREE.Shape();
  const segments = teeth * 8;

  // Tooth flank profile: smooth trapezoid around each tooth pitch.
  const tipWidth = 0.34;
  const flank = 0.11;

  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const phase = ((i / segments) * teeth) % 1;
    let profile: number;
    if (phase < 0.5 - tipWidth / 2 - flank) profile = 0;
    else if (phase < 0.5 - tipWidth / 2)
      profile = smoothstep(0.5 - tipWidth / 2 - flank, 0.5 - tipWidth / 2, phase);
    else if (phase < 0.5 + tipWidth / 2) profile = 1;
    else if (phase < 0.5 + tipWidth / 2 + flank)
      profile = 1 - smoothstep(0.5 + tipWidth / 2, 0.5 + tipWidth / 2 + flank, phase);
    else profile = 0;

    const r = rootR + (tipR - rootR) * profile;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  // Center bore.
  const bore = new THREE.Path();
  bore.absarc(0, 0, boreR, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  // Radial lightening holes (cut with THREE.Path).
  const holeCount = opts.holes ?? 0;
  if (holeCount > 0) {
    const circleR = opts.holeCircleR ?? (rootR + boreR) * 0.55;
    const holeR = opts.holeR ?? Math.min(0.14, (rootR - boreR) * 0.22);
    for (let h = 0; h < holeCount; h++) {
      const ang = (h / holeCount) * Math.PI * 2 + Math.PI / holeCount;
      const path = new THREE.Path();
      path.absarc(
        Math.cos(ang) * circleR,
        Math.sin(ang) * circleR,
        holeR,
        0,
        Math.PI * 2,
        true,
      );
      shape.holes.push(path);
    }
  }

  // Extrude into 3D with chamfered bevel edges.
  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: thickness * 0.06,
    bevelSize: thickness * 0.05,
    bevelSegments: 1,
    curveSegments: 24,
  });
}

/* ------------------------------------------------------------------ */
/*  createElastomerSpiderGeometry() — 6-lobe molded spider coupler     */
/*  THREE.Shape built with .bezierCurveTo() lobe profiles.             */
/* ------------------------------------------------------------------ */

export interface SpiderOptions {
  lobes?: number;
  coreR: number;
  lobeR: number;
  thickness: number;
  boreR: number;
}

export function createElastomerSpiderGeometry(
  opts: SpiderOptions,
): THREE.ExtrudeGeometry {
  const lobes = opts.lobes ?? 6;
  const { coreR, lobeR, thickness, boreR } = opts;
  const shape = new THREE.Shape();

  const TAU = Math.PI * 2;
  const valleyR = coreR;
  const polar = (r: number, a: number) =>
    new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);

  for (let l = 0; l < lobes; l++) {
    const a0 = (l / lobes) * TAU; // valley
    const aPeak = ((l + 0.5) / lobes) * TAU; // lobe crest
    const a2 = ((l + 1) / lobes) * TAU; // next valley

    const start = polar(valleyR, a0);
    const end = polar(valleyR, a2);
    // Control points hug the crest so the bezier swells into a jaw lobe.
    const c1 = polar(coreR + lobeR * 0.98, aPeak - Math.PI / lobes * 0.62);
    const c2 = polar(coreR + lobeR * 0.98, aPeak + Math.PI / lobes * 0.62);

    if (l === 0) shape.moveTo(start.x, start.y);
    shape.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, boreR, 0, TAU, true);
  shape.holes.push(bore);

  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 2,
    curveSegments: 12,
  });
}

/* ------------------------------------------------------------------ */
/*  Socket-head perimeter bolt (shared-geometry helpers)               */
/* ------------------------------------------------------------------ */

const boltHeadGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.1, 6);
const boltShankGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.18, 12);
const boltRecessGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.035, 6);

function makeBolt(
  steel: THREE.Material,
  dark: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Group {
  const g = new THREE.Group();
  const head = new THREE.Mesh(boltHeadGeo, steel);
  head.position.y = 0.13;
  const shank = new THREE.Mesh(boltShankGeo, steel);
  shank.position.y = -0.04;
  const recess = new THREE.Mesh(boltRecessGeo, dark);
  recess.position.y = 0.185;
  g.add(head, shank, recess);
  g.position.set(x, y, z);
  return g;
}

/* ------------------------------------------------------------------ */
/*  buildEngineeringAssembly() — the full SSQ-9400 procedural model    */
/* ------------------------------------------------------------------ */

export function buildEngineeringAssembly(): Assembly {
  const root = new THREE.Group();
  root.name = 'SSQ-9400';

  const movers: Mover[] = [];
  const pinAnchors: THREE.Object3D[] = [];
  const register = (obj: THREE.Object3D, delta: THREE.Vector3 | [number, number, number]) => {
    movers.push({
      obj,
      base: obj.position.clone(),
      delta: Array.isArray(delta) ? new THREE.Vector3(...delta) : delta.clone(),
    });
  };

  /* ================= Upper aluminium housing ======================= */
  const housingUpper = new THREE.Group();
  housingUpper.userData.partId = 'housing';
  {
    const alu = aluminiumMat();
    const shell = aluminiumShellMat();
    const accent = aluminiumMat(true);
    const steel = steelMat();
    const dark = rubberMat(0.6);

    // Upper shell (tapered) + split flange + top cap + central boss.
    const upperShell = new THREE.Mesh(
      new THREE.CylinderGeometry(2.22, 2.42, 1.32, 56, 1, true),
      shell,
    );
    upperShell.position.y = 1.19;
    upperShell.castShadow = upperShell.receiveShadow = true;

    const splitFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(2.72, 2.72, 0.14, 56),
      alu,
    );
    splitFlange.position.y = 0.5;
    splitFlange.castShadow = splitFlange.receiveShadow = true;

    const accentRing = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.035, 10, 72), accent);
    accentRing.rotation.x = -Math.PI / 2;
    accentRing.position.y = 0.6;

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(2.18, 2.18, 0.16, 56), alu);
    topCap.position.y = 1.92;
    topCap.castShadow = topCap.receiveShadow = true;

    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.42, 32), alu);
    boss.position.y = 2.18;
    boss.castShadow = boss.receiveShadow = true;

    const bossBore = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.46, 24), dark);
    bossBore.position.y = 2.18;

    housingUpper.add(upperShell, splitFlange, accentRing, topCap, boss, bossBore);

    // 12 radial cooling fins (upper bank).
    const finGeo = new THREE.BoxGeometry(0.075, 1.02, 0.5);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const fin = new THREE.Mesh(finGeo, alu);
      fin.position.set(Math.cos(a) * 2.38, 1.2, Math.sin(a) * 2.38);
      fin.rotation.y = -a;
      fin.castShadow = fin.receiveShadow = true;
      housingUpper.add(fin);
    }

    // Socket-head perimeter bolts on the split flange.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      housingUpper.add(makeBolt(steel, dark, Math.cos(a) * 2.52, 0.58, Math.sin(a) * 2.52));
    }

    // Callout pin anchor.
    const anchor = new THREE.Object3D();
    anchor.position.set(-1.75, 1.75, 1.0);
    housingUpper.add(anchor);
    pinAnchors.push(anchor);
  }
  root.add(housingUpper);
  register(housingUpper, [0, 2.55, 0]);

  /* ================= Lower aluminium housing ======================= */
  const housingLower = new THREE.Group();
  housingLower.userData.partId = 'housing';
  {
    const alu = aluminiumMat();
    const shell = aluminiumShellMat();
    const accent = aluminiumMat(true);
    const steel = steelMat();
    const dark = rubberMat(0.6);

    const lowerShell = new THREE.Mesh(
      new THREE.CylinderGeometry(2.42, 2.62, 1.42, 56, 1, true),
      shell,
    );
    lowerShell.position.y = -0.29;
    lowerShell.castShadow = lowerShell.receiveShadow = true;

    const baseFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(3.05, 3.15, 0.3, 64),
      alu,
    );
    baseFlange.position.y = -1.15;
    baseFlange.castShadow = baseFlange.receiveShadow = true;

    const baseAccent = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.04, 10, 80), accent);
    baseAccent.rotation.x = -Math.PI / 2;
    baseAccent.position.y = -1.02;

    const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.55, 0.12, 56), alu);
    bottomCap.position.y = -0.98;
    bottomCap.receiveShadow = true;

    housingLower.add(lowerShell, baseFlange, baseAccent, bottomCap);

    // 18 radially arrayed CNC cooling fins (primary bank).
    const finGeo = new THREE.BoxGeometry(0.085, 1.28, 0.58);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const fin = new THREE.Mesh(finGeo, alu);
      fin.position.set(Math.cos(a) * 2.58, -0.26, Math.sin(a) * 2.58);
      fin.rotation.y = -a;
      fin.castShadow = fin.receiveShadow = true;
      housingLower.add(fin);
    }

    // Base flange bolts.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      housingLower.add(makeBolt(steel, dark, Math.cos(a) * 2.82, -1.0, Math.sin(a) * 2.82));
    }
  }
  root.add(housingLower);
  register(housingLower, [0, -1.05, 0]);

  /* ================= Planetary gear train ========================== */
  const gearTrain = new THREE.Group();
  gearTrain.userData.partId = 'gear-train';
  const sun = new THREE.Group();
  const carrier = new THREE.Group();
  const planets: THREE.Group[] = [];
  {
    const steel = steelMat();
    const bronze = bronzeMat();

    // Sun gear (16 teeth) on the splined rotor axis.
    const sunGear = new THREE.Mesh(
      createGearGeometry({
        teeth: 16,
        tipR: 1.06,
        rootR: 0.87,
        boreR: 0.3,
        thickness: 0.3,
        holes: 5,
        holeR: 0.13,
        holeCircleR: 0.6,
      }),
      steel,
    );
    sunGear.rotation.x = -Math.PI / 2;
    sunGear.castShadow = sunGear.receiveShadow = true;
    sun.position.y = 0.35;
    sun.add(sunGear);

    // Carrier plate + pins.
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.06, 2.06, 0.12, 48), steel);
    plate.position.y = -0.02;
    plate.castShadow = plate.receiveShadow = true;
    carrier.position.y = 0.35;
    carrier.add(plate);

    // 4 planetary pinions (12 teeth) — counter-rotate at the 16:12 ratio.
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const planet = new THREE.Group();
      planet.position.set(Math.cos(a) * 1.62, 0, Math.sin(a) * 1.62);

      const planetGear = new THREE.Mesh(
        createGearGeometry({
          teeth: 12,
          tipR: 0.82,
          rootR: 0.65,
          boreR: 0.24,
          thickness: 0.3,
          holes: 4,
          holeR: 0.11,
          holeCircleR: 0.44,
        }),
        steel,
      );
      planetGear.rotation.x = -Math.PI / 2;
      planetGear.castShadow = planetGear.receiveShadow = true;

      // Phosphor-bronze bushing + carrier pin.
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), bronze);
      bushing.position.y = -0.28;
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.72, 16), steel);
      pin.position.y = -0.1;
      pin.castShadow = true;

      planet.add(planetGear, bushing, pin);
      planets.push(planet);
      carrier.add(planet);
    }

    gearTrain.add(sun, carrier);

    // Callout pin anchor.
    const anchor = new THREE.Object3D();
    anchor.position.set(1.15, 0.85, 1.15);
    gearTrain.add(anchor);
    pinAnchors.push(anchor);
  }
  root.add(gearTrain);
  register(gearTrain, [0, 0.85, 0]);

  /* ================= Rotor shaft (splined) ========================= */
  const rotorShaft = new THREE.Group();
  rotorShaft.userData.partId = 'shaft';
  {
    const steel = steelMat();

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 4.1, 28), steel);
    shaft.position.y = 1.15;
    shaft.castShadow = shaft.receiveShadow = true;
    rotorShaft.add(shaft);

    // Splined section — 12 extruded spline keys.
    const splineGeo = new THREE.BoxGeometry(0.075, 0.62, 0.1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const spline = new THREE.Mesh(splineGeo, steel);
      spline.position.set(Math.cos(a) * 0.27, 2.72, Math.sin(a) * 0.27);
      spline.rotation.y = -a;
      spline.castShadow = true;
      rotorShaft.add(spline);
    }

    // Coupling hub stack.
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.46, 32), steel);
    hub.position.y = 3.22;
    hub.castShadow = hub.receiveShadow = true;
    const hubCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.18, 24), steel);
    hubCollar.position.y = 2.88;
    rotorShaft.add(hub, hubCollar);
  }
  root.add(rotorShaft);
  register(rotorShaft, [0, 3.35, 0]);

  /* ================= Elastomer spider coupler ====================== */
  const spiderCoupler = new THREE.Group();
  spiderCoupler.userData.partId = 'coupler';
  {
    const rubber = rubberMat(0.68);
    const alu = aluminiumMat();

    // 6-lobe molded EPDM spider (bezier-profile extrusion).
    const spider = new THREE.Mesh(
      createElastomerSpiderGeometry({
        lobes: 6,
        coreR: 0.62,
        lobeR: 0.34,
        thickness: 0.34,
        boreR: 0.3,
      }),
      rubber,
    );
    spider.rotation.x = -Math.PI / 2;
    spider.position.y = 3.42;
    spider.castShadow = spider.receiveShadow = true;
    spiderCoupler.add(spider);

    // Jaw hubs flanking the spider.
    const hubLower = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.92, 0.24, 36), alu);
    hubLower.position.y = 3.12;
    hubLower.castShadow = hubLower.receiveShadow = true;
    const hubUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.84, 0.24, 36), alu);
    hubUpper.position.y = 3.74;
    hubUpper.castShadow = hubUpper.receiveShadow = true;
    spiderCoupler.add(hubLower, hubUpper);

    // Jaw fingers (3 per hub, interleaved with spider lobes).
    const jawGeo = new THREE.BoxGeometry(0.2, 0.3, 0.34);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const jawLo = new THREE.Mesh(jawGeo, alu);
      jawLo.position.set(Math.cos(a) * 0.68, 3.32, Math.sin(a) * 0.68);
      jawLo.rotation.y = -a;
      const jawHi = new THREE.Mesh(jawGeo, alu);
      jawHi.position.set(Math.cos(a + Math.PI / 3) * 0.68, 3.56, Math.sin(a + Math.PI / 3) * 0.68);
      jawHi.rotation.y = -a - Math.PI / 3;
      jawLo.castShadow = jawHi.castShadow = true;
      spiderCoupler.add(jawLo, jawHi);
    }

    const anchor = new THREE.Object3D();
    anchor.position.set(0, 4.1, 0.2);
    spiderCoupler.add(anchor);
    pinAnchors.push(anchor);
  }
  root.add(spiderCoupler);
  register(spiderCoupler, [0, 4.35, 0]);

  /* ================= Dual-lip hydraulic seals ====================== */
  const sealGroups: THREE.Group[] = [];
  {
    const viton = rubberMat(0.72);
    const positions: Array<[number, number, number, number, number, number]> = [
      // x, y, z, dx, dy, dz (explode vector)
      [0, 2.28, 0, 1.75, 1.35, 0], // top boss lip A
      [0, 2.16, 0, 1.75, 1.15, 0], // top boss lip B
      [0, -0.98, 0, -1.85, -0.55, 1.1], // base lip A
      [0, -1.08, 0, -1.85, -0.75, 1.1], // base lip B
    ];
    for (const [x, y, z, dx, dy, dz] of positions) {
      const g = new THREE.Group();
      g.userData.partId = 'seals';
      const torus = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.058, 12, 40), viton);
      torus.rotation.x = -Math.PI / 2;
      torus.castShadow = torus.receiveShadow = true;
      g.add(torus);
      g.position.set(x, y, z);
      root.add(g);
      sealGroups.push(g);
      register(g, [dx, dy, dz]);
    }

    // O-rings on the split flange interface.
    for (const [x, y, z, dx, dz] of [
      [1.9, 0.5, 0, 2.3, 0],
      [-1.9, 0.5, 0, -2.3, 0],
      [0, 0.5, 1.9, 0, 2.3],
      [0, 0.5, -1.9, 0, -2.3],
    ] as const) {
      const g = new THREE.Group();
      g.userData.partId = 'seals';
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 10, 26), viton);
      ring.castShadow = true;
      g.add(ring);
      g.position.set(x, y, z);
      root.add(g);
      sealGroups.push(g);
      register(g, [dx, 0.35, dz]);
    }

    const anchor = new THREE.Object3D();
    anchor.position.set(-1.15, 2.45, -1.15);
    root.add(anchor);
    pinAnchors.push(anchor);
  }

  /* ================= Phosphor-bronze bushings ====================== */
  const bushingGroups: THREE.Group[] = [];
  {
    const bronze = bronzeMat();
    const specs: Array<[number, number, number, number, number, number]> = [
      [0.92, -0.62, 0.92, 1.65, -0.6, 1.65],
      [-0.92, -0.62, 0.92, -1.65, -0.6, 1.65],
      [-0.92, -0.62, -0.92, -1.65, -0.6, -1.65],
      [0.92, -0.62, -0.92, 1.65, -0.6, -1.65],
    ];
    for (const [x, y, z, dx, dy, dz] of specs) {
      const g = new THREE.Group();
      g.userData.partId = 'bushings';
      const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.34, 24), bronze);
      bush.castShadow = bush.receiveShadow = true;
      const flange = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 10, 28), bronze);
      flange.rotation.x = -Math.PI / 2;
      flange.position.y = 0.19;
      g.add(bush, flange);
      g.position.set(x, y, z);
      root.add(g);
      bushingGroups.push(g);
      register(g, [dx, dy, dz]);
    }

    const anchor = new THREE.Object3D();
    anchor.position.set(1.35, -0.55, -1.35);
    root.add(anchor);
    pinAnchors.push(anchor);
  }

  /* ============ Quad ribbed rubber anti-vibration mounts =========== */
  const mounts: THREE.Group[] = [];
  {
    const rubber = rubberMat(0.78);
    const steel = stainlessMat();
    const corner: Array<[number, number]> = [
      [2.32, 2.32],
      [-2.32, 2.32],
      [-2.32, -2.32],
      [2.32, -2.32],
    ];
    for (let i = 0; i < 4; i++) {
      const [x, z] = corner[i];
      const g = new THREE.Group();
      g.userData.partId = 'mounts';

      // Base plate + top plate (stainless).
      const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.1, 1.18), steel);
      basePlate.position.y = -2.22;
      basePlate.castShadow = basePlate.receiveShadow = true;
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.1, 1.02), steel);
      topPlate.position.y = -1.62;
      topPlate.castShadow = topPlate.receiveShadow = true;

      // Elastomer core + 3 concentric compression ribs.
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.56, 28), rubber);
      core.position.y = -1.92;
      core.castShadow = core.receiveShadow = true;
      const ribGeo = new THREE.TorusGeometry(0.47, 0.065, 10, 30);
      for (let r = 0; r < 3; r++) {
        const rib = new THREE.Mesh(ribGeo, rubber);
        rib.rotation.x = -Math.PI / 2;
        rib.position.y = -2.1 + r * 0.19;
        rib.castShadow = rib.receiveShadow = true;
        g.add(rib);
      }

      // Stainless mounting stud + washer.
      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.62, 14), steel);
      stud.position.y = -1.42;
      stud.castShadow = true;
      const washer = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 22), steel);
      washer.rotation.x = -Math.PI / 2;
      washer.position.y = -1.56;

      g.add(basePlate, topPlate, core, stud, washer);
      g.position.set(x, 0, z);
      root.add(g);
      mounts.push(g);
      register(g, [x * 0.52, -1.55, z * 0.52]);
    }

    const anchor = new THREE.Object3D();
    anchor.position.set(2.32, -1.85, 2.32);
    mounts[0].add(anchor);
    pinAnchors.push(anchor);
  }

  /* ================= Core light + API ============================== */
  const coreLight = new THREE.PointLight(0x66e8ff, 0.3, 14, 1.8);
  coreLight.position.set(0, 0.35, 0);
  root.add(coreLight);

  const partGroups: Record<PartId, THREE.Group[]> = {
    'gear-train': [gearTrain],
    coupler: [spiderCoupler],
    housing: [housingUpper, housingLower],
    mounts,
    seals: sealGroups,
    bushings: bushingGroups,
    shaft: [rotorShaft],
  };

  let explode = 0;
  const setExplode = (p: number) => {
    explode = Math.min(1, Math.max(0, p));
    for (const m of movers) {
      m.obj.position.copy(m.base).addScaledVector(m.delta, explode);
    }
    coreLight.intensity = 0.3 + explode * 2.1;
  };

  const tick = (
    t: number,
    dt: number,
    opts: { gearSpeed: number; vibration: number },
  ) => {
    const { gearSpeed, vibration } = opts;
    // Sun gear + splined shaft: continuous rotation.
    sun.rotation.y += dt * gearSpeed * 1.35;
    rotorShaft.rotation.y += dt * gearSpeed * 1.35;

    // Carrier: slow orbit.
    carrier.rotation.y += dt * gearSpeed * 0.19;

    // 4 planetary pinions counter-rotate at the exact 16:12 tooth ratio.
    for (const planet of planets) {
      planet.rotation.y -= dt * gearSpeed * 1.35 * (16 / 12);
    }

    // Elastomer mounts: harmonic squash-and-stretch damping wave.
    for (let i = 0; i < mounts.length; i++) {
      const wave = Math.sin(t * 6.1 + i * 1.72) * vibration;
      mounts[i].scale.set(1 - wave * 0.016, 1 + wave * 0.036, 1 - wave * 0.016);
    }

    // Keep core light intensity coupled to the explode state.
    coreLight.intensity = 0.3 + explode * 2.1;
  };

  // Every castable mesh throws onto the soft shadow map.
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return {
    root,
    movers,
    pinAnchors,
    partGroups,
    coreLight,
    gearParts: { sun, carrier, planets },
    mounts,
    setExplode,
    tick,
  };
}
