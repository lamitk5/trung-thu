import * as THREE from "three";
import { makeSparkTexture, makeGlowTexture } from "./textures.js";

function toTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft additive points material */
function pointsMaterial(map, size, opacity = 1) {
  return new THREE.PointsMaterial({
    map: map && map.isTexture ? map : toTexture(map),
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
}

/** Ambient floating golden fireflies */
export class Fireflies {
  constructor(scene, count = 80) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.phases = new Float32Array(count);
    this.speeds = new Float32Array(count);
    this.base = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = Math.random() * 6 - 0.5;
      const z = Math.random() * 5 + 0.5;
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;
      this.base.push({ x, y, z });
      this.phases[i] = Math.random() * Math.PI * 2;
      this.speeds[i] = 0.4 + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.mat = pointsMaterial(makeGlowTexture(64, "255,224,138"), 0.12, 0.85);
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  update(t) {
    const pos = this.positions;
    for (let i = 0; i < this.count; i++) {
      const b = this.base[i];
      const p = this.phases[i] + t * this.speeds[i];
      pos[i * 3] = b.x + Math.sin(p * 0.7) * 0.45;
      pos[i * 3 + 1] = b.y + Math.sin(p) * 0.35 + Math.sin(t * 0.3 + i) * 0.08;
      pos[i * 3 + 2] = b.z + Math.cos(p * 0.5) * 0.2;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.mat.opacity = 0.55 + Math.sin(t * 2) * 0.15;
  }
}

/** Distant floating glowing embers */
export class Embers {
  constructor(scene, count = 60) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.vel = [];
    for (let i = 0; i < count; i++) {
      this.positions[i * 3] = (Math.random() - 0.5) * 20;
      this.positions[i * 3 + 1] = Math.random() * 8 - 1;
      this.positions[i * 3 + 2] = -6 - Math.random() * 5;
      this.vel.push({
        x: (Math.random() - 0.5) * 0.15,
        y: 0.08 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.mat = pointsMaterial(makeGlowTexture(64, "255,140,60"), 0.1, 0.55);
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  update(t) {
    const pos = this.positions;
    for (let i = 0; i < this.count; i++) {
      const v = this.vel[i];
      pos[i * 3] += Math.sin(t + v.phase) * 0.004;
      pos[i * 3 + 1] += v.y * 0.016;
      if (pos[i * 3 + 1] > 7) {
        pos[i * 3 + 1] = -1;
        pos[i * 3] = (Math.random() - 0.5) * 20;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Procedural firework particle system.
 * Bursts behind paper layers; dynamic lights flash for rim illumination.
 */
export class Fireworks {
  constructor(scene, { maxParticles = 900 } = {}) {
    this.scene = scene;
    this.max = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3);
    this.life = new Float32Array(maxParticles);
    this.maxLife = new Float32Array(maxParticles);
    this.vel = new Float32Array(maxParticles * 3);
    this.cursor = 0;
    this.bursts = 0;
    this.nextBurst = 0.4;
    this.poolLights = [];

    for (let i = 0; i < maxParticles; i++) {
      this.positions[i * 3 + 1] = -999;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    this.mat = new THREE.PointsMaterial({
      map: toTexture(makeSparkTexture(64)),
      size: 0.18,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);

    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(0xffaa44, 0, 18, 2);
      scene.add(light);
      this.poolLights.push({ light, t: 0 });
    }
    this.lightCursor = 0;

    this.palette = [
      [1.0, 0.85, 0.3], // Golden Chrysanthemum
      [1.0, 0.25, 0.4], // Imperial Crimson Lotus
      [0.2, 0.95, 0.7], // Emerald Jade
      [0.3, 0.8, 1.0],  // Celestial Sapphire
      [0.9, 0.45, 1.0], // Royal Amethyst
      [1.0, 0.95, 0.8], // Starlight Diamond
      [1.0, 0.55, 0.15], // Sunset Tangerine
    ];
  }

  burst(x = 0, y = 1.5, z = -7) {
    const n = 55 + Math.floor(Math.random() * 45);
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
    for (let i = 0; i < n; i++) {
      const idx = this.cursor;
      this.cursor = (this.cursor + 1) % this.max;
      const i3 = idx * 3;
      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;
      this.colors[i3] = col[0];
      this.colors[i3 + 1] = col[1];
      this.colors[i3 + 2] = col[2];

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.4 + Math.random() * 2.6;
      this.vel[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      this.vel[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      this.vel[i3 + 2] = Math.cos(phi) * speed * 0.4;

      this.life[idx] = 0;
      this.maxLife[idx] = 1.2 + Math.random() * 0.9;
    }

    const slot = this.poolLights[this.lightCursor];
    this.lightCursor = (this.lightCursor + 1) % this.poolLights.length;
    slot.light.position.set(x, y, z + 1.5);
    slot.light.color.setRGB(col[0], col[1], col[2]);
    slot.light.intensity = 28;
    slot.t = 1;

    this.bursts++;
  }

  update(dt, t) {
    this.nextBurst -= dt;
    if (this.nextBurst <= 0) {
      const x = (Math.random() - 0.5) * 11;
      const y = 1.4 + Math.random() * 3.6;
      const z = -6.5 - Math.random() * 3;
      this.burst(x, y, z);
      this.nextBurst = 0.4 + Math.random() * 0.65;
    }

    for (let i = 0; i < this.max; i++) {
      if (this.life[i] >= this.maxLife[i]) {
        this.positions[i * 3 + 1] = -999;
        continue;
      }
      this.life[i] += dt;
      const i3 = i * 3;
      this.positions[i3] += this.vel[i3] * dt;
      this.positions[i3 + 1] += this.vel[i3 + 1] * dt;
      this.positions[i3 + 2] += this.vel[i3 + 2] * dt;
      this.vel[i3 + 1] -= 1.4 * dt;
      this.vel[i3] *= 0.985;
      this.vel[i3 + 1] *= 0.985;
      this.vel[i3 + 2] *= 0.985;

      const k = 1 - this.life[i] / this.maxLife[i];
      if (k < 0.15) this.positions[i3 + 1] = -999;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;

    for (const slot of this.poolLights) {
      if (slot.t > 0) {
        slot.t -= dt * 2.2;
        slot.light.intensity = Math.max(0, slot.t * 28);
      } else {
        slot.light.intensity = 0;
      }
    }
  }
}
