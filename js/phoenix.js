/**
 * Sparkling Celestial Phoenix (Phượng Hoàng Thần Thoại Lấp Lánh)
 * Dedicated 3D mythical avian entity flying in a dynamic 3D orbit around Chị Hằng.
 *
 * Features:
 * 1. Recognizable Avian Anatomy:
 *    - Aerodynamic Torso, Curved Neck, Glowing Curved Beak & 3-Plume Crown Crest
 *    - Articulated Double-Jointed Sweeping Wings (sine wave flap + fluid tip delay)
 *    - Glowing Cosmic Cyan/Turquoise (#00f2fe) blending to Radiant Golden Tips (#ffd166)
 *    - 5-Strand Flowing Silk Ribbon Tail with progressive delay & glowing teardrop jewels
 * 2. Sparkling Stardust & Fairy Sparkles:
 *    - Continuous glittering stardust shedding from wingtips and tail
 *    - Twinkling scale frequencies: (sin(time * 10 + seed) * 0.5 + 0.5) * maxScale
 *    - Color mix: Diamond White (#ffffff), Starlight Gold (#ffeaa7), Celestial Cyan (#00ffff)
 *    - Soft golden aura around chest (subtle, NOT a blinding flare)
 * 3. 3D Flight Orbit Around Chị Hằng:
 *    - Real elliptical 3D orbit centered at Chị Hằng (radiusX: 5.5, radiusZ: 3.5, heightBob: 0.8)
 *    - Physically loops IN FRONT of Chị Hằng (z >= -1.8) and BEHIND Chị Hằng & Moon (z < -1.8)
 *    - Dynamic depth sorting (renderOrder 30 / 50 / 70)
 *    - Velocity-aligned orientation with aerodynamic banking into turns
 * 4. Pre-allocated buffers for smooth 60 FPS with zero garbage collection.
 */

import * as THREE from '../vendor/three.module.js';

/**
 * Procedural Soft Circular Glow Texture for fairy sparkles & chest halo
 */
function createSparkleTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Multi-pass radiant starlight spark with soft falloff
  const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.85);
  rad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  rad.addColorStop(0.2, 'rgba(255, 243, 176, 0.85)'); // #fff3b0 core
  rad.addColorStop(0.5, 'rgba(0, 242, 254, 0.35)');   // #00f2fe cyan glow
  rad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, size, size);

  // Subtle 4-ray micro glint at the center
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Wing Feather Texture (Cyan/Turquoise blending into Radiant Golden Tips)
 * Canvas: 512 x 256
 */
