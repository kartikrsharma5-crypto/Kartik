/**
 * Procedural 3D Composite Models for Gully Rush: Mumbai Run
 * Built adhering to Three.js modular 3-12 part composite guidelines.
 */

import * as THREE from 'three';
import { CharacterDef, PowerUpType } from '../types/game';
import { TextureGenerator } from './textures';

// Shared procedural materials and textures cache
let roadTexture: THREE.CanvasTexture | null = null;
let hazardTexture: THREE.CanvasTexture | null = null;
let busFrontTexture: THREE.CanvasTexture | null = null;
let coinTexture: THREE.CanvasTexture | null = null;

// Reusable contact shadow texture
let contactShadowTexture: THREE.CanvasTexture | null = null;

function getContactShadowTexture(): THREE.CanvasTexture {
  if (!contactShadowTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    contactShadowTexture = new THREE.CanvasTexture(canvas);
  }
  return contactShadowTexture;
}

export function createContactShadow(width = 1.6, depth = 1.6, opacity = 0.45): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, depth);
  const mat = new THREE.MeshBasicMaterial({
    map: getContactShadowTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02; // grounded
  return shadow;
}

export class ModelFactory {
  public static init() {
    roadTexture = TextureGenerator.createRoadTexture();
    hazardTexture = TextureGenerator.createHazardStripeTexture();
    busFrontTexture = TextureGenerator.createBusFrontTexture();
    coinTexture = TextureGenerator.createCoinTexture();
  }

  /**
   * Iconic Mumbai Auto-Rickshaw (Black body, yellow roof, 3 wheels, meter, headlight)
   */
  public static createRickshaw(): THREE.Group {
    const rickshaw = new THREE.Group();

    // 1. Lower chassis & cabin base (Black)
    const baseGeo = new THREE.BoxGeometry(1.5, 0.8, 2.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
      metalness: 0.3,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.6, 0);
    base.castShadow = true;
    rickshaw.add(base);

    // 2. Yellow Canopy / Roof
    const roofGeo = new THREE.BoxGeometry(1.48, 0.65, 1.8);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright Mumbai auto yellow
      roughness: 0.35,
      metalness: 0.1,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.3, -0.1);
    roof.castShadow = true;
    rickshaw.add(roof);

    // 3. Green Canvas Roof Top Trim
    const topTrimGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.76, 12, 1, false, 0, Math.PI);
    const topTrimMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Mumbai auto green roof
      roughness: 0.6,
    });
    const topTrim = new THREE.Mesh(topTrimGeo, topTrimMat);
    topTrim.rotation.z = Math.PI / 2;
    topTrim.rotation.y = Math.PI / 2;
    topTrim.position.set(0, 1.62, -0.1);
    rickshaw.add(topTrim);

    // 4. Windshield Glass
    const glassGeo = new THREE.PlaneGeometry(1.3, 0.65);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.25, 0.82);
    glass.rotation.x = -0.15;
    rickshaw.add(glass);

    // 5. Front Round Chrome Headlight (Emissive)
    const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xfef08a,
      emissiveIntensity: 0.9,
      metalness: 0.8,
      roughness: 0.2,
    });
    const headlight = new THREE.Mesh(lightGeo, lightMat);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.65, 1.14);
    rickshaw.add(headlight);

    // 6. Mechanical Fare Meter on Handlebar
    const meterGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
    const meterMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const meter = new THREE.Mesh(meterGeo, meterMat);
    meter.position.set(-0.55, 0.95, 0.75);
    rickshaw.add(meter);

    // 7. Wheels: 1 Front Centered, 2 Rear
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });

    // Helper to build a wheel with hubcap
    const makeWheel = (x: number, y: number, z: number) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), rimMat);
      hub.rotation.z = Math.PI / 2;
      wGroup.add(hub);

      wGroup.position.set(x, y, z);
      return wGroup;
    };

    rickshaw.add(makeWheel(0, 0.3, 0.85)); // Front wheel
    rickshaw.add(makeWheel(-0.7, 0.3, -0.65)); // Rear Left
    rickshaw.add(makeWheel(0.7, 0.3, -0.65)); // Rear Right

    // 8. Ground Contact Shadow
    rickshaw.add(createContactShadow(1.8, 2.5, 0.5));

    return rickshaw;
  }

  /**
   * Iconic Red BEST Double/Single Bus Obstacle
   */
  public static createBestBus(): THREE.Group {
    const bus = new THREE.Group();

    // 1. Main Red Body Chassis
    const bodyGeo = new THREE.BoxGeometry(1.8, 2.4, 4.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Iconic BEST Crimson Red
      roughness: 0.3,
      metalness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 1.45, 0);
    body.castShadow = true;
    bus.add(body);

    // 2. White Waistline Accent Stripe
    const stripeGeo = new THREE.BoxGeometry(1.82, 0.2, 4.62);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 1.3, 0);
    bus.add(stripe);

    // 3. Front Window & Destination Display Face
    if (!busFrontTexture) busFrontTexture = TextureGenerator.createBusFrontTexture();
    const frontPlaneGeo = new THREE.PlaneGeometry(1.78, 2.2);
    const frontMat = new THREE.MeshStandardMaterial({
      map: busFrontTexture,
      roughness: 0.3,
    });
    const frontFace = new THREE.Mesh(frontPlaneGeo, frontMat);
    frontFace.position.set(0, 1.55, 2.31);
    bus.add(frontFace);

    // 4. Side Passenger Windows (Left & Right)
    const winGeo = new THREE.BoxGeometry(1.84, 0.65, 3.8);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.3,
    });
    const windows = new THREE.Mesh(winGeo, winMat);
    windows.position.set(0, 1.9, -0.2);
    bus.add(windows);

    // 5. Heavy Wheels (4 wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });

    const makeWheel = (x: number, y: number, z: number) => {
      const g = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      g.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      g.add(rim);
      g.position.set(x, y, z);
      return g;
    };

    bus.add(makeWheel(-0.9, 0.38, 1.3));
    bus.add(makeWheel(0.9, 0.38, 1.3));
    bus.add(makeWheel(-0.9, 0.38, -1.3));
    bus.add(makeWheel(0.9, 0.38, -1.3));

    // 6. Contact Shadow
    bus.add(createContactShadow(2.1, 5.0, 0.6));

    return bus;
  }

  /**
   * Road Barrier (Police barricade) - JUMP OVER OBSTACLE (low height)
   */
  public static createPoliceBarricade(): THREE.Group {
    const barrier = new THREE.Group();

    if (!hazardTexture) hazardTexture = TextureGenerator.createHazardStripeTexture();

    // 1. Horizontal crossbeam with hazard stripes
    const beamGeo = new THREE.BoxGeometry(2.0, 0.42, 0.12);
    const beamMat = new THREE.MeshStandardMaterial({
      map: hazardTexture,
      roughness: 0.4,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 0.6, 0);
    beam.castShadow = true;
    barrier.add(beam);

    // 2. Yellow A-Frame Support Legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.5,
      metalness: 0.4,
    });

    [-0.85, 0.85].forEach((x) => {
      const leg1 = new THREE.Mesh(legGeo, legMat);
      leg1.position.set(x, 0.45, 0.2);
      leg1.rotation.x = 0.25;
      leg1.castShadow = true;
      barrier.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, legMat);
      leg2.position.set(x, 0.45, -0.2);
      leg2.rotation.x = -0.25;
      leg2.castShadow = true;
      barrier.add(leg2);

      // Foot base
      const footGeo = new THREE.BoxGeometry(0.12, 0.05, 0.6);
      const foot = new THREE.Mesh(footGeo, legMat);
      foot.position.set(x, 0.025, 0);
      barrier.add(foot);
    });

    // 3. Flashing Red Hazard Light on Top
    const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 12);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 0.9, 0);
    barrier.add(light);

    // Ground Shadow
    barrier.add(createContactShadow(2.1, 0.8, 0.45));

    return barrier;
  }

  /**
   * Construction Scaffolding / Overhead Bar - SLIDE UNDER OBSTACLE (high clearance)
   * The beam is positioned at Y ~ 1.55 so standing players hit it, but sliding players glide under!
   */
  public static createScaffolding(): THREE.Group {
    const scaffold = new THREE.Group();

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.3,
    });
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);

    // Left & Right Vertical Scaffold Poles
    const leftPole = new THREE.Mesh(poleGeo, poleMat);
    leftPole.position.set(-1.05, 1.4, 0);
    leftPole.castShadow = true;
    scaffold.add(leftPole);

    const rightPole = new THREE.Mesh(poleGeo, poleMat);
    rightPole.position.set(1.05, 1.4, 0);
    rightPole.castShadow = true;
    scaffold.add(rightPole);

    // Overhead Barrier Beam (At Y = 1.5m - forces player to slide!)
    const beamGeo = new THREE.BoxGeometry(2.2, 0.25, 0.25);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.4,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 1.5, 0);
    beam.castShadow = true;
    scaffold.add(beam);

    // Hanging Yellow Danger Ribbon / Sign
    if (!hazardTexture) hazardTexture = TextureGenerator.createHazardStripeTexture();
    const signGeo = new THREE.PlaneGeometry(1.6, 0.35);
    const signMat = new THREE.MeshStandardMaterial({
      map: hazardTexture,
      side: THREE.DoubleSide,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.25, 0);
    scaffold.add(sign);

    // Diagonal Cross Brace
    const braceGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.7, 8);
    const brace = new THREE.Mesh(braceGeo, poleMat);
    brace.position.set(0, 2.1, 0);
    brace.rotation.z = Math.PI / 4;
    scaffold.add(brace);

    // Ground Shadow for poles
    scaffold.add(createContactShadow(2.3, 0.6, 0.35));

    return scaffold;
  }

  /**
   * Roadside Chai & Vada Pav Tapri Stall
   */
  public static createChaiStall(): THREE.Group {
    const stall = new THREE.Group();

    // 1. Wooden Counter Desk
    const deskGeo = new THREE.BoxGeometry(1.6, 0.9, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm Teak Wood
      roughness: 0.8,
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.45, 0);
    desk.castShadow = true;
    stall.add(desk);

    // 2. Slanted Tin Awning with Red/Yellow Canvas
    const awningGeo = new THREE.BoxGeometry(1.8, 0.1, 1.5);
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.5,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 1.8, 0.1);
    awning.rotation.x = 0.15;
    awning.castShadow = true;
    stall.add(awning);

    // 3. Awning Support Bamboo Poles
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    [-0.75, 0.75].forEach((x) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(x, 1.35, 0.55);
      stall.add(p);
    });

    // 4. Large Brass Chai Kettle (Samovar)
    const kettleGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.4, 12);
    const kettleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.25,
    });
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(-0.45, 1.1, 0.1);
    stall.add(kettle);

    // 5. Glass Display Case with Golden Vada Pavs
    const glassGeo = new THREE.BoxGeometry(0.65, 0.35, 0.5);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0.35, 1.08, 0.1);
    stall.add(glass);

    // Small golden buns inside
    const bunGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const bunMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    [-0.1, 0.1].forEach((bx) => {
      const bun = new THREE.Mesh(bunGeo, bunMat);
      bun.position.set(0.35 + bx, 1.0, 0.1);
      stall.add(bun);
    });

    // 6. Sign Banner "BOMBAY CHAI"
    const signTex = TextureGenerator.createShopSignTexture('CHAI TAPRI', 'Special Masala Chai & Vada Pav');
    const signGeo = new THREE.PlaneGeometry(1.6, 0.35);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.95, 0.75);
    sign.rotation.x = -0.1;
    stall.add(sign);

    // Shadow
    stall.add(createContactShadow(1.9, 1.5, 0.5));

    return stall;
  }

  /**
   * Monsoon Muddy Water Puddle Decal
   */
  public static createPuddle(): THREE.Group {
    const puddle = new THREE.Group();

    const puddleGeo = new THREE.CircleGeometry(0.85, 16);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const mesh = new THREE.Mesh(puddleGeo, puddleMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    puddle.add(mesh);

    return puddle;
  }

  /**
   * 3D Spinning Gold Rupee Coin (₹)
   */
  public static createCoin(): THREE.Group {
    const coin = new THREE.Group();

    if (!coinTexture) coinTexture = TextureGenerator.createCoinTexture();

    // Medallion cylinder
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 20);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      map: coinTexture,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x854d0e,
      emissiveIntensity: 0.2,
    });
    const mesh = new THREE.Mesh(coinGeo, coinMat);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    coin.add(mesh);

    // Glow ring
    const glowGeo = new THREE.TorusGeometry(0.42, 0.03, 8, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(glowGeo, glowMat);
    coin.add(ring);

    return coin;
  }

  /**
   * 3D Floating Power-Up Item
   */
  public static createPowerUp(type: PowerUpType): THREE.Group {
    const powerup = new THREE.Group();

    // Floating orb / crystal base
    let coreColor = 0x38bdf8;
    if (type === 'magnet') coreColor = 0xef4444; // Red Magnet
    if (type === 'shield') coreColor = 0x3b82f6; // Blue Shield
    if (type === 'boost') coreColor = 0xf97316; // Orange Rocket Boost
    if (type === 'multiplier') coreColor = 0xeab308; // Gold 2X Multiplier

    const coreGeo = new THREE.OctahedronGeometry(0.38, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      emissive: coreColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    powerup.add(core);

    // Outer rotating beacon rings
    const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: coreColor,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    powerup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    powerup.add(ring2);

    powerup.userData = { type, core, ring1, ring2 };
    return powerup;
  }

  /**
   * Articulated 3D Runner Character Model
   * 10-part articulated humanoid rig with custom clothes, accessories, and animation helpers.
   */
  public static createRunner(charDef: CharacterDef): {
    root: THREE.Group;
    updateAnimation: (time: number, speed: number, isJumping: boolean, isSliding: boolean, jumpProgress: number) => void;
  } {
    const root = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(charDef.skinColor),
      roughness: 0.7,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(charDef.shirtColor),
      roughness: 0.5,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(charDef.pantsColor),
      roughness: 0.6,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
    });
    const accessoryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(charDef.accessoryColor),
      metalness: 0.5,
      roughness: 0.3,
    });

    // Pelvis / Hips Center
    const hips = new THREE.Group();
    hips.position.y = 0.88;
    root.add(hips);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.52, 0.62, 0.32);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.32;
    torso.castShadow = true;
    hips.add(torso);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.72;
    hips.add(headGroup);

    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Cap / Hair / Turban based on character
    if (charDef.id === 'kabir') {
      // Cricket Cap (Backwards)
      const capGeo = new THREE.SphereGeometry(0.21, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.04;
      headGroup.add(cap);

      // Cap Visor facing backwards
      const visorGeo = new THREE.BoxGeometry(0.24, 0.04, 0.16);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 0.06, -0.2);
      headGroup.add(visor);
    } else if (charDef.id === 'inspector_shinde') {
      // Khaki Police Cap
      const capGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.12, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.2;
      headGroup.add(cap);

      // Gold badge on cap
      const badge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 })
      );
      badge.rotation.x = Math.PI / 2;
      badge.position.set(0, 0.22, 0.23);
      headGroup.add(badge);
    } else if (charDef.id === 'priya') {
      // Bun / Hair Ponytail
      const hairGeo = new THREE.SphereGeometry(0.22, 14, 14);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 0.05, -0.06);
      headGroup.add(hair);

      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), hairMat);
      bun.position.set(0, 0.18, -0.18);
      headGroup.add(bun);
    } else {
      // Stylish street hair
      const hairGeo = new THREE.BoxGeometry(0.42, 0.14, 0.42);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 0.18;
      headGroup.add(hair);
    }

    // Limbs: Left & Right Arms
    const limbGeo = new THREE.BoxGeometry(0.14, 0.48, 0.14);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.35, 0.58, 0);
    const leftArmMesh = new THREE.Mesh(limbGeo, shirtMat);
    leftArmMesh.position.y = -0.22;
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);
    hips.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.35, 0.58, 0);
    const rightArmMesh = new THREE.Mesh(limbGeo, shirtMat);
    rightArmMesh.position.y = -0.22;
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);
    hips.add(rightArm);

    // Legs: Left & Right
    const legGeo = new THREE.BoxGeometry(0.18, 0.52, 0.18);
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.16, 0, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.26;
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.48, 0.05);
    leftLeg.add(leftShoe);
    hips.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.16, 0, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.26;
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.48, 0.05);
    rightLeg.add(rightShoe);
    hips.add(rightLeg);

    // Signature Accessory
    if (charDef.id === 'kabir') {
      // Cricket bat strapped to back diagonally
      const batHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a })
      );
      const batBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.65, 0.05),
        accessoryMat
      );
      batBlade.position.y = -0.4;
      const batGroup = new THREE.Group();
      batGroup.add(batHandle);
      batGroup.add(batBlade);
      batGroup.rotation.z = 0.5;
      batGroup.position.set(0.1, 0.4, -0.2);
      hips.add(batGroup);
    } else if (charDef.id === 'priya') {
      // Steel Dabba Stack on hip
      const dabbaGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.45, 12);
      const dabba = new THREE.Mesh(dabbaGeo, accessoryMat);
      dabba.position.set(-0.35, 0.2, 0.15);
      hips.add(dabba);
    } else if (charDef.id === 'raju') {
      // Gold chain around neck & sunglasses
      const chainGeo = new THREE.TorusGeometry(0.16, 0.02, 8, 16);
      const chain = new THREE.Mesh(chainGeo, accessoryMat);
      chain.rotation.x = Math.PI / 2;
      chain.position.set(0, 0.55, 0.05);
      hips.add(chain);

      // Shades
      const shades = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.08, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 })
      );
      shades.position.set(0, 0.02, 0.2);
      headGroup.add(shades);
    }

    // Contact Ground Shadow
    const shadow = createContactShadow(1.1, 1.1, 0.55);
    root.add(shadow);

    // Dynamic animation loop updater
    const updateAnimation = (
      time: number,
      speed: number,
      isJumping: boolean,
      isSliding: boolean,
      jumpProgress: number
    ) => {
      // Shadow position matches root
      shadow.position.x = 0;
      shadow.position.z = 0;

      if (isSliding) {
        // Crouch slide pose: torso rotated back, legs forward
        hips.position.y = 0.38;
        torso.rotation.x = -0.55;
        headGroup.rotation.x = 0.35;
        leftLeg.rotation.x = -1.2;
        rightLeg.rotation.x = -1.1;
        leftArm.rotation.x = 0.8;
        rightArm.rotation.x = 0.8;
        shadow.scale.set(1.4, 0.8, 1);
        return;
      }

      if (isJumping) {
        // Heroic jump pose
        hips.position.y = 0.88;
        torso.rotation.x = 0.1;
        headGroup.rotation.x = -0.15;
        leftLeg.rotation.x = 0.7;
        rightLeg.rotation.x = -0.5;
        leftArm.rotation.x = -1.2;
        rightArm.rotation.x = 1.0;

        // Shadow fades as player leaps high
        const heightFactor = Math.max(0.15, 1 - jumpProgress * 0.7);
        shadow.scale.set(heightFactor, heightFactor, 1);
        return;
      }

      // Normal Running Stride animation
      const strideFreq = speed * 0.7; // scales with runner speed
      const strideAngle = Math.sin(time * strideFreq);

      hips.position.y = 0.88 + Math.abs(Math.sin(time * strideFreq)) * 0.08;
      torso.rotation.x = 0.18; // lean forward into the sprint
      torso.rotation.y = Math.sin(time * strideFreq * 0.5) * 0.08;
      headGroup.rotation.x = -0.1;

      // Leg scissor
      leftLeg.rotation.x = strideAngle * 0.85;
      rightLeg.rotation.x = -strideAngle * 0.85;

      // Arm counterbalance swing
      leftArm.rotation.x = -strideAngle * 0.95;
      rightArm.rotation.x = strideAngle * 0.95;

      shadow.scale.set(1, 1, 1);
    };

    return { root, updateAnimation };
  }

  /**
   * Mumbai Chawl / Gully roadside building block with shopfronts & balconies
   */
  public static createStreetBuilding(
    side: 'left' | 'right',
    theme: 'sunset' | 'monsoon'
  ): THREE.Group {
    const building = new THREE.Group();

    // Palette of vibrant Mumbai facades (ochre yellow, colonial blue, pastel mint, terracotta)
    const facadeColors = [0xfef08a, 0x93c5fd, 0xa7f3d0, 0xfca5a5, 0xfde047];
    const pickedColor = facadeColors[Math.floor(Math.random() * facadeColors.length)];

    // 1. Main 3-Story Building Block
    const bGeo = new THREE.BoxGeometry(6.0, 11.0, 12.0);
    const bMat = new THREE.MeshStandardMaterial({
      color: pickedColor,
      roughness: 0.8,
    });
    const block = new THREE.Mesh(bGeo, bMat);
    block.position.y = 5.5;
    block.castShadow = true;
    building.add(block);

    // 2. Ground Floor Shopfront Awning & Billboard
    const shopNames = [
      { name: 'SHARMA CHAI', tag: 'Famous Cutting Chai & Bun Maska' },
      { name: 'AAMCHI VADA PAV', tag: 'Mumbai No.1 Spicy Chutney' },
      { name: 'BOLLYWOOD TAILOR', tag: 'Suits, Sherwanis & Jeans' },
      { name: 'DADAR SWEETS', tag: 'Fresh Jalebi & Peda' },
      { name: 'ROYAL PAN CORNER', tag: 'Meetha Pan & Cold Drinks' },
    ];
    const shop = shopNames[Math.floor(Math.random() * shopNames.length)];
    const signTex = TextureGenerator.createShopSignTexture(shop.name, shop.tag);

    const signGeo = new THREE.PlaneGeometry(5.0, 1.2);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex });
    const sign = new THREE.Mesh(signGeo, signMat);
    // Face the street
    sign.position.set(side === 'left' ? 3.02 : -3.02, 3.2, 0);
    sign.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    building.add(sign);

    // 3. Shop canopy awning
    const awningGeo = new THREE.BoxGeometry(1.2, 0.15, 5.2);
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.5,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(side === 'left' ? 3.5 : -3.5, 2.5, 0);
    awning.rotation.z = side === 'left' ? 0.2 : -0.2;
    building.add(awning);

    // 4. Balconies with railings (Floors 2 & 3)
    [5.8, 8.8].forEach((by) => {
      const balconyGeo = new THREE.BoxGeometry(1.0, 0.15, 3.6);
      const balconyMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const balcony = new THREE.Mesh(balconyGeo, balconyMat);
      balcony.position.set(side === 'left' ? 3.4 : -3.4, by, 0);
      building.add(balcony);

      // Railing
      const railGeo = new THREE.BoxGeometry(0.9, 0.75, 3.6);
      const railMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.6,
        roughness: 0.4,
      });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(side === 'left' ? 3.4 : -3.4, by + 0.4, 0);
      building.add(rail);
    });

    return building;
  }

  /**
   * Overhead Festive Bunting Flags (Strung across the street between buildings)
   */
  public static createFestivalBunting(): THREE.Group {
    const bunting = new THREE.Group();

    // Thin wire across street width (x: -5 to +5, y: 5.5)
    const wireGeo = new THREE.CylinderGeometry(0.015, 0.015, 10.5, 6);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.y = 5.2;
    bunting.add(wire);

    // Triangular paper flags in festival colors (Saffron, Green, Yellow, Magenta)
    const flagColors = [0xf97316, 0x16a34a, 0xfacc15, 0xec4899, 0x3b82f6];
    const flagGeo = new THREE.ConeGeometry(0.18, 0.35, 3);

    for (let x = -4.5; x <= 4.5; x += 0.6) {
      const col = flagColors[Math.floor(Math.random() * flagColors.length)];
      const fMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 });
      const flag = new THREE.Mesh(flagGeo, fMat);
      flag.position.set(x, 5.0, 0);
      flag.rotation.x = Math.PI; // point downwards
      flag.rotation.z = (Math.random() - 0.5) * 0.2;
      bunting.add(flag);
    }

    return bunting;
  }
}
