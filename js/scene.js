import * as THREE from "three";
import {
  makeNebulaTexture,
  makeMoonTexture,
  makeGlowTexture,
  makeCloudsTexture,
  makeBanyanTexture,
  makePalaceTexture,
  makeGoddessTexture,
  makeLionTexture,
  makeEyelidTexture,
  makeEyeTexture,
  makeBannerTexture,
  makeFloorTexture,
  makeLanternTexture,
  makeRabbitTexture,
  makeLotusLanternTexture,
  makeRabbitLanternTexture,
} from "./textures.js?v=14";

import { Fireflies, Embers, Fireworks } from "./particles.js?v=11";

function canvasTex(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Creates a paper cutout mesh with physical drop shadow and emissive boost.
 */
function paperMesh(source, {
  width,
  height,
  transparent = true,
  emissiveBoost = 0,
  addShadow = false,
  shadowOpacity = 0.45,
  renderOrder = 0,
  originTop = false,
}) {
  const tex = (source && source.isTexture) ? source : canvasTex(source);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  if (emissiveBoost > 0) {
    mat.color.setScalar(1 + emissiveBoost * 0.18);
  }
  const geo = new THREE.PlaneGeometry(width, height);
  if (originTop) {
    geo.translate(0, -height / 2, 0);
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = renderOrder;

  // Physical paper drop-shadow plane behind the cutout
  if (addShadow) {
    const shadowMat = new THREE.MeshBasicMaterial({
      map: tex,
      color: 0x02040b,
      transparent: true,
      opacity: shadowOpacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const shadowGeo = new THREE.PlaneGeometry(width, height);
    if (originTop) {
      shadowGeo.translate(0, -height / 2, 0);
    }
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.renderOrder = Math.max(0, renderOrder - 1);
    shadowMesh.position.set(0.04 * (width / 3), -0.05 * (height / 3), -0.05);
    shadowMesh.scale.set(1.02, 1.02, 1);
    mesh.add(shadowMesh);
    mesh.userData.shadowMesh = shadowMesh;
  }

  return mesh;
}

function glowSprite(size, color, opacity = 0.7, renderOrder = 0) {
  const mat = new THREE.SpriteMaterial({
    map: canvasTex(makeGlowTexture(256, color)),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const s = new THREE.Sprite(mat);
  s.scale.set(size, size, 1);
  s.renderOrder = renderOrder;
  return s;
}

export class PaperStage {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };
    this.parallaxWeight = 0;
    this.opened = false;
    this.ribbonMeshes = [];
    this.lionGroups = [];
    this.banners = [];
    this.rayTargets = [];
    this.lotusLanterns = [];
    this.goddessPuppet = null;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    // Cap pixel ratio at 1.25 to guarantee silky 60-120 FPS without fill-rate throttling
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x030612, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04081c, 0.024);

    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      80
    );
    this.camera.position.set(0, 0.45, 11);
    this.baseCameraZ = 8.0;
    this.baseCameraY = 0.45;
    this.baseLookAtY = 0.85;

    this.build();
    this.updateResponsiveLayout();
    window.addEventListener("resize", () => this.onResize());
  }

  build() {
    const S = this.scene;

    // ——— 1. Lighting Setup ———
    S.add(new THREE.AmbientLight(0x18224b, 0.65));

    this.moonBacklight = new THREE.PointLight(0xffe6a5, 4.5, 26, 1.7);
    this.moonBacklight.position.set(0, 1.8, -3.6);
    S.add(this.moonBacklight);

    this.leftRimLight = new THREE.PointLight(0xffaa33, 2.2, 14, 2);
    this.leftRimLight.position.set(-4.2, -1.0, 2.0);
    S.add(this.leftRimLight);

    this.rightRimLight = new THREE.PointLight(0xffaa33, 2.2, 14, 2);
    this.rightRimLight.position.set(4.2, -1.0, 2.0);
    S.add(this.rightRimLight);

    // ——— 2. PLANE 1: Deep Cosmos & Fireworks (z: -14 to -10, renderOrder: 10) ———
    this.nebula = paperMesh(makeNebulaTexture(), {
      width: 32,
      height: 18,
      transparent: false,
      renderOrder: 10,
    });
    this.nebula.position.set(0, 1.2, -14);
    S.add(this.nebula);

    this.buildStars();
    this.fireworks = new Fireworks(S);

    // ——— 3. PLANE 2: Distant Moon Palace, Banyan Tree & Jade Rabbit (z: -7.5 to -5.2, renderOrder: 25) ———
    this.cloudsFar = paperMesh(makeCloudsTexture(), {
      width: 14,
      height: 3.8,
      addShadow: true,
      shadowOpacity: 0.35,
      renderOrder: 22,
    });
    this.cloudsFar.position.set(-1.2, 2.4, -7.2);
    this.cloudsFar.material.opacity = 0.65;
    S.add(this.cloudsFar);

    this.palace = paperMesh(makePalaceTexture(), {
      width: 7.6,
      height: 5.7,
      addShadow: true,
      shadowOpacity: 0.45,
      renderOrder: 25,
    });
    this.palace.position.set(0.6, -0.2, -6.2);
    S.add(this.palace);

    this.banyan = paperMesh(makeBanyanTexture(), {
      width: 4.4,
      height: 5.5,
      addShadow: true,
      shadowOpacity: 0.4,
      renderOrder: 26,
    });
    this.banyan.position.set(-3.7, 0.1, -5.6);
    S.add(this.banyan);

    // Cute Jade Rabbit (Thỏ Ngọc) under the banyan tree holding a star lantern
    this.rabbit = paperMesh(makeRabbitTexture(), {
      width: 1.2,
      height: 1.2,
      addShadow: true,
      shadowOpacity: 0.45,
      renderOrder: 28,
    });
    this.rabbit.position.set(-2.4, -0.65, -5.2);
    S.add(this.rabbit);

    // ——— 4. PLANE 3: Giant Glowing Moon & Volumetric Bloom (z: -4.2 to -2.8, renderOrder: 40) ———
    this.clouds = paperMesh(makeCloudsTexture(), {
      width: 12.5,
      height: 3.6,
      addShadow: true,
      shadowOpacity: 0.35,
      renderOrder: 35,
    });
    this.clouds.position.set(0.2, 1.4, -3.8);
    S.add(this.clouds);

    this.volumetricFog = glowSprite(16, "180,210,255", 0.16, 38);
    this.volumetricFog.position.set(0, 1.2, -3.4);
    S.add(this.volumetricFog);

    this.moonGroup = new THREE.Group();
    this.moonGroup.position.set(0, 1.9, -3.0);

    const moon = paperMesh(makeMoonTexture(512), {
      width: 4.2,
      height: 4.2,
      addShadow: true,
      shadowOpacity: 0.5,
      emissiveBoost: 0.4,
      renderOrder: 40,
    });
    this.moonGroup.add(moon);

    this.moonHaloWide = glowSprite(9.5, "255,224,138", 0.48, 39);
    this.moonHaloWide.position.z = -0.1;
    this.moonGroup.add(this.moonHaloWide);

    this.moonHaloCore = glowSprite(5.5, "255,245,210", 0.55, 41);
    this.moonHaloCore.position.z = 0.05;
    this.moonGroup.add(this.moonHaloCore);

    S.add(this.moonGroup);

    // ——— 5. PLANE 4: Goddess Hằng Nga Articulated Marionette & Lanterns (z: -1.8 to -0.8, renderOrder: 60) ———
    this.buildGoddessPuppet(S);

    this.buildLanterns();
    this.fireflies = new Fireflies(S, 85);
    this.embers = new Embers(S, 50);

    this.goldHaze = glowSprite(8.5, "240,190,80", 0.16, 58);
    this.goldHaze.position.set(0, 1.8, -2.2);
    S.add(this.goldHaze);

    // ——— 6. PLANE 5: Two Guardian Lions, Stage Pedestal & Lotus Lanterns (z: 1.0 to 2.8, renderOrder: 80) ———
    this.floor = paperMesh(makeFloorTexture(), {
      width: 18,
      height: 3.4,
      addShadow: true,
      shadowOpacity: 0.6,
      emissiveBoost: 0.2,
      renderOrder: 78,
    });
    this.floor.position.set(0, -2.3, 1.0);
    S.add(this.floor);

    // Floating Lotus Lanterns (Đèn Hoa Đăng Cung Đình)
    this.buildLotusLanterns();

    // Two Guardian Lions: positioned nicely in bottom corners (fully on screen, not sunken!)
    this.buildLion(-3.1, 1, "left");
    this.buildLion(3.1, -1, "right");
  }

  buildGoddessPuppet(S) {
    const loader = new THREE.TextureLoader();
    const loadTex = (file) => {
      const t = loader.load(`./assets/puppet/${file}?v=11`);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };

    const torsoTex = loadTex("torso.png");
    const armLTex = loadTex("arm_left.png");
    const armRTex = loadTex("arm_right.png");
    const skirtTex = loadTex("skirt.png");
    const feetTex = loadTex("feet.png");
    const rabbitTex = loadTex("rabbit.png");

    const scale = 0.00718;
    const group = new THREE.Group();
    group.position.set(0, 1.65, -1.8);

    // 1. Torso & Head (bodice, face, crown, white halo ribbon arch)
    const torsoMesh = paperMesh(torsoTex, {
      width: 383 * scale,
      height: 319 * scale,
      addShadow: true,
      shadowOpacity: 0.55,
      emissiveBoost: 0.22,
      renderOrder: 62,
    });
    torsoMesh.position.set(0.068, 1.034, 0.0);
    group.add(torsoMesh);

    // 2. Left Arm Joint (pivots naturally at left shoulder)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.180, 0.829, 0.04);
    const leftArmMesh = paperMesh(armLTex, {
      width: 266 * scale,
      height: 228 * scale,
      addShadow: true,
      shadowOpacity: 0.45,
      emissiveBoost: 0.22,
      renderOrder: 64,
    });
    leftArmMesh.position.set(-0.804, 0.072, 0);
    leftArmGroup.add(leftArmMesh);
    group.add(leftArmGroup);

    // 3. Right Arm Joint (pivots naturally at right shoulder)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.251, 0.757, 0.04);
    const rightArmMesh = paperMesh(armRTex, {
      width: 255 * scale,
      height: 365 * scale,
      addShadow: true,
      shadowOpacity: 0.45,
      emissiveBoost: 0.22,
      renderOrder: 64,
    });
    rightArmMesh.position.set(0.772, -0.133, 0);
    rightArmGroup.add(rightArmMesh);
    group.add(rightArmGroup);

    // 4. Skirt Joint (pivots naturally at waist/hips)
    const skirtGroup = new THREE.Group();
    skirtGroup.position.set(0.0, 0.111, 0.02);
    const skirtMesh = paperMesh(skirtTex, {
      width: 349 * scale,
      height: 356 * scale,
      addShadow: true,
      shadowOpacity: 0.5,
      emissiveBoost: 0.22,
      renderOrder: 61,
    });
    skirtMesh.position.set(0.571, -1.134, 0);
    skirtGroup.add(skirtMesh);
    group.add(skirtGroup);

    // 5. Feet / Legs Joint (stepping/gliding beneath the hem)
    const feetGroup = new THREE.Group();
    const feetBaseX = -0.036;
    const feetBaseY = -1.971;
    feetGroup.position.set(feetBaseX, feetBaseY, -0.01);
    const feetMesh = paperMesh(feetTex, {
      width: 70 * scale,
      height: 43 * scale,
      addShadow: false,
      emissiveBoost: 0.2,
      renderOrder: 60,
    });
    feetMesh.position.set(0, -0.154, 0);
    feetGroup.add(feetMesh);
    group.add(feetGroup);

    // 6. Jade Rabbit (playful flying companion beside the skirt)
    const rabbitGroup = new THREE.Group();
    const rabbitBaseX = -1.15;
    const rabbitBaseY = -0.95;
    rabbitGroup.position.set(rabbitBaseX, rabbitBaseY, 0.08);
    const rabbitMesh = paperMesh(rabbitTex, {
      width: 160 * scale,
      height: 133 * scale,
      addShadow: true,
      shadowOpacity: 0.45,
      emissiveBoost: 0.25,
      renderOrder: 65,
    });
    rabbitGroup.add(rabbitMesh);
    group.add(rabbitGroup);

    S.add(group);

    this.goddessPuppet = {
      group,
      torso: torsoMesh,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      skirt: skirtGroup,
      feet: feetGroup,
      feetBaseX,
      feetBaseY,
      rabbit: rabbitGroup,
      rabbitBaseX,
      rabbitBaseY,
    };
    this.goddess = group;
    this.goddessMeshes = [torsoMesh, leftArmMesh, rightArmMesh, skirtMesh, feetMesh, rabbitMesh];
  }

  buildLotusLanterns() {
    this.lotusLanterns = [];
    const lotusTex = makeLotusLanternTexture();
    const positions = [
      { x: -1.8, y: -1.75, z: 1.8, s: 0.72, phase: 0.0 },
      { x: -0.6, y: -1.85, z: 1.9, s: 0.8, phase: 1.3 },
      { x: 0.7, y: -1.82, z: 1.85, s: 0.75, phase: 2.5 },
      { x: 1.9, y: -1.72, z: 1.75, s: 0.7, phase: 3.8 },
    ];
    for (const lp of positions) {
      const lotus = paperMesh(lotusTex, {
        width: 1.1 * lp.s,
        height: 1.1 * lp.s,
        addShadow: true,
        shadowOpacity: 0.5,
        renderOrder: 79,
      });
      lotus.position.set(lp.x, lp.y, lp.z);
      lotus.userData = { baseX: lp.x, baseY: lp.y, phase: lp.phase };
      this.scene.add(lotus);
      this.lotusLanterns.push(lotus);
    }
  }

  buildLanterns() {
    this.lanterns = [];
    const specs = [
      { type: "star", x: -3.2, y: 2.5, z: -1.4, s: 1.05, phase: 0.0 },
      { type: "round", x: 3.3, y: 2.7, z: -1.6, s: 0.95, phase: 1.1 },
      { type: "fish", x: -3.8, y: 0.8, z: -0.9, s: 0.9, phase: 2.2 },
      { type: "mooncake", x: 3.7, y: 0.9, z: -1.0, s: 0.85, phase: 3.0 },
      { type: "star", x: -2.2, y: 3.3, z: -3.2, s: 0.7, phase: 4.0 },
      { type: "round", x: 2.2, y: 3.4, z: -3.4, s: 0.65, phase: 5.0 },
      { type: "fish", x: 3.2, y: 1.9, z: -2.8, s: 0.65, phase: 0.7 },
      { type: "mooncake", x: -3.1, y: 1.8, z: -2.9, s: 0.6, phase: 1.8 },
      { type: "star", x: -1.4, y: 3.6, z: -5.0, s: 0.48, phase: 2.8 },
      { type: "round", x: 1.5, y: 3.7, z: -5.2, s: 0.45, phase: 3.6 },
    ];

    for (const sp of specs) {
      const group = new THREE.Group();
      group.position.set(sp.x, sp.y, sp.z);

      const lantern = paperMesh(makeLanternTexture(sp.type), {
        width: 1.1 * sp.s,
        height: 1.38 * sp.s,
        addShadow: true,
        shadowOpacity: 0.4,
        emissiveBoost: 0.35,
        renderOrder: 64,
      });
      group.add(lantern);

      const glowSize = 1.6 * sp.s;
      const glow = glowSprite(glowSize, "255,200,100", 0.4, 63);
      glow.position.z = -0.05;
      group.add(glow);

      group.userData = {
        baseY: sp.y,
        baseX: sp.x,
        phase: sp.phase,
        glow,
        glowSize,
        lantern,
        spin: (sp.phase % 2 === 0 ? 1 : -1) * 0.16,
      };
      this.scene.add(group);
      this.lanterns.push(group);
    }

    // ── Rabbit Lanterns (Lồng Đèn Thỏ) ── spread in empty background zones
    this.rabbitLanterns = [];
    const rabbitTex = makeRabbitLanternTexture();  // reuse one texture for all
    const rabbitSpecs = [
      { x: -4.8, y:  1.6, z: -2.2, s: 0.88, phase: 0.4  },  // far left mid
      { x:  4.6, y:  1.4, z: -2.4, s: 0.84, phase: 1.7  },  // far right mid
      { x: -1.8, y:  3.8, z: -4.5, s: 0.60, phase: 3.1  },  // upper center-left (distant)
      { x:  1.6, y:  4.0, z: -4.8, s: 0.56, phase: 4.4  },  // upper center-right (distant)
      { x: -5.2, y:  3.2, z: -5.5, s: 0.45, phase: 2.0  },  // deep far left
      { x:  5.0, y:  3.0, z: -5.2, s: 0.48, phase: 5.2  },  // deep far right
    ];

    for (const rp of rabbitSpecs) {
      const rg = new THREE.Group();
      rg.position.set(rp.x, rp.y, rp.z);

      const rl = paperMesh(rabbitTex, {
        width:  0.90 * rp.s,
        height: 1.26 * rp.s,  // 360/256 aspect ratio
        addShadow: true,
        shadowOpacity: 0.38,
        emissiveBoost: 0.30,
        renderOrder: 64,
      });
      rg.add(rl);

      // Soft warm glow around each rabbit lantern
      const rglow = glowSprite(1.5 * rp.s, '255,200,160', 0.38, 63);
      rglow.position.z = -0.06;
      rg.add(rglow);

      rg.userData = {
        baseY: rp.y,
        baseX: rp.x,
        phase: rp.phase,
        glow: rglow,
        glowSize: 1.5 * rp.s,
        spin: (rp.phase % 2 < 1 ? 1 : -1) * 0.12,
      };
      this.scene.add(rg);
      this.rabbitLanterns.push(rg);
    }
  }

  buildStars() {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 11 - 1;
      pos[i * 3 + 2] = -10.5 - Math.random() * 3.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      map: canvasTex(makeGlowTexture(32, "235,245,255")),
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(geo, mat);
    this.stars.renderOrder = 12;
    this.scene.add(this.stars);
  }

  /**
   * Builds one of the Guardian Lions (Đầu Lân Hoàng Gia).
   * Positioned upward (y = 0.40) so the full face, mane, horns, cascading beard,
   * and royal vertical couplet scrolls (Liễn câu đối) are 100% visible above viewport footer.
   */
  buildLion(x, facing, side) {
    const group = new THREE.Group();
    // Shifted upward along Y-axis (+18% viewport height) so lion and banners are never cut off
    group.position.set(x, 0.40, 2.3);
    group.rotation.y = facing * 0.20;
    group.rotation.z = -facing * 0.03;

    group.userData = {
      side,
      facing,
      baseY: 0.40,
      baseX: x,
      baseRotY: facing * 0.20,
      baseRotZ: -facing * 0.03,
      phase: side === "left" ? 0 : 1.6,
    };

    // Load 3D textures: Color, Normal Map & Depth Displacement Map
    const textureLoader = new THREE.TextureLoader();
    const isLeftLion = side === "left";
    const lionAsset = isLeftLion
      ? "./assets/lion_chibi_standard.png?v=10"
      : "./assets/lion_chibi_flipped.png?v=10";

    const lionTex = textureLoader.load(lionAsset, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });

    // Fluffy Chibi Lion Dance pup papercut with baked 3D studio lighting & drop shadow
    const lion = paperMesh(lionTex, {
      width: 2.4,
      height: 2.4,
      addShadow: true,
      shadowOpacity: 0.55,
      emissiveBoost: 0.22,
      renderOrder: 80,
    });
    group.add(lion);

    // Vertical Calligraphy Scroll (Liễn Câu Đối / Câu Đố)
    const isLeft = side === "left";
    const text = isLeft
      ? "Vằng vặc trăng rằm soi đất Việt"
      : "Rộn rã lân múa đón Trung Thu";

    const banner = paperMesh(makeBannerTexture(side, text), {
      width: 0.48,
      height: 1.80,
      addShadow: true,
      shadowOpacity: 0.5,
      emissiveBoost: 0.28,
      renderOrder: 86,
      originTop: true,
    });

    // Pinned right below the lion's mouth / chin
    const bannerLocalX = isLeft ? 0.72 : -0.72;
    banner.position.set(bannerLocalX, 0.12, 0.26);
    banner.scale.y = 0.001;
    banner.userData = {
      type: "banner",
      side,
      isBanner: true,
    };
    group.add(banner);
    this.banners.push(banner);
    this.rayTargets.push(banner);

    this.scene.add(group);
    this.lionGroups.push(group);
  }

  setMouse(nx, ny) {
    this.mouse.x = nx;
    this.mouse.y = ny;
  }

  /**
   * Interactive fireworks burst at screen click coordinate
   */
  burstAtScreen(clientX, clientY) {
    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;
    const v = new THREE.Vector3(ndcX, ndcY, 0.5);
    v.unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    const dist = (-6.5 - this.camera.position.z) / dir.z;
    const pos = this.camera.position.clone().add(dir.multiplyScalar(dist));
    this.fireworks.burst(pos.x, pos.y, pos.z);
  }

  /** GSAP-driven intro camera zoom and orientation without fighting update() */
  introCamera(gsap) {
    const l = this.computeResponsiveLayout();
    gsap.to(this.camera.position, {
      z: l.targetZ,
      duration: 2.8,
      ease: "power3.inOut",
    });
    gsap.fromTo(
      this.camera,
      { fov: l.targetFov + 10 },
      {
        fov: l.targetFov,
        duration: 2.8,
        ease: "power2.out",
        onUpdate: () => this.camera.updateProjectionMatrix(),
      }
    );

    gsap.to(this, {
      parallaxWeight: 1,
      duration: 1.5,
      delay: 1.8,
      ease: "power2.out",
      onComplete: () => {
        this.opened = true;
      },
    });
  }

  /** Clean downward unrolling animation for vertical banners from top pin */
  dropBanners(gsap) {
    this.banners.forEach((banner, i) => {
      const delay = 0.15 * i;
      gsap.to(banner.scale, {
        y: 1,
        duration: 1.6,
        delay,
        ease: "elastic.out(1.02, 0.55)",
      });
    });
  }

  raycastBanner(ndcX, ndcY) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    ray.params.Line = { threshold: 0.25 };
    const hits = ray.intersectObjects(this.banners, false);
    return hits[0]?.object?.userData?.side ?? null;
  }

  raycastGoddess(ndcX, ndcY) {
    if (!this.opened) return false;
    if (!this.goddessMeshes || this.goddessMeshes.length === 0) return false;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hits = ray.intersectObjects(this.goddessMeshes, true);
    if (hits.length > 0) return true;

    // Mobile touch target fallback: comfortable hit radius around Chị Hằng
    const gPos = this.getGoddessScreenPos();
    const tapX = ((ndcX + 1) * 0.5) * window.innerWidth;
    const tapY = ((-ndcY + 1) * 0.5) * window.innerHeight;
    const hitRadius = window.innerWidth < 768 ? 95 : 65;
    return Math.hypot(tapX - gPos.x, tapY - gPos.y) < hitRadius;
  }

  getGoddessScreenPos() {
    if (!this.goddess) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
    const pos = new THREE.Vector3();
    this.goddess.getWorldPosition(pos);
    pos.y += 0.5; // Upper torso / heart
    pos.project(this.camera);
    return {
      x: ((pos.x + 1) * 0.5) * window.innerWidth,
      y: ((-pos.y + 1) * 0.5) * window.innerHeight,
    };
  }

  triggerGoddessBloomFlash() {
    if (!this.goddess) return;
    const pos = new THREE.Vector3();
    this.goddess.getWorldPosition(pos);

    // Radiant stardust shockwave
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.fireworks.burst(
          pos.x + (Math.random() - 0.5) * 1.5,
          pos.y + 0.5 + (Math.random() - 0.5) * 1.2,
          pos.z + 0.2
        );
      }, i * 65);
    }
  }

  /**
   * Bắn pháo hoa tại vị trí click trên background trời đêm.
   * NDC click → ray → z = -7 plane (background sky layer).
   * Chỉ bắn khi y > -0.5 (phần trống trên trời, tránh chân sân khấu).
   */
  fireAtNDC(ndcX, ndcY) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

    // Project onto the background sky plane (z = -7)
    const skyPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 7);
    const worldPos = new THREE.Vector3();
    raycaster.ray.intersectPlane(skyPlane, worldPos);

    if (!worldPos || worldPos.y < -0.5) return; // below stage floor — skip

    // Clamp to safe sky zone
    worldPos.x = THREE.MathUtils.clamp(worldPos.x, -9, 9);
    worldPos.y = THREE.MathUtils.clamp(worldPos.y, 0, 5.5);

    // 1–2 burst cluster for a richer effect
    this.fireworks.burst(worldPos.x, worldPos.y, worldPos.z);
    if (Math.random() < 0.55) {
      setTimeout(() => {
        this.fireworks.burst(
          worldPos.x + (Math.random() - 0.5) * 1.2,
          worldPos.y + (Math.random() - 0.5) * 0.8,
          worldPos.z
        );
      }, 120 + Math.random() * 100);
    }
  }


  update() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // ——— Delta-time independent exponential smoothing for silky parallax ———
    const damp = 1 - Math.exp(-dt * 5.0);
    this.parallax.x += (this.mouse.x * 0.45 - this.parallax.x) * damp;
    this.parallax.y += (this.mouse.y * 0.3 - this.parallax.y) * damp;

    const pw = this.parallaxWeight;
    this.camera.position.x = this.parallax.x * pw;
    this.camera.position.y = (this.baseCameraY || 0.45) + this.parallax.y * 0.4 * pw;
    this.camera.lookAt(
      this.parallax.x * 0.18 * pw,
      (this.baseLookAtY || 0.85) + this.parallax.y * 0.1 * pw,
      -2.5
    );

    if (this.nebula) {
      this.nebula.position.x = -this.parallax.x * 0.25 * pw;
    }

    // ——— Goddess Hằng Nga Articulated Marionette Movement (Cử động tay, chân, tà váy & thỏ ngọc) ———
    if (this.goddessPuppet) {
      const g = this.goddessPuppet;
      // 1. Overall floating & gentle breathing
      g.group.position.y = 1.65 + Math.sin(t * 0.72) * 0.08;
      g.group.rotation.z = Math.sin(t * 0.55) * 0.012;

      // 2. Left arm graceful waving & dancing (tay trái múa uyển chuyển)
      g.leftArm.rotation.z = Math.sin(t * 1.15) * 0.14 - 0.04;
      g.leftArm.rotation.y = Math.sin(t * 0.8) * 0.09;

      // 3. Right arm graceful opening & waving ribbon (tay phải nâng dải lụa tiên)
      g.rightArm.rotation.z = Math.sin(t * 0.95 + 1.2) * 0.12 + 0.03;
      g.rightArm.rotation.y = Math.sin(t * 0.75 + 0.5) * 0.08;

      // 4. Flowing skirt harmonic pendulum sway (tà váy lụa dập dềnh bồng bềnh)
      g.skirt.rotation.z = Math.sin(t * 0.85 + 2.0) * 0.06;

      // 5. Delicate feet stepping & gliding (chân tiên lướt mây nhẹ nhàng)
      g.feet.position.x = g.feetBaseX + Math.sin(t * 1.5) * 0.04;
      g.feet.rotation.z = Math.sin(t * 1.5) * 0.09;

      // 6. Jade rabbit flying & hovering happily (Thỏ ngọc tung tăng bay lượn)
      g.rabbit.position.x = g.rabbitBaseX + Math.sin(t * 1.3) * 0.08;
      g.rabbit.position.y = g.rabbitBaseY + Math.sin(t * 1.8) * 0.07;
      g.rabbit.rotation.z = Math.sin(t * 1.3) * 0.06;
    } else if (this.goddess) {
      this.goddess.position.y = 1.65 + Math.sin(t * 0.72) * 0.08;
      this.goddess.rotation.z = Math.sin(t * 0.55) * 0.015;
    }

    // ——— Giant Moon Halo Breathing Bloom & Fog Pulse ———
    if (this.moonHaloWide) {
      const s = 9.5 + Math.sin(t * 1.15) * 0.35;
      this.moonHaloWide.scale.set(s, s, 1);
      this.moonHaloWide.material.opacity = 0.45 + Math.sin(t * 1.3) * 0.08;
    }
    if (this.moonHaloCore) {
      const s2 = 5.5 + Math.sin(t * 1.5) * 0.25;
      this.moonHaloCore.scale.set(s2, s2, 1);
      this.moonHaloCore.material.opacity = 0.52 + Math.sin(t * 1.7) * 0.08;
    }
    if (this.volumetricFog) {
      this.volumetricFog.material.opacity = 0.15 + Math.sin(t * 0.85) * 0.04;
    }

    // ——— Jade Rabbit (Thỏ Ngọc) Subtle Breathing & Ear Tilt ———
    if (this.rabbit) {
      this.rabbit.position.y = -0.65 + Math.sin(t * 1.3) * 0.035;
      this.rabbit.rotation.z = Math.sin(t * 0.85) * 0.025;
    }

    // ——— Floating Lotus Lanterns Drifting Gently Across Stage Floor ———
    if (this.lotusLanterns) {
      for (const lotus of this.lotusLanterns) {
        const lp = lotus.userData.phase;
        lotus.position.y = lotus.userData.baseY + Math.sin(t * 1.1 + lp) * 0.035;
        lotus.position.x = lotus.userData.baseX + Math.sin(t * 0.45 + lp) * 0.05;
        lotus.rotation.z = Math.sin(t * 0.7 + lp) * 0.025;
      }
    }

    // ——— Clouds Drifting ———
    if (this.clouds) this.clouds.position.x = 0.2 + Math.sin(t * 0.18) * 0.35;
    if (this.cloudsFar) this.cloudsFar.position.x = -1.2 + Math.sin(t * 0.12 + 2) * 0.45;

    // ——— Mid-Autumn Lanterns Bobbing, Swaying & Glow Pulsation ———
    if (this.lanterns) {
      for (const g of this.lanterns) {
        const p = g.userData.phase;
        g.position.y = g.userData.baseY + Math.sin(t * 0.6 + p) * 0.15;
        g.position.x = g.userData.baseX + Math.sin(t * 0.4 + p * 1.2) * 0.1;
        g.rotation.z = Math.sin(t * 0.75 + p) * 0.07 * g.userData.spin;
        g.rotation.y = Math.sin(t * 0.45 + p) * 0.12;
        if (g.userData.glow) {
          g.userData.glow.material.opacity = 0.32 + Math.sin(t * 2.2 + p) * 0.14;
          const gs = (g.userData.glowSize || 1.6) * (1 + Math.sin(t * 1.8 + p) * 0.08);
          g.userData.glow.scale.set(gs, gs, 1);
        }
      }
    }

    // ——— Rabbit Lanterns (Lồng Đèn Thỏ) Gentle Bobbing & Glow ———
    if (this.rabbitLanterns) {
      for (const rg of this.rabbitLanterns) {
        const p = rg.userData.phase;
        rg.position.y = rg.userData.baseY + Math.sin(t * 0.65 + p) * 0.13;
        rg.position.x = rg.userData.baseX + Math.sin(t * 0.38 + p * 1.3) * 0.09;
        rg.rotation.z = Math.sin(t * 0.72 + p) * 0.06 * rg.userData.spin;
        rg.rotation.y = Math.sin(t * 0.40 + p) * 0.10;
        if (rg.userData.glow) {
          rg.userData.glow.material.opacity = 0.30 + Math.sin(t * 1.9 + p) * 0.13;
          const gs = (rg.userData.glowSize || 1.2) * (1 + Math.sin(t * 1.6 + p) * 0.07);
          rg.userData.glow.scale.set(gs, gs, 1);
        }
      }
    }

    // ——— Two Guardian Lions (Song Lân) Bouncy Breathing & Playful Nodding ———
    this.lionGroups.forEach((g) => {
      const p = g.userData.phase;
      g.position.y = g.userData.baseY + Math.sin(t * 1.5 + p) * 0.045;
      g.scale.y = 1 + Math.sin(t * 1.5 + p) * 0.018;

      g.rotation.z = g.userData.baseRotZ + Math.sin(t * 0.9 + p) * 0.028;
      g.rotation.x = Math.sin(t * 1.2 + p) * 0.022;
    });

    // ——— Vertical Banners Pendular Silk Sway ———
    this.banners.forEach((b, i) => {
      b.rotation.z = Math.sin(t * 0.75 + i * 1.5) * 0.025;
    });

    // ——— Particle Systems ———
    this.fireflies.update(t);
    this.embers.update(t);
    this.fireworks.update(dt, t);

    // ——— Sparkling Celestial Phoenix Flying in 3D Orbit Around Chị Hằng ———
    if (this.phoenix) {
      this.phoenix.update(dt, t);
    }

    this.renderer.render(this.scene, this.camera);
  }

  computeResponsiveLayout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    const isPortrait = aspect < 1.0;
    const isMobile = w < 768 || isPortrait;

    let targetFov = 42;
    let targetZ = 8.0;
    let targetCameraY = 0.45;
    let targetLookAtY = 0.85;

    let lionScale = 1.0;
    let lionBaseX = 3.1;
    let lionBaseY = 0.40;

    if (isPortrait) {
      const p = Math.max(0, Math.min(1, (1.0 - aspect) / 0.55));
      targetZ = THREE.MathUtils.lerp(8.5, 9.9, p);
      targetFov = THREE.MathUtils.lerp(50, 58, p);
      targetCameraY = THREE.MathUtils.lerp(0.45, 0.35, p);
      targetLookAtY = THREE.MathUtils.lerp(0.85, 0.70, p);

      lionScale = THREE.MathUtils.lerp(0.80, 0.68, p);
      lionBaseX = THREE.MathUtils.lerp(2.2, 1.45, p);
      lionBaseY = THREE.MathUtils.lerp(-0.4, -1.55, p);
    } else if (aspect < 1.4) {
      const p = (1.4 - aspect) / 0.4;
      targetZ = THREE.MathUtils.lerp(8.0, 8.5, p);
      targetFov = THREE.MathUtils.lerp(42, 48, p);
      lionBaseX = THREE.MathUtils.lerp(3.1, 2.5, p);
      lionScale = THREE.MathUtils.lerp(1.0, 0.88, p);
    }

    return {
      w,
      h,
      aspect,
      isMobile,
      targetFov,
      targetZ,
      targetCameraY,
      targetLookAtY,
      lionScale,
      lionBaseX,
      lionBaseY,
    };
  }

  updateResponsiveLayout() {
    const l = this.computeResponsiveLayout();
    this.baseCameraZ = l.targetZ;
    this.baseCameraY = l.targetCameraY;
    this.baseLookAtY = l.targetLookAtY;

    this.camera.aspect = l.aspect;
    this.camera.fov = l.targetFov;
    this.camera.updateProjectionMatrix();

    if (this.opened) {
      this.camera.position.z = l.targetZ;
    }

    if (this.lionGroups) {
      this.lionGroups.forEach((g) => {
        const isLeft = g.userData.side === "left";
        g.scale.setScalar(l.lionScale);
        g.position.x = isLeft ? -l.lionBaseX : l.lionBaseX;
        g.position.y = l.lionBaseY;
        g.userData.baseX = g.position.x;
        g.userData.baseY = l.lionBaseY;
      });
    }
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.updateResponsiveLayout();
  }

  start() {
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.update();
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }
}
