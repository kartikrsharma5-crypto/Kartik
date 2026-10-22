/**
 * Core 3D Game Engine for Gully Rush: Mumbai Run
 * Implements Three.js PBR rendering, procedural track streaming,
 * physics collisions, touch/keyboard input, and dynamic powerups.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterDef,
  LaneIndex,
  ObstacleType,
  PowerUpActive,
  PowerUpType,
  RunResults,
  ThemeMode,
} from '../types/game';
import { CHARACTERS, GAME_CONFIG, LANES } from './constants';
import { ModelFactory } from './models';
import { TextureGenerator } from './textures';
import { soundManager } from '../audio/SoundManager';

interface ObstacleItem {
  type: ObstacleType;
  lane: LaneIndex;
  mesh: THREE.Group;
  z: number;
  width: number;
  height: number;
  depth: number;
  passed: boolean;
  canSlideUnder: boolean;
  canJumpOver: boolean;
}

interface CoinItem {
  mesh: THREE.Group;
  lane: LaneIndex;
  z: number;
  y: number;
  collected: boolean;
}

interface PowerUpItem {
  mesh: THREE.Group;
  type: PowerUpType;
  lane: LaneIndex;
  z: number;
  y: number;
  collected: boolean;
}

interface RoadSegment {
  mesh: THREE.Group;
  z: number;
}

export interface EngineCallbacks {
  onScoreUpdate: (score: number, distance: number, coins: number) => void;
  onPowerUpUpdate: (powerups: PowerUpActive[]) => void;
  onGameOver: (results: RunResults) => void;
  onMilestone?: (milestone: string) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pmremGenerator: THREE.PMREMGenerator | null = null;

  // Running State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();
  private isSoftwareGl: boolean = false;

  // Player State
  private characterDef: CharacterDef;
  private playerGroup: THREE.Group = new THREE.Group();
  private runnerAnimator: ((time: number, speed: number, isJumping: boolean, isSliding: boolean, jumpProgress: number) => void) | null = null;
  private currentLane: LaneIndex = 0; // Center lane
  private targetLaneX: number = 0;
  private playerPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private playerVelocityY: number = 0;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private jumpProgress: number = 0;

  // Dynamic Metrics
  private currentSpeed: number = GAME_CONFIG.BASE_SPEED;
  private distanceRun: number = 0;
  private score: number = 0;
  private coinsCollected: number = 0;
  private jumpsCount: number = 0;
  private slidesCount: number = 0;
  private powerupsCollectedCount: number = 0;
  private obstaclesDodgedCount: number = 0;

  // Active Power-ups
  private activePowerUps: Map<PowerUpType, number> = new Map();

  // Track & Entity Pools
  private segments: RoadSegment[] = [];
  private obstacles: ObstacleItem[] = [];
  private coins: CoinItem[] = [];
  private powerups: PowerUpItem[] = [];
  private nextObstacleZ: number = 25;

  // Monsoon Rain Particles
  private rainParticles: THREE.Points | null = null;
  private theme: ThemeMode = 'sunset';

  // Lighting references
  private keyLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;

  // Reusable math buffers (Zero GC in render loop)
  private readonly _vecA = new THREE.Vector3();
  private readonly _vecB = new THREE.Vector3();

  constructor(container: HTMLElement, characterId: string, theme: ThemeMode, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.theme = theme;
    this.characterDef = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    // Camera positioned behind and slightly above runner for immersive portrait view
    this.camera.position.set(0, 3.4, -4.5);
    this.camera.lookAt(0, 1.4, 7);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Initialize textures and model caches
    TextureGenerator.setMaxAnisotropy(this.renderer.capabilities.getMaxAnisotropy());
    ModelFactory.init();

    // 3. Environment & Lighting
    this.setupEnvironmentAndLighting();

    // 4. Build Player Character
    this.buildPlayer();

    // 5. Initial Track Segments
    this.buildInitialTrack();

    // 6. Bind Resize & Touch/Keyboard
    window.addEventListener('resize', this.onResize);
    this.bindInputs();
  }

  private setupEnvironmentAndLighting() {
    // Studio reflection room
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.pmremGenerator.dispose();

    if (this.theme === 'sunset') {
      // Warm Mumbai Golden Hour Sunset
      this.scene.background = new THREE.Color(0xfdba74); // Vibrant orange sunset sky
      this.scene.fog = new THREE.FogExp2(0xf97316, 0.016);

      this.hemiLight = new THREE.HemisphereLight(0xffedd5, 0x431407, 0.9);
      this.scene.add(this.hemiLight);

      this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
      this.keyLight.position.set(12, 22, 10);
      if (!this.isSoftwareGl) {
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 1024;
        this.keyLight.shadow.mapSize.height = 1024;
        this.keyLight.shadow.camera.near = 0.5;
        this.keyLight.shadow.camera.far = 70;
        this.keyLight.shadow.bias = -0.0005;
        this.keyLight.shadow.normalBias = 0.02;
        const d = 16;
        this.keyLight.shadow.camera.left = -d;
        this.keyLight.shadow.camera.right = d;
        this.keyLight.shadow.camera.top = d;
        this.keyLight.shadow.camera.bottom = -d;
      }
      this.scene.add(this.keyLight);
    } else {
      // Cool Monsoon Mumbai Atmosphere
      this.scene.background = new THREE.Color(0x334155);
      this.scene.fog = new THREE.FogExp2(0x1e293b, 0.02);

      this.hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x0f172a, 0.7);
      this.scene.add(this.hemiLight);

      this.keyLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
      this.keyLight.position.set(8, 20, 12);
      if (!this.isSoftwareGl) {
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 1024;
        this.keyLight.shadow.mapSize.height = 1024;
      }
      this.scene.add(this.keyLight);

      // Rain particles
      this.setupRainParticles();
    }
  }

  private setupRainParticles() {
    const rainCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = Math.random() * 120 - 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
    });
    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  private buildPlayer() {
    this.scene.remove(this.playerGroup);
    this.playerGroup = new THREE.Group();

    const { root, updateAnimation } = ModelFactory.createRunner(this.characterDef);
    this.playerGroup.add(root);
    this.runnerAnimator = updateAnimation;

    this.playerPos.set(0, 0, 0);
    this.playerGroup.position.copy(this.playerPos);
    this.scene.add(this.playerGroup);

    // Initial perk check: Inspector Shinde has free shield at start
    if (this.characterDef.perkType === 'shield_chance') {
      this.activePowerUps.set('shield', 9999); // Shield until broken
    }
  }

  public setCharacter(characterId: string) {
    const char = CHARACTERS.find((c) => c.id === characterId);
    if (char) {
      this.characterDef = char;
      this.buildPlayer();
    }
  }

  public setTheme(theme: ThemeMode) {
    this.theme = theme;
    // Reconfigure lighting and sky
    if (this.hemiLight) this.scene.remove(this.hemiLight);
    if (this.keyLight) this.scene.remove(this.keyLight);
    if (this.rainParticles) {
      this.scene.remove(this.rainParticles);
      this.rainParticles.geometry.dispose();
      (this.rainParticles.material as THREE.Material).dispose();
      this.rainParticles = null;
    }
    this.setupEnvironmentAndLighting();
  }

  private buildInitialTrack() {
    // Clear old
    this.segments.forEach((seg) => this.scene.remove(seg.mesh));
    this.segments = [];
    this.obstacles.forEach((o) => this.scene.remove(o.mesh));
    this.obstacles = [];
    this.coins.forEach((c) => this.scene.remove(c.mesh));
    this.coins = [];
    this.powerups.forEach((p) => this.scene.remove(p.mesh));
    this.powerups = [];

    // Create segments ahead
    for (let i = 0; i < GAME_CONFIG.ACTIVE_SEGMENTS; i++) {
      const zPos = i * GAME_CONFIG.SEGMENT_LENGTH - 10;
      this.createSegmentAt(zPos);
    }
    this.nextObstacleZ = 28;
  }

  private createSegmentAt(zPos: number) {
    const segGroup = new THREE.Group();
    segGroup.position.z = zPos;

    // Road asphalt plane (3 lanes, total width ~ 7.8m)
    const roadTexture = TextureGenerator.createRoadTexture();
    const roadGeo = new THREE.PlaneGeometry(8.2, GAME_CONFIG.SEGMENT_LENGTH);
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, GAME_CONFIG.SEGMENT_LENGTH / 2);
    road.receiveShadow = !this.isSoftwareGl;
    segGroup.add(road);

    // Left and Right Footpath Sidewalk Curbs
    const curbGeo = new THREE.BoxGeometry(0.5, 0.25, GAME_CONFIG.SEGMENT_LENGTH);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });

    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-4.35, 0.12, GAME_CONFIG.SEGMENT_LENGTH / 2);
    segGroup.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(4.35, 0.12, GAME_CONFIG.SEGMENT_LENGTH / 2);
    segGroup.add(rightCurb);

    // Flanking Buildings / Chawls along roadside
    const bldCount = Math.floor(GAME_CONFIG.SEGMENT_LENGTH / 12);
    for (let b = 0; b < bldCount; b++) {
      const bZ = b * 13 + 6;

      const leftBld = ModelFactory.createStreetBuilding('left', this.theme);
      leftBld.position.set(-7.5, 0, bZ);
      segGroup.add(leftBld);

      const rightBld = ModelFactory.createStreetBuilding('right', this.theme);
      rightBld.position.set(7.5, 0, bZ);
      segGroup.add(rightBld);
    }

    // Overhead Festival Bunting String
    const bunting = ModelFactory.createFestivalBunting();
    bunting.position.set(0, 0, GAME_CONFIG.SEGMENT_LENGTH / 2);
    segGroup.add(bunting);

    this.scene.add(segGroup);
    this.segments.push({ mesh: segGroup, z: zPos });
  }

  // --- SPAWNING SYSTEM ---

  private spawnObstacleAndPickups(targetZ: number) {
    // Pick lane randomly
    const laneChoices: LaneIndex[] = [-1, 0, 1];
    const pickedLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];

    // Decide obstacle type with weighted probabilities
    const rand = Math.random();
    let type: ObstacleType = 'rickshaw';
    let width = 1.4;
    let height = 1.8;
    let depth = 2.4;
    let canJumpOver = false;
    let canSlideUnder = false;

    let obstacleMesh: THREE.Group;

    if (rand < 0.3) {
      // Auto-Rickshaw (classic, dodge sideways)
      type = 'rickshaw';
      obstacleMesh = ModelFactory.createRickshaw();
      width = 1.4;
      height = 1.6;
      depth = 2.2;
    } else if (rand < 0.52) {
      // Police Barricade (low barrier - jump over!)
      type = 'barrier_low';
      obstacleMesh = ModelFactory.createPoliceBarricade();
      width = 1.8;
      height = 0.9;
      depth = 0.6;
      canJumpOver = true;
    } else if (rand < 0.72) {
      // Overhead Scaffolding (high barrier - slide under!)
      type = 'barrier_high';
      obstacleMesh = ModelFactory.createScaffolding();
      width = 2.0;
      height = 2.2;
      depth = 0.8;
      canSlideUnder = true;
    } else if (rand < 0.88) {
      // Chai / Vada Pav Tapri Stall (dodge sideways)
      type = 'stall';
      obstacleMesh = ModelFactory.createChaiStall();
      width = 1.7;
      height = 1.9;
      depth = 1.4;
    } else {
      // Red BEST Bus (large obstacle)
      type = 'bus';
      obstacleMesh = ModelFactory.createBestBus();
      width = 1.8;
      height = 2.4;
      depth = 4.6;
    }

    obstacleMesh.position.set(LANES[pickedLane + 1], 0, targetZ);
    this.scene.add(obstacleMesh);

    this.obstacles.push({
      type,
      lane: pickedLane,
      mesh: obstacleMesh,
      z: targetZ,
      width,
      height,
      depth,
      passed: false,
      canJumpOver,
      canSlideUnder,
    });

    // Spawn companion coins:
    // If barrier_low: create a parabolic coin arc OVER the barrier!
    // If barrier_high: create a low slide coin line UNDER the scaffolding!
    // If vehicle: spawn coins on adjacent clear lanes!
    if (type === 'barrier_low') {
      // 3 coins in an arc over the barrier
      const arcOffsets = [-2, 0, 2];
      const arcHeights = [1.2, 2.2, 1.2];
      arcOffsets.forEach((dz, idx) => {
        this.spawnSingleCoin(pickedLane, targetZ + dz, arcHeights[idx]);
      });
    } else if (type === 'barrier_high') {
      // 3 low coins right under the scaffolding
      [-2, 0, 2].forEach((dz) => {
        this.spawnSingleCoin(pickedLane, targetZ + dz, 0.4);
      });
    } else {
      // Spawn line of coins in one of the OTHER lanes
      const otherLanes = laneChoices.filter((l) => l !== pickedLane);
      const coinLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
      for (let c = -3; c <= 3; c += 2) {
        this.spawnSingleCoin(coinLane, targetZ + c, 0.85);
      }
    }

    // Occasional Power-up spawn (15% chance if distance > 60m)
    if (Math.random() < 0.16 && this.distanceRun > 60) {
      const freeLanes = laneChoices.filter((l) => l !== pickedLane);
      const pLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      const pTypes: PowerUpType[] = ['magnet', 'shield', 'boost', 'multiplier'];
      const chosenType = pTypes[Math.floor(Math.random() * pTypes.length)];

      const pMesh = ModelFactory.createPowerUp(chosenType);
      const pZ = targetZ + (Math.random() > 0.5 ? 5 : -5);
      pMesh.position.set(LANES[pLane + 1], 1.2, pZ);
      this.scene.add(pMesh);

      this.powerups.push({
        mesh: pMesh,
        type: chosenType,
        lane: pLane,
        z: pZ,
        y: 1.2,
        collected: false,
      });
    }
  }

  private spawnSingleCoin(lane: LaneIndex, z: number, y: number) {
    const coinMesh = ModelFactory.createCoin();
    coinMesh.position.set(LANES[lane + 1], y, z);
    this.scene.add(coinMesh);

    this.coins.push({
      mesh: coinMesh,
      lane,
      z,
      y,
      collected: false,
    });
  }

  // --- CONTROLS & INPUT SYSTEM ---

  public swipeLeft() {
    if (!this.isRunning || this.isPaused) return;
    if (this.currentLane > -1) {
      this.currentLane = (this.currentLane - 1) as LaneIndex;
      this.targetLaneX = LANES[this.currentLane + 1];
    }
  }

  public swipeRight() {
    if (!this.isRunning || this.isPaused) return;
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as LaneIndex;
      this.targetLaneX = LANES[this.currentLane + 1];
    }
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.isSliding = false; // jump cancels slide
      // Character perk check
      const perkBoost = this.characterDef.perkType === 'score_boost' ? 1.15 : 1.0;
      this.playerVelocityY = GAME_CONFIG.JUMP_FORCE * perkBoost;
      this.jumpsCount++;
      soundManager.playJump();
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.isSliding) {
      this.isSliding = true;
      // If jumping, force rapid dive down to ground
      if (this.isJumping) {
        this.playerVelocityY = -18;
      }
      const slideBonus = this.characterDef.perkType === 'nitro_boost' ? 1.35 : 1.0;
      this.slideTimer = GAME_CONFIG.SLIDE_DURATION * slideBonus;
      this.slidesCount++;
      soundManager.playSlide();
    }
  }

  private bindInputs() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.swipeLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.swipeRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        this.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.slide();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        this.togglePause();
      }
    });

    // Touch and Mouse Swipe gestures (Mobile & Desktop)
    let touchStartX = 0;
    let touchStartY = 0;
    let isPointerActive = false;

    const handleSwipeStart = (clientX: number, clientY: number) => {
      touchStartX = clientX;
      touchStartY = clientY;
      isPointerActive = true;
    };

    const handleSwipeEnd = (clientX: number, clientY: number) => {
      if (!isPointerActive) return;
      isPointerActive = false;
      const deltaX = clientX - touchStartX;
      const deltaY = clientY - touchStartY;
      const minSwipeDist = 24;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDist) {
        if (deltaX > 0) {
          this.swipeRight();
        } else {
          this.swipeLeft();
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDist) {
        if (deltaY < 0) {
          this.jump();
        } else {
          this.slide();
        }
      }
    };

    const dom = this.container;
    dom.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 0) {
          handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );

    dom.addEventListener(
      'touchend',
      (e) => {
        if (e.changedTouches.length > 0) {
          handleSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      },
      { passive: true }
    );

    // Mouse drag support
    dom.addEventListener('mousedown', (e) => {
      handleSwipeStart(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      handleSwipeEnd(e.clientX, e.clientY);
    });
  }

  // --- GAME LIFECYCLE ---

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.currentSpeed = GAME_CONFIG.BASE_SPEED;
    this.distanceRun = 0;
    this.score = 0;
    this.coinsCollected = 0;
    this.jumpsCount = 0;
    this.slidesCount = 0;
    this.powerupsCollectedCount = 0;
    this.obstaclesDodgedCount = 0;
    this.activePowerUps.clear();
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.playerPos.set(0, 0, 0);
    this.playerVelocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;

    // Check starting shield perk for Inspector Shinde
    if (this.characterDef.perkType === 'shield_chance') {
      this.activePowerUps.set('shield', 9999);
    }

    this.buildInitialTrack();
    this.clock.start();

    soundManager.startMusic();
    this.loop();
  }

  public togglePause(): boolean {
    if (!this.isRunning) return false;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      soundManager.stopMusic();
    } else {
      this.clock.getDelta(); // flush delta
      soundManager.startMusic();
      this.loop();
    }
    return this.isPaused;
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    soundManager.stopMusic();
  }

  private gameOver() {
    this.isRunning = false;
    soundManager.stopMusic();
    soundManager.playCrash();

    const results: RunResults = {
      score: Math.floor(this.score),
      distance: Math.floor(this.distanceRun),
      coins: this.coinsCollected,
      isNewHigh: false, // will be evaluated by storage manager
      jumps: this.jumpsCount,
      slides: this.slidesCount,
      powerupsCollected: this.powerupsCollectedCount,
      obstaclesDodged: this.obstaclesDodgedCount,
    };

    this.callbacks.onGameOver(results);
  }

  // --- MAIN ANIMATION & PHYSICS TICK ---

  private loop = () => {
    if (!this.isRunning || this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.08); // cap frame spikes
    const time = this.clock.getElapsedTime();

    this.update(delta, time);
    this.renderer.render(this.scene, this.camera);

    this.frameId = requestAnimationFrame(this.loop);
  };

  private update(delta: number, time: number) {
    // 1. Boost & Multiplier Effects
    const hasNitro = this.activePowerUps.has('boost');
    const effectiveSpeedMultiplier = hasNitro ? 1.55 : 1.0;
    const speed = this.currentSpeed * effectiveSpeedMultiplier;

    // Speed progression over distance
    if (!hasNitro && this.currentSpeed < GAME_CONFIG.MAX_SPEED) {
      this.currentSpeed += (delta * GAME_CONFIG.SPEED_INCREMENT * 0.1);
    }

    // Advance forward distance & score
    const forwardStep = speed * delta;
    this.distanceRun += forwardStep;
    const scoreMultiplier = (this.activePowerUps.has('multiplier') ? 2 : 1) * (this.characterDef.perkType === 'score_boost' ? 1.2 : 1.0);
    this.score += forwardStep * 2.5 * scoreMultiplier;

    // 2. Player Lateral Smooth Damping
    this.playerPos.x = THREE.MathUtils.damp(
      this.playerPos.x,
      this.targetLaneX,
      14,
      delta
    );

    // 3. Player Jump & Slide Physics
    if (this.isJumping) {
      this.playerVelocityY += GAME_CONFIG.GRAVITY * delta;
      this.playerPos.y += this.playerVelocityY * delta;

      if (this.playerPos.y <= 0) {
        this.playerPos.y = 0;
        this.playerVelocityY = 0;
        this.isJumping = false;
      }
      this.jumpProgress = Math.min(1, this.playerPos.y / 2.2);
    } else {
      this.jumpProgress = 0;
    }

    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Apply player root position
    this.playerGroup.position.copy(this.playerPos);

    // Animate runner limbs
    if (this.runnerAnimator) {
      this.runnerAnimator(time, speed, this.isJumping, this.isSliding, this.jumpProgress);
    }

    // 4. Smooth Camera Follow
    // Camera keeps a comfortable distance behind the player with slight dynamic tilt on lane shift
    const targetCamX = this.playerPos.x * 0.65;
    const targetCamY = 3.2 + (this.isJumping ? this.playerPos.y * 0.4 : 0);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 12, delta);

    // Camera look target
    this._vecA.set(this.playerPos.x * 0.35, 1.4 + this.playerPos.y * 0.2, 7);
    this.camera.lookAt(this._vecA);

    // Dynamic keyLight follow
    if (this.keyLight) {
      this.keyLight.position.x = 12 + this.playerPos.x * 0.5;
    }

    // 5. Move Track Elements Backward (Relative motion)
    // Road Segments
    for (let i = this.segments.length - 1; i >= 0; i--) {
      const seg = this.segments[i];
      seg.mesh.position.z -= forwardStep;

      // When segment scrolls behind player view, recycle to the far front
      if (seg.mesh.position.z < -30) {
        // Find furthest segment
        let maxZ = 0;
        this.segments.forEach((s) => {
          if (s.mesh.position.z > maxZ) maxZ = s.mesh.position.z;
        });
        seg.mesh.position.z = maxZ + GAME_CONFIG.SEGMENT_LENGTH;
      }
    }

    // 6. Update & Spawn Obstacles
    this.nextObstacleZ -= forwardStep;
    if (this.nextObstacleZ <= 0) {
      // Find furthest obstacle Z
      let furthestZ = 120;
      this.obstacles.forEach((o) => {
        if (o.z > furthestZ) furthestZ = o.z;
      });
      const spawnZ = Math.max(130, furthestZ + GAME_CONFIG.OBSTACLE_SPAWN_DIST_MIN + Math.random() * 12);
      this.spawnObstacleAndPickups(spawnZ);
      this.nextObstacleZ = THREE.MathUtils.randFloat(
        GAME_CONFIG.OBSTACLE_SPAWN_DIST_MIN,
        GAME_CONFIG.OBSTACLE_SPAWN_DIST_MAX
      );
    }

    // Update Obstacle positions & collisions
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.z -= forwardStep;
      obs.mesh.position.z = obs.z;

      // Check proximity for auto rickshaw horn sound
      if (!obs.passed && obs.z < 6 && obs.z > 3 && obs.type === 'rickshaw' && obs.lane === this.currentLane) {
        soundManager.playHorn();
      }

      // Track obstacles dodged
      if (!obs.passed && obs.z < -2) {
        obs.passed = true;
        this.obstaclesDodgedCount++;
      }

      // Check Collision with player (around z = 0, player bounding radius)
      if (Math.abs(obs.z) < obs.depth * 0.5 + GAME_CONFIG.COLLISION_RADIUS_PLAYER) {
        const laneCenterX = LANES[obs.lane + 1];
        const distToLane = Math.abs(this.playerPos.x - laneCenterX);

        if (distToLane < obs.width * 0.45 + GAME_CONFIG.COLLISION_RADIUS_PLAYER) {
          // Player is in the collision zone for this obstacle!
          let hit = true;

          // Can player jump over this low barrier?
          if (obs.canJumpOver && this.playerPos.y > obs.height * 0.8) {
            hit = false; // Successfully jumped over!
          }

          // Can player slide under this high barrier?
          if (obs.canSlideUnder && this.isSliding) {
            hit = false; // Successfully slid under!
          }

          if (hit) {
            // Nitro Boost destroys obstacle without harm!
            if (hasNitro) {
              // Destroy obstacle with explosion bounce
              this.scene.remove(obs.mesh);
              this.obstacles.splice(i, 1);
              soundManager.playCrash();
              continue;
            }

            // Shield protection
            if (this.activePowerUps.has('shield')) {
              this.activePowerUps.delete('shield');
              soundManager.playShieldDeflect();
              // Bounce obstacle away
              this.scene.remove(obs.mesh);
              this.obstacles.splice(i, 1);
              continue;
            }

            // Stumble & Game Over
            this.gameOver();
            return;
          }
        }
      }

      // Recycle obstacles behind player
      if (obs.z < -35) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 7. Update Coins (Spinning, Magnet Attraction, Collection)
    const hasMagnet = this.activePowerUps.has('magnet');
    const magnetRange = GAME_CONFIG.MAGNET_RADIUS * (this.characterDef.perkType === 'magnet_boost' ? 1.3 : 1.0);

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.z -= forwardStep;
      coin.mesh.position.z = coin.z;
      coin.mesh.rotation.z += delta * 4; // spin rupee coin

      // Magnet attraction: fly toward player
      if (hasMagnet && !coin.collected) {
        const dx = this.playerPos.x - coin.mesh.position.x;
        const dz = this.playerPos.z - coin.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < magnetRange) {
          coin.mesh.position.x += dx * delta * 12;
          coin.mesh.position.y += (this.playerPos.y + 0.9 - coin.mesh.position.y) * delta * 12;
          coin.z += (this.playerPos.z - coin.z) * delta * 12;
        }
      }

      // Collect detection
      if (!coin.collected && Math.abs(coin.z) < 0.9) {
        const dx = Math.abs(this.playerPos.x - coin.mesh.position.x);
        const dy = Math.abs((this.playerPos.y + 0.8) - coin.mesh.position.y);

        if (dx < 0.85 && dy < 1.1) {
          coin.collected = true;
          const coinVal = (this.activePowerUps.has('multiplier') ? 2 : 1) * (this.characterDef.perkType === 'coin_bonus' ? 2 : 1);
          this.coinsCollected += coinVal;
          this.score += 50 * coinVal;
          soundManager.playCoin();
          this.scene.remove(coin.mesh);
          this.coins.splice(i, 1);
          continue;
        }
      }

      if (coin.z < -20) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }

    // 8. Update Power-ups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.z -= forwardStep;
      p.mesh.position.z = p.z;
      p.mesh.rotation.y += delta * 3;
      p.mesh.position.y = p.y + Math.sin(time * 4) * 0.15;

      // Collect detection
      if (!p.collected && Math.abs(p.z) < 1.0) {
        const dx = Math.abs(this.playerPos.x - LANES[p.lane + 1]);
        if (dx < 0.9) {
          p.collected = true;
          this.powerupsCollectedCount++;
          this.activePowerUps.set(p.type, GAME_CONFIG.POWERUP_DURATION);
          soundManager.playPowerup();
          this.scene.remove(p.mesh);
          this.powerups.splice(i, 1);
          continue;
        }
      }

      if (p.z < -20) {
        this.scene.remove(p.mesh);
        this.powerups.splice(i, 1);
      }
    }

    // 9. Countdown Active Power-Ups
    const activeList: PowerUpActive[] = [];
    this.activePowerUps.forEach((remTime, type) => {
      const nextTime = remTime - delta;
      if (nextTime <= 0) {
        this.activePowerUps.delete(type);
      } else {
        this.activePowerUps.set(type, nextTime);
        activeList.push({
          type,
          duration: GAME_CONFIG.POWERUP_DURATION,
          remaining: nextTime,
        });
      }
    });

    // 10. Monsoon Rain animation
    if (this.rainParticles) {
      const posAttr = this.rainParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      for (let i = 0; i < array.length; i += 3) {
        array[i + 1] -= delta * 36; // fall downwards
        array[i + 2] -= forwardStep * 0.6; // rush backwards
        if (array[i + 1] < 0) {
          array[i + 1] = 22;
        }
        if (array[i + 2] < -15) {
          array[i + 2] = 110;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 11. Send HUD metric updates
    this.callbacks.onScoreUpdate(
      Math.floor(this.score),
      Math.floor(this.distanceRun),
      this.coinsCollected
    );
    this.callbacks.onPowerUpUpdate(activeList);
  }

  // --- RESIZE & CLEANUP ---

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