function createAvianWingTexture(isRight = true) {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  if (!isRight) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  // 1. Soft ethereal wing aura (feathered edges)
  const auraGrad = ctx.createLinearGradient(0, 0, w, 0);
  auraGrad.addColorStop(0.0, 'rgba(255, 243, 176, 0.28)');
  auraGrad.addColorStop(0.4, 'rgba(0, 242, 254, 0.32)');
  auraGrad.addColorStop(0.8, 'rgba(255, 209, 102, 0.25)');
  auraGrad.addColorStop(1.0, 'rgba(255, 230, 140, 0.10)');

  ctx.beginPath();
  ctx.moveTo(14, 45);
  ctx.bezierCurveTo(145, 16, 315, 22, 494, 52);
  // Scalloped primary flight feather lobes
  ctx.quadraticCurveTo(455, 82, 425, 110);
  ctx.quadraticCurveTo(470, 122, 474, 134);
  ctx.quadraticCurveTo(435, 154, 385, 174);
  ctx.quadraticCurveTo(420, 184, 424, 196);
  ctx.quadraticCurveTo(375, 208, 320, 218);
  ctx.bezierCurveTo(240, 232, 120, 212, 14, 180);
  ctx.closePath();

  // Color requirement: Glowing cosmic cyan/turquoise (#00f2fe) blending into radiant golden tips (#ffd166)
  const wingGrad = ctx.createLinearGradient(0, 0, w, 0);
  wingGrad.addColorStop(0.0, 'rgba(255, 243, 176, 0.95)'); // #fff3b0 warm golden shoulder
  wingGrad.addColorStop(0.2, 'rgba(0, 242, 254, 0.92)');   // #00f2fe turquoise spar
  wingGrad.addColorStop(0.65, 'rgba(0, 210, 255, 0.88)');  // deep cosmic cyan
  wingGrad.addColorStop(0.88, 'rgba(255, 209, 102, 0.90)'); // #ffd166 radiant golden tips
  wingGrad.addColorStop(1.0, 'rgba(255, 243, 176, 0.75)');  // starlight shimmer at extreme tips

  ctx.fillStyle = wingGrad;
  ctx.shadowColor = 'rgba(0, 242, 254, 0.75)';
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 2. Glowing feather vanes & shaft lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(14, 55);
  ctx.bezierCurveTo(155, 36, 305, 42, 470, 60);
  ctx.stroke();

  // Secondary radiating feather quills
  const quills = [
    { from: [100, 42], to: [160, 215], col: 'rgba(0, 242, 254, 0.65)', w: 2.0 },
    { from: [180, 38], to: [250, 222], col: 'rgba(0, 242, 254, 0.70)', w: 2.0 },
    { from: [260, 40], to: [330, 215], col: 'rgba(255, 209, 102, 0.75)', w: 2.2 },
    { from: [330, 44], to: [385, 174], col: 'rgba(255, 209, 102, 0.80)', w: 2.2 },
    { from: [400, 50], to: [425, 112], col: 'rgba(255, 243, 176, 0.85)', w: 2.2 },
    { from: [440, 54], to: [474, 134], col: 'rgba(255, 243, 176, 0.85)', w: 2.2 },
  ];

  quills.forEach((q) => {
    ctx.strokeStyle = q.col;
    ctx.lineWidth = q.w;
    ctx.beginPath();
    ctx.moveTo(q.from[0], q.from[1]);
    ctx.quadraticCurveTo(
      (q.from[0] + q.to[0]) * 0.5 + 14,
      (q.from[1] + q.to[1]) * 0.5 - 10,
      q.to[0],
      q.to[1]
    );
    ctx.stroke();
  });

  // Soft misty border stroke
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
  ctx.lineWidth = 4.0;
  ctx.stroke();

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Procedural Tail Ribbon Texture with glowing teardrop jewel eye (64 x 512)
 */
function createTailRibbonTexture() {
  const w = 64;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Gradient along ribbon length: warm gold at root -> cyan/turquoise -> golden tip
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0, 'rgba(255, 243, 176, 0.95)'); // #fff3b0 root
  grad.addColorStop(0.25, 'rgba(255, 209, 102, 0.90)'); // #ffd166
  grad.addColorStop(0.55, 'rgba(0, 242, 254, 0.90)');   // #00f2fe turquoise
  grad.addColorStop(0.85, 'rgba(255, 209, 102, 0.85)'); // radiant gold
  grad.addColorStop(1.0, 'rgba(255, 243, 176, 0.70)');  // golden tip

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h - 50);

  // Soft crosswise alpha taper
  const crossGrad = ctx.createLinearGradient(0, 0, w, 0);
  crossGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.5)');
  crossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
  crossGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.5)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = crossGrad;
  ctx.fillRect(0, 0, w, h - 50);

  // Reset composite for the glowing teardrop jewel at the tail tip
  ctx.globalCompositeOperation = 'source-over';
  const eyeCy = h - 28;
  const eyeCx = w / 2;

  // Golden outer teardrop frame
  ctx.fillStyle = '#ffd166';
  ctx.shadowColor = 'rgba(255, 209, 102, 0.85)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(eyeCx, eyeCy, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Luminous cyan jewel core
  ctx.fillStyle = '#00f2fe';
  ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(eyeCx, eyeCy, 7, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Diamond white center highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eyeCx, eyeCy - 2, 3, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class StardustPhoenix {
  /**
   * @param {Object} options
   * @param {PaperStage} [options.stage]
   * @param {THREE.Scene} [options.scene]
   * @param {THREE.Camera} [options.camera]
   * @param {HTMLCanvasElement} [options.canvas]
   * @param {number} [options.speed=1.0]
   */
  constructor(options = {}) {
    this.options = Object.assign({
      stage: null,
      scene: null,
      camera: null,
      canvas: null,
      speed: 1.0,
    }, options);

    this.stage = this.options.stage;
    this.flightSpeed = this.options.speed;

    // Determine integration mode
    this.isIntegrated = !!(this.options.scene && this.options.camera);

    if (this.isIntegrated) {
      this.scene = this.options.scene;
      this.camera = this.options.camera;
      this.renderer = null;
      // If a separate overlay canvas existed, hide it to save 100% of its GPU overhead
      const oldCanvas = this.options.canvas || document.getElementById('phoenix-canvas');
      if (oldCanvas) {
        oldCanvas.style.display = 'none';
        oldCanvas.style.pointerEvents = 'none';
      }
    } else {
      // Standalone canvas fallback
      this.canvas = this.options.canvas || document.getElementById('phoenix-canvas');
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 32);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Textures
    this.sparkleTex = createSparkleTexture(64);
    this.leftWingTex = createAvianWingTexture(false);
    this.rightWingTex = createAvianWingTexture(true);
    this.ribbonTex = createTailRibbonTexture();

    // Flight Orbit State (Orbit around Chị Hằng)
    this.orbitTime = 0;
    this.currentPosition = new THREE.Vector3(5.5, 2.15, -1.8);
    this.currentOrientation = new THREE.Quaternion();
    this.bankAngle = 0;

    // Scratch vector allocation for ZERO heap thrashing
    this._vForward = new THREE.Vector3();
    this._vRight = new THREE.Vector3();
    this._vUp = new THREE.Vector3();
    this._vTargetUp = new THREE.Vector3();
    this._worldUp = new THREE.Vector3(0, 1, 0);
    this._rotMatrix = new THREE.Matrix4();
    this._targetQuat = new THREE.Quaternion();
    this._scratchA = new THREE.Vector3();
    this._scratchB = new THREE.Vector3();
    this._scratchC = new THREE.Vector3(); // pre-allocated to avoid GC in emitWingAndTailSparkles


    // Root Entity Group
    this.rootGroup = new THREE.Group();
    this.rootGroup.renderOrder = 70; // In front of Chị Hằng (62) initially
    this.scene.add(this.rootGroup);

    // Build the 4 Anatomical Components
    this.buildBodyAndCrown();
    this.buildArticulatedWings();
    this.buildMultiStrandTail();
    this.buildSparkleParticleEmitter();

    // Event listeners
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize, { passive: true });

    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.rafId = null;

    // If not integrated with PaperStage, start standalone loop
    if (!this.isIntegrated) {
      this.start();
    }
  }

  // -------------------------------------------------------------
  // 1. RECOGNIZABLE MYTHICAL PHOENIX ANATOMY: Head, Beak & Crown
  // -------------------------------------------------------------
  buildBodyAndCrown() {
    this.bodyGroup = new THREE.Group();
    this.rootGroup.add(this.bodyGroup);

    // Warm golden emissive materials (#fff3b0 core, #ffd166 amber glow)
    const goldMat = new THREE.MeshBasicMaterial({
      color: 0xfff3b0,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const amberMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });

    // A. Torso: sleek, aerodynamic elongated oval (slightly wider for continuity)
    const torsoGeo = new THREE.SphereGeometry(0.28, 18, 14);
    torsoGeo.scale(0.36, 0.30, 1.10); // Compact: was 0.38,0.32,1.20
    const torsoMesh = new THREE.Mesh(torsoGeo, goldMat);
    torsoMesh.position.set(0, 0, 0);
    this.bodyGroup.add(torsoMesh);

    // A2. CONNECTOR — Torso → Neck bridge (fills the gap)
    const connTNGeo = new THREE.CylinderGeometry(0.13, 0.17, 0.30, 12);
    connTNGeo.rotateX(Math.PI / 3.4);
    connTNGeo.translate(0, 0.13, 0.36);
    const connTNMesh = new THREE.Mesh(connTNGeo, goldMat);
    this.bodyGroup.add(connTNMesh);

    // B. Curved Neck: tapering forward and gracefully upward
    const neckGeo = new THREE.CylinderGeometry(0.10, 0.17, 0.52, 14);
    neckGeo.rotateX(Math.PI / 3.4);
    neckGeo.translate(0, 0.23, 0.54);
    const neckMesh = new THREE.Mesh(neckGeo, goldMat);
    this.bodyGroup.add(neckMesh);

    // B2. CONNECTOR — Neck → Head bridge (fills the gap)
    const connNHGeo = new THREE.SphereGeometry(0.125, 10, 8);
    connNHGeo.scale(1.0, 1.1, 1.1);
    connNHGeo.translate(0, 0.33, 0.72);
    const connNHMesh = new THREE.Mesh(connNHGeo, goldMat);
    this.bodyGroup.add(connNHMesh);

    // C. Head: sleek aerodynamic avian head
    const headGeo = new THREE.SphereGeometry(0.14, 16, 12);
    headGeo.scale(0.19, 0.21, 0.27);
    headGeo.translate(0, 0.39, 0.80);
    const headMesh = new THREE.Mesh(headGeo, goldMat);
    this.bodyGroup.add(headMesh);

    // D. Beak: elegant glowing curved beak
    const beakGeo = new THREE.ConeGeometry(0.053, 0.30, 10);
    beakGeo.rotateX(Math.PI / 2 + 0.12);
    beakGeo.translate(0, 0.34, 1.00);
    const beakMesh = new THREE.Mesh(beakGeo, amberMat);
    this.bodyGroup.add(beakMesh);

    // E. Eyes: two delicate glowing celestial cyan starlight points
    const eyeGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, depthWrite: false });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.10, 0.41, 0.83);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.10, 0.41, 0.83);
    this.bodyGroup.add(leftEye);
    this.bodyGroup.add(rightEye);

    // F. Crown Crest (Mào Phượng Lông Vũ): 3 layered crest feathers arching backwards
    this.crownPlumes = [];
    const crownConfigs = [
      { ang: 0,     length: 0.75, z: 0.76, y: 0.47 },
      { ang: -0.24, length: 0.65, z: 0.72, y: 0.45 },
      { ang:  0.24, length: 0.65, z: 0.72, y: 0.45 },
    ];

    crownConfigs.forEach((cfg, idx) => {
      const plumeGeo = new THREE.PlaneGeometry(0.11, cfg.length, 4, 10);
      plumeGeo.translate(0, cfg.length * 0.5, 0);
      plumeGeo.rotateX(-Math.PI / 3.1);
      plumeGeo.rotateZ(cfg.ang);

      const plumeMat = new THREE.MeshBasicMaterial({
        map: this.ribbonTex,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const plumeMesh = new THREE.Mesh(plumeGeo, plumeMat);
      plumeMesh.position.set(Math.sin(cfg.ang) * 0.07, cfg.y, cfg.z);
      plumeMesh.userData = { id: idx, baseAng: cfg.ang };
      this.bodyGroup.add(plumeMesh);
      this.crownPlumes.push(plumeMesh);
    });

    // G1. FULL-BODY AURA — large elongated glow sprite behind entire torso+neck (đổ bóng sáng)
    const bodyAuraMat = new THREE.SpriteMaterial({
      map: this.sparkleTex,
      color: 0xfff3b0,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.bodyAura = new THREE.Sprite(bodyAuraMat);
    this.bodyAura.scale.set(1.5, 2.4, 1);
    this.bodyAura.position.set(0, 0.20, 0.32);
    this.bodyGroup.add(this.bodyAura);

    // G2. CORE CHEST GLOW — brighter tighter glow at chest center
    const chestHaloMat = new THREE.SpriteMaterial({
      map: this.sparkleTex,
      color: 0xfff3b0,
      transparent: true,
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.chestHalo = new THREE.Sprite(chestHaloMat);
    this.chestHalo.scale.set(1.15, 1.15, 1);
    this.chestHalo.position.set(0, 0.10, 0.20);
    this.bodyGroup.add(this.chestHalo);

    // G3. HEAD CROWN GLOW — warm golden halo behind the head + crest
    const headGlowMat = new THREE.SpriteMaterial({
      map: this.sparkleTex,
      color: 0xffe082,
      transparent: true,
      opacity: 0.40,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.headGlow = new THREE.Sprite(headGlowMat);
    this.headGlow.scale.set(0.75, 0.82, 1);
    this.headGlow.position.set(0, 0.42, 0.76);
    this.bodyGroup.add(this.headGlow);
  }

  // -------------------------------------------------------------
  // 2. ARTICULATED SWEEPING WINGS (Đôi Cánh Lụa Vỗ Sóng)
  // Double-jointed: inner shoulder joint + outer wingtip joint with fluid delay
  // -------------------------------------------------------------
  buildArticulatedWings() {
    // Wing Material: Glowing cosmic cyan/turquoise (#00f2fe) blending to golden tips (#ffd166)
    // with blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85
    const leftWingMat = new THREE.MeshBasicMaterial({
      map: this.leftWingTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rightWingMat = new THREE.MeshBasicMaterial({
      map: this.rightWingTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // LEFT WING HIERARCHY
    // 1. Left Inner Wing (pivots at shoulder)
    this.leftWing = new THREE.Group();
    this.leftWing.position.set(-0.25, 0.08, 0.15);

    const innerW = 1.35;
    const innerH = 1.25;
    const leftInnerGeo = new THREE.PlaneGeometry(innerW, innerH, 8, 4);
    leftInnerGeo.translate(-innerW * 0.5, -innerH * 0.12, 0);
    leftInnerGeo.rotateX(-Math.PI / 2);
    this.leftInnerMesh = new THREE.Mesh(leftInnerGeo, leftWingMat);
    this.leftWing.add(this.leftInnerMesh);

    // 2. Left Outer Wing Tip (articulates with fluid phase delay)
    this.leftWingTip = new THREE.Group();
    this.leftWingTip.position.set(-innerW, 0, -0.15);

    const tipW = 1.45;
    const tipH = 1.15;
    const leftTipGeo = new THREE.PlaneGeometry(tipW, tipH, 12, 6);
    leftTipGeo.translate(-tipW * 0.5, -tipH * 0.12, 0);
    leftTipGeo.rotateX(-Math.PI / 2);
    this.leftTipMesh = new THREE.Mesh(leftTipGeo, leftWingMat);
    this.leftWingTip.add(this.leftTipMesh);
    this.leftWing.add(this.leftWingTip);

    this.rootGroup.add(this.leftWing);

    // RIGHT WING HIERARCHY
    // 1. Right Inner Wing (pivots at shoulder)
    this.rightWing = new THREE.Group();
    this.rightWing.position.set(0.25, 0.08, 0.15);

    const rightInnerGeo = new THREE.PlaneGeometry(innerW, innerH, 8, 4);
    rightInnerGeo.translate(innerW * 0.5, -innerH * 0.12, 0);
    rightInnerGeo.rotateX(-Math.PI / 2);
    this.rightInnerMesh = new THREE.Mesh(rightInnerGeo, rightWingMat);
    this.rightWing.add(this.rightInnerMesh);

    // 2. Right Outer Wing Tip (articulates with fluid phase delay)
    this.rightWingTip = new THREE.Group();
    this.rightWingTip.position.set(innerW, 0, -0.15);

    const rightTipGeo = new THREE.PlaneGeometry(tipW, tipH, 12, 6);
    rightTipGeo.translate(tipW * 0.5, -tipH * 0.12, 0);
    rightTipGeo.rotateX(-Math.PI / 2);
    this.rightTipMesh = new THREE.Mesh(rightTipGeo, rightWingMat);
    this.rightWingTip.add(this.rightTipMesh);
    this.rightWing.add(this.rightWingTip);

    this.rootGroup.add(this.rightWing);
  }

  // -------------------------------------------------------------
  // 3. FLOWING MULTI-STRAND TAIL (Đuôi Phượng Lộng Lẫy 5 Nhánh)
  // Progressive sinusoidal delay with glowing teardrop jewels at tips
  // -------------------------------------------------------------
  buildMultiStrandTail() {
    this.tailRibbons = [];
    const numSegments = 20; // was 32 — fewer vertex writes for 60fps


    // 5 royal trailing ribbons
    const strands = [
      { id: 0, length: 5.2, lateralSpread: 0.00, phase: 0.0, width: 0.20 },  // Center main
      { id: 1, length: 4.4, lateralSpread: -0.22, phase: 0.8, width: 0.17 }, // Left mid
      { id: 2, length: 4.4, lateralSpread: 0.22, phase: -0.8, width: 0.17 }, // Right mid
      { id: 3, length: 3.6, lateralSpread: -0.42, phase: 1.6, width: 0.15 }, // Left outer
      { id: 4, length: 3.6, lateralSpread: 0.42, phase: -1.6, width: 0.15 }, // Right outer
    ];

    strands.forEach((s) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array((numSegments + 1) * 2 * 3);
      const uvs = new Float32Array((numSegments + 1) * 2 * 2);
      const idx = [];

      for (let i = 0; i < numSegments; i++) {
        const a = i * 2;
        const b = a + 1;
        const c = (i + 1) * 2;
        const d = c + 1;
        idx.push(a, b, c);
        idx.push(b, d, c);
      }

      for (let i = 0; i <= numSegments; i++) {
        const u = i / numSegments;
        uvs[i * 4 + 0] = 0;
        uvs[i * 4 + 1] = u;
        uvs[i * 4 + 2] = 1;
        uvs[i * 4 + 3] = u;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geo.setIndex(idx);

      const mat = new THREE.MeshBasicMaterial({
        map: this.ribbonTex,
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.userData = s;
      this.rootGroup.add(mesh);
      this.tailRibbons.push(mesh);
    });
  }

  // -------------------------------------------------------------
  // 4. SPARKLING STARDUST PARTICLE EMITTER (Kim Tuyến & Bụi Sao)
  // Continuous glittering sparkles shedding from wingtips and tail
  // -------------------------------------------------------------
  buildSparkleParticleEmitter() {
    this.maxParticles = 160; // was 350 — reduced for 60fps headroom

    this.particlePool = [];

    const positions = new Float32Array(this.maxParticles * 3);
    const colors = new Float32Array(this.maxParticles * 3);
    const sizes = new Float32Array(this.maxParticles);
    const alphas = new Float32Array(this.maxParticles);

    // Color palette: Diamond White (#ffffff), Starlight Gold (#ffeaa7), Celestial Cyan (#00ffff)
    const colorChoices = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffeaa7'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ffd166'),
    ];

    for (let i = 0; i < this.maxParticles; i++) {
      const col = colorChoices[i % colorChoices.length];
      this.particlePool.push({
        alive: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1.5,
        maxScale: 0.35 + Math.random() * 0.35,
        seed: Math.random() * Math.PI * 2,
        r: col.r,
        g: col.g,
        b: col.b,
      });

      positions[i * 3 + 2] = -9999;
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      sizes[i] = 0;
      alphas[i] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTexture: { value: this.sparkleTex } },
      vertexShader: `
        attribute vec3 customColor;
        attribute float size;
        attribute float alpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = customColor;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = max(1.0, size * (280.0 / max(0.1, -mvPosition.z)));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor * tex.rgb, tex.a * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.sparkleMesh = new THREE.Points(geo, mat);
    this.sparkleMesh.frustumCulled = false;
    this.scene.add(this.sparkleMesh);
  }

  spawnSparkle(pos, vel) {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particlePool[i];
      if (!p.alive) {
        p.alive = true;
        p.pos.copy(pos);
        p.vel.copy(vel);
        p.life = 0;
        p.maxLife = 1.1 + Math.random() * 0.7;
        p.maxScale = 0.35 + Math.random() * 0.35;
        p.seed = Math.random() * Math.PI * 2;
        break;
      }
    }
  }

  triggerStardustBurst(count = 50) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI;
      const speed = 1.2 + Math.random() * 3.8;
      this._scratchA.set(
        Math.cos(angle) * Math.cos(pitch) * speed,
        Math.sin(pitch) * speed,
        Math.sin(angle) * Math.cos(pitch) * speed
      );
      this.spawnSparkle(this.currentPosition, this._scratchA);
    }
  }

  // -------------------------------------------------------------
  // 3. 3D FLIGHT ORBIT AROUND CHỊ HẰNG (Quỹ Đạo Bay Quanh Chị Hằng)
  // -------------------------------------------------------------
  getChịHằngCoordinates() {
    // Dynamically retrieve Chị Hằng's 3D position if available in PaperStage
    if (this.stage && this.stage.goddessPuppet) {
      return this.stage.goddessPuppet.group.position;
    }
    // Default Mid-Autumn Stage coordinates for Chị Hằng
    return { x: 0, y: 1.65, z: -1.8 };
  }

  getOrbitPoint(time, outVec) {
    const hangNga = this.getChịHằngCoordinates();
    const targetX = hangNga.x || 0;
    const targetY = hangNga.y || 1.65;
    const targetZ = hangNga.z || -1.8;

    const orbitSpeed = 0.8 * this.flightSpeed;
    const radiusX = 5.5; // Bán kính vòng cung ngang
    const radiusZ = 3.5; // Bán kính chiều sâu để lượn ra trước và sau lưng Chị Hằng
    const heightBob = Math.sin(time * 1.2) * 0.8;

    const x = targetX + Math.cos(time * orbitSpeed) * radiusX;
    const z = targetZ + Math.sin(time * orbitSpeed) * radiusZ;
    const y = targetY + 0.5 + heightBob;

    outVec.set(x, y, z);
    return outVec;
  }

  // -------------------------------------------------------------
  // MAIN UPDATE LOOP (60 FPS BUTTER-SMOOTH)
  // -------------------------------------------------------------
  update(dt, t) {
    dt = Math.min(dt, 0.05);

    // 1. Advance 3D Orbit around Chị Hằng
    this.orbitTime += dt;
    this.getOrbitPoint(this.orbitTime, this._scratchA);
    this.currentPosition.copy(this._scratchA);
    this.rootGroup.position.copy(this.currentPosition);

    // 2. Depth Sorting & Z-Index Layering
    // - When z < -3.8: passes BEHIND the Moon (renderOrder: 30)
    // - When -3.8 <= z < -1.8: passes BEHIND Chị Hằng, in FRONT of Moon (renderOrder: 50)
    // - When z >= -1.8: swoops in FRONT of Chị Hằng (renderOrder: 70)
    const currentZ = this.currentPosition.z;
    let targetOrder = 70;
    if (currentZ < -3.8) {
      targetOrder = 30; // Behind Moon (40)
    } else if (currentZ < -1.8) {
      targetOrder = 50; // Between Moon (40) and Chị Hằng (62)
    }

    if (this.rootGroup.renderOrder !== targetOrder) {
      this.rootGroup.renderOrder = targetOrder;
      this.rootGroup.traverse((obj) => {
        if (obj.isMesh || obj.isPoints || obj.isSprite) {
          obj.renderOrder = targetOrder;
        }
      });
      if (this.sparkleMesh) {
        this.sparkleMesh.renderOrder = targetOrder + 1;
      }
    }

    // 3. Aerodynamic Banking & Orientation (Đầu luôn hướng về phía trước)
    this.getOrbitPoint(this.orbitTime + 0.02, this._scratchB);
    this._vForward.subVectors(this._scratchB, this.currentPosition).normalize();

    this.getOrbitPoint(this.orbitTime + 0.05, this._scratchA);
    this._scratchA.sub(this._scratchB).normalize();

    this._vRight.crossVectors(this._worldUp, this._vForward).normalize();
    const turnRate = this._scratchA.dot(this._vRight);

    // Realistic roll/banking into turns (tilts inward based on angular velocity)
    const targetBank = THREE.MathUtils.clamp(turnRate * 4.2, -0.85, 0.85);
    this.bankAngle += (targetBank - this.bankAngle) * (1.0 - Math.exp(-6.5 * dt));

    this._vTargetUp.copy(this._worldUp).applyAxisAngle(this._vForward, this.bankAngle);
    this._vRight.crossVectors(this._vTargetUp, this._vForward).normalize();
    this._vUp.crossVectors(this._vForward, this._vRight).normalize();

    this._rotMatrix.makeBasis(this._vRight, this._vUp, this._vForward);
    this._targetQuat.setFromRotationMatrix(this._rotMatrix);
    this.currentOrientation.slerp(this._targetQuat, 1.0 - Math.exp(-9.0 * dt));
    this.rootGroup.quaternion.copy(this.currentOrientation);

    // 4. Articulated Wings Flapping (User architectural requirement)
    // leftWing.rotation.z = Math.sin(time * 3.2) * 0.45;
    // leftWingTip.rotation.z = Math.sin(time * 3.2 - 0.4) * 0.3;
    const flapTime = t * 3.2 * this.flightSpeed;
    const innerFlap = Math.sin(flapTime) * 0.45;
    const tipFlap = Math.sin(flapTime - 0.4) * 0.30; // Fluid phase delay

    this.leftWing.rotation.z = innerFlap;
    this.leftWingTip.rotation.z = tipFlap;

    this.rightWing.rotation.z = -innerFlap;
    this.rightWingTip.rotation.z = -tipFlap;

    // Aerodynamic pitch wave on wings
    const pitchFlap = Math.cos(flapTime) * 0.12;
    this.leftWing.rotation.x = pitchFlap;
    this.rightWing.rotation.x = pitchFlap;

    // 5. Crown Crest Feathers Harmonic Sway
    this.crownPlumes.forEach((p, i) => {
      p.rotation.z = p.userData.baseAng + Math.sin(t * 3.5 + i * 1.1) * 0.08;
    });

    // 6. Glow Sprites Breathing (đổ bóng sáng pulse)
    if (this.chestHalo) {
      const haloScale = 1.4 + Math.sin(t * 2.4) * 0.18;
      this.chestHalo.scale.set(haloScale, haloScale, 1);
      this.chestHalo.material.opacity = 0.52 + Math.sin(t * 3.0) * 0.12;
    }
    if (this.bodyAura) {
      const auraScaleX = 1.8 + Math.sin(t * 1.8) * 0.15;
      const auraScaleY = 3.0 + Math.sin(t * 1.4) * 0.25;
      this.bodyAura.scale.set(auraScaleX, auraScaleY, 1);
      this.bodyAura.material.opacity = 0.24 + Math.sin(t * 2.1 + 0.8) * 0.08;
    }
    if (this.headGlow) {
      const hgScale = 0.9 + Math.sin(t * 3.5 + 1.2) * 0.12;
      this.headGlow.scale.set(hgScale, hgScale * 1.1, 1);
      this.headGlow.material.opacity = 0.36 + Math.sin(t * 2.8 + 0.5) * 0.10;
    }

    // 7. Multi-Strand Tail progressive wave delay
    this.updateMultiStrandTail(t);

    // 8. Continuous Sparkling Stardust Emission from Wingtips & Tail
    this.emitWingAndTailSparkles(innerFlap);

    // 9. Update Active Sparkle Particles
    this.updateSparkles(dt, t);
  }

  // Multi-Strand Tail with progressive sinusoidal delay: yOffset = Math.sin(time * 2.8 - index * 0.4) * 0.3
  updateMultiStrandTail(t) {
    this.tailRibbons.forEach((mesh) => {
      const { id, length, lateralSpread, phase, width } = mesh.userData;
      const posAttr = mesh.geometry.attributes.position;
      const posArr = posAttr.array;
      const numSegments = 20; // must match buildMultiStrandTail


      for (let i = 0; i <= numSegments; i++) {
        const u = i / numSegments;
        const z = -0.9 - u * length;

        // User formula: progressive sinusoidal delay per strand index and along segment u
        const yOffset = Math.sin(t * 2.8 - id * 0.4 - u * 3.2) * 0.30 * Math.pow(u, 1.2);
        const xOffset = lateralSpread * (1.0 + u * 0.6) +
          Math.sin(t * 2.4 - id * 0.35 - u * 2.8 + phase) * 0.35 * Math.pow(u, 1.2);

        // Ribbon width: expands slightly mid-length, tapers to tip jewel
        const w = width * (1.0 - u * 0.30) * Math.sin(Math.pow(u, 0.45) * Math.PI);

        const vIdx = i * 6;
        posArr[vIdx + 0] = xOffset - w * 0.5;
        posArr[vIdx + 1] = yOffset;
        posArr[vIdx + 2] = z;

        posArr[vIdx + 3] = xOffset + w * 0.5;
        posArr[vIdx + 4] = yOffset;
        posArr[vIdx + 5] = z;
      }

      posAttr.needsUpdate = true;
    });
  }

  // Continuous emission from wingtips and tail
  emitWingAndTailSparkles(innerFlap) {
    // Left wingtip sparkle
    this._scratchA.set(-2.6, innerFlap * 1.4, -0.2).applyQuaternion(this.currentOrientation).add(this.currentPosition);
    this._scratchC.set((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
    this._scratchB.copy(this._vForward).multiplyScalar(-0.25).add(this._scratchC);
    this.spawnSparkle(this._scratchA, this._scratchB);

    // Right wingtip sparkle
    this._scratchA.set(2.6, -innerFlap * 1.4, -0.2).applyQuaternion(this.currentOrientation).add(this.currentPosition);
    this._scratchC.set((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
    this._scratchB.copy(this._vForward).multiplyScalar(-0.25).add(this._scratchC);
    this.spawnSparkle(this._scratchA, this._scratchB);

    // Tail streamer tip sparkles
    if (Math.random() < 0.55) { // was 0.65 — emit slightly less often for perf
      const strandIdx = Math.floor(Math.random() * this.tailRibbons.length);
      const mesh = this.tailRibbons[strandIdx];
      if (mesh) {
        const { length, lateralSpread } = mesh.userData;
        this._scratchA.set(lateralSpread, 0, -0.9 - length).applyQuaternion(this.currentOrientation).add(this.currentPosition);
        this._scratchC.set((Math.random() - 0.5) * 0.15, -0.05, (Math.random() - 0.5) * 0.15);
        this._scratchB.copy(this._vForward).multiplyScalar(-0.15).add(this._scratchC);
        this.spawnSparkle(this._scratchA, this._scratchB);
      }
    }
  }


  // Update particles with randomized twinkle frequencies and soft downward drift
  updateSparkles(dt, t) {
    const geo = this.sparkleMesh.geometry;
    const posArr = geo.attributes.position.array;
    const sizeArr = geo.attributes.size.array;
    const alphaArr = geo.attributes.alpha.array;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particlePool[i];
      const i3 = i * 3;

      if (!p.alive) {
        posArr[i3 + 0] = 0;
        posArr[i3 + 1] = 0;
        posArr[i3 + 2] = -9999;
        sizeArr[i] = 0;
        alphaArr[i] = 0;
        continue;
      }

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.alive = false;
        continue;
      }

      const progress = p.life / p.maxLife;

      // Soft air drag / damping
      p.vel.multiplyScalar(0.965);
      // Soft downward drift
      p.vel.y -= 0.14 * dt;
      p.pos.addScaledVector(p.vel, dt);

      // Randomized twinkle frequency: particle.scale = (Math.sin(time * 10 + particle.seed) * 0.5 + 0.5) * maxScale;
      const twinkle = Math.sin(t * 10.0 + p.seed) * 0.5 + 0.5;
      const size = twinkle * p.maxScale * (1.0 - progress * 0.4);

      // Smooth fade out to 0
      const alpha = Math.max(0, 1.0 - Math.pow(progress, 1.4)) * 0.92;

      posArr[i3 + 0] = p.pos.x;
      posArr[i3 + 1] = p.pos.y;
      posArr[i3 + 2] = p.pos.z;

      sizeArr[i] = size;
      alphaArr[i] = alpha;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
    geo.attributes.alpha.needsUpdate = true;
  }

  onResize() {
    if (!this.isIntegrated && this.renderer) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    }
  }

  // -------------------------------------------------------------
  // CONTROLS & API
  // -------------------------------------------------------------
  start() {
    if (this.isRunning || this.isIntegrated) return;
    this.isRunning = true;
    this.clock.start();

    const loop = () => {
      if (!this.isRunning) return;
      this.rafId = requestAnimationFrame(loop);
      const dt = this.clock.getDelta();
      const t = this.clock.getElapsedTime();
      this.update(dt, t);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setSpeed(speed) {
    this.flightSpeed = Math.max(0.2, Math.min(3.0, speed));
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);

    if (this.rootGroup && this.scene) {
      this.scene.remove(this.rootGroup);
    }
    if (this.sparkleMesh && this.scene) {
      this.scene.remove(this.sparkleMesh);
    }

    if (!this.isIntegrated && this.renderer) {
      this.renderer.dispose();
    }
  }
}
