/**
 * Procedural Canvas papercut textures — Luxury Multi-Layered Paper Shadowbox.
 * Authentic Vietnamese Mid-Autumn Festival (Đông Hồ / Hàng Trống / Cung Đình aesthetic).
 */

export const PAPER = "#F3E6C8";
export const PAPER_DIM = "#C9B892";
export const SHADOW = "#1A2248";
export const SHADOW_DEEP = "#0D1430";
export const GOLD = "#E8B84B";
export const GOLD_GLOW = "#FFE08A";
export const CRIMSON = "#8B1A1A";
export const CRIMSON_DEEP = "#4A0C0C";
export const MOON = "#F5F0E0";
export const MOON_SOFT = "#E8DCC0";

export const PALETTE = {
  PAPER,
  PAPER_DIM,
  SHADOW,
  SHADOW_DEEP,
  GOLD,
  GOLD_GLOW,
  CRIMSON,
  CRIMSON_DEEP,
  MOON,
};

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function paperGrain(ctx, w, h, alpha = 0.035) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    const n = (Math.random() - 0.5) * 28;
    d[i] = Math.min(255, Math.max(0, d[i] + n * alpha * 20));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n * alpha * 20));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n * alpha * 20));
  }
  ctx.putImageData(img, 0, 0);
}

function goldRim(ctx, pathFn, w, h, lw = 2) {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = lw;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  pathFn(ctx);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,224,138,0.5)";
  ctx.lineWidth = lw * 0.45;
  ctx.stroke();
  ctx.restore();
}

/** Deep starfield nebula background with midnight blue cosmic gradient */
export function makeNebulaTexture() {
  const w = 2048;
  const h = 1024;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  // Multi-stop midnight blue sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#02040e");
  g.addColorStop(0.3, "#070e28");
  g.addColorStop(0.6, "#101948");
  g.addColorStop(0.85, "#0a1130");
  g.addColorStop(1, "#040718");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft cosmic nebula clouds
  for (let i = 0; i < 9; i++) {
    const x = (i / 9) * w + (Math.random() - 0.5) * 150;
    const y = h * (0.2 + Math.random() * 0.55);
    const r = 200 + Math.random() * 300;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = i % 3 === 0 ? "130,100,230" : i % 3 === 1 ? "240,160,80" : "70,120,210";
    rg.addColorStop(0, `rgba(${col},0.14)`);
    rg.addColorStop(0.5, `rgba(${col},0.05)`);
    rg.addColorStop(1, "transparent");
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Sparkling stardust field
  for (let i = 0; i < 550; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const s = Math.random() * 1.9 + 0.3;
    const a = Math.random() * 0.75 + 0.25;
    ctx.fillStyle = `rgba(235,242,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
    if (s > 1.3) {
      ctx.fillStyle = `rgba(255,224,138,${a * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, s * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return c;
}

/** Full moon with layered paper rings, soft lunar filigree & gold foil pierced borders */
export function makeMoonTexture(size = 512) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  // Outer ambient golden halo
  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.55);
  halo.addColorStop(0, "rgba(255,230,150,0.65)");
  halo.addColorStop(0.35, "rgba(255,210,120,0.22)");
  halo.addColorStop(0.7, "rgba(232,184,75,0.06)");
  halo.addColorStop(1, "transparent");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // Luminous main moon disc
  const disc = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.08, cx, cy, r);
  disc.addColorStop(0, "#FFFFFA");
  disc.addColorStop(0.35, "#FDF7E8");
  disc.addColorStop(0.75, "#F6ECCF");
  disc.addColorStop(1, "#E7D8B2");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Subtle traditional lunar banyan tree / jade rabbit shadow silhouette
  ctx.fillStyle = "rgba(185,165,125,0.18)";
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, cy + r * 0.22, r * 0.32, 0, Math.PI * 2);
  ctx.arc(cx - r * 0.24, cy + r * 0.12, r * 0.22, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.08, cy - r * 0.25, r * 0.26, 0, Math.PI * 2);
  ctx.arc(cx - r * 0.16, cy - r * 0.28, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Gold foil embossed outer rim
  goldRim(ctx, (p) => p.arc(cx, cy, r, 0, Math.PI * 2), size, size, 3.5);

  // Traditional pierced papercut decorative rings
  for (let i = 1; i <= 3; i++) {
    const rr = r * (1.1 + i * 0.09);
    ctx.strokeStyle = `rgba(232,184,75,${0.4 - i * 0.09})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 9]);
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  paperGrain(ctx, size, size, 0.035);
  return c;
}

/** Soft radial glow sprite for backlights & bloom */
export function makeGlowTexture(size = 256, color = "255,224,138") {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${color},0.95)`);
  g.addColorStop(0.2, `rgba(${color},0.45)`);
  g.addColorStop(0.5, `rgba(${color},0.12)`);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/** Soft spark/firework particle sprite */
export function makeSparkTexture(size = 64) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,224,138,0.85)");
  g.addColorStop(0.7, "rgba(232,184,75,0.2)");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/** Layered auspicious clouds (Vân Mây Như Ý) with gold foil trim */
export function makeCloudsTexture() {
  const w = 1024;
  const h = 320;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  function puff(x, y, scale, depth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const body = depth === 0 ? "rgba(22,30,68,0.92)" : "rgba(35,48,98,0.65)";
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-110, 20);
    ctx.bezierCurveTo(-120, -15, -70, -42, -35, -34);
    ctx.bezierCurveTo(-24, -68, 36, -72, 54, -36);
    ctx.bezierCurveTo(95, -54, 135, -18, 118, 18);
    ctx.bezierCurveTo(105, 42, -85, 48, -110, 20);
    ctx.closePath();
    ctx.fill();

    // Laser-cut circular perforations
    ctx.globalCompositeOperation = "destination-out";
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(i * 32, 30, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    // Golden cloud swirl line
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.shadowColor = GOLD_GLOW;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-110, 20);
    ctx.bezierCurveTo(-120, -15, -70, -42, -35, -34);
    ctx.bezierCurveTo(-24, -68, 36, -72, 54, -36);
    ctx.bezierCurveTo(95, -54, 135, -18, 118, 18);
    ctx.stroke();

    // Inner auspicious swirl (vân mây cổ)
    ctx.beginPath();
    ctx.arc(10, -15, 18, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  puff(180, 160, 1.15, 0);
  puff(380, 135, 0.9, 1);
  puff(540, 175, 1.25, 0);
  puff(730, 130, 0.85, 1);
  puff(890, 160, 1.05, 0);

  paperGrain(ctx, w, h, 0.04);
  return c;
}

/** Ancient Banyan tree silhouette (Cây Đa Chú Cuội) with twisting roots & leaf cutouts */
export function makeBanyanTexture() {
  const w = 512;
  const h = 640;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  // Trunk & aerial roots
  ctx.fillStyle = SHADOW;
  ctx.beginPath();
  ctx.moveTo(230, 620);
  ctx.bezierCurveTo(220, 500, 195, 420, 210, 340);
  ctx.bezierCurveTo(190, 300, 170, 275, 155, 245);
  ctx.lineTo(172, 250);
  ctx.bezierCurveTo(185, 280, 200, 300, 215, 320);
  ctx.bezierCurveTo(225, 250, 235, 180, 256, 115);
  ctx.bezierCurveTo(275, 180, 285, 250, 295, 320);
  ctx.bezierCurveTo(310, 300, 325, 280, 340, 250);
  ctx.lineTo(355, 245);
  ctx.bezierCurveTo(340, 275, 320, 300, 302, 340);
  ctx.bezierCurveTo(315, 420, 295, 500, 282, 620);
  ctx.closePath();
  ctx.fill();

  // Aerial hanging roots
  ctx.lineWidth = 3;
  ctx.strokeStyle = SHADOW;
  for (let i = 0; i < 7; i++) {
    const x = 165 + i * 30;
    ctx.beginPath();
    ctx.moveTo(x, 280 + (i % 3) * 12);
    ctx.bezierCurveTo(x - 6, 360, x + 8, 440, x + (i % 2 === 0 ? -5 : 5), 530 + (i % 3) * 20);
    ctx.stroke();
  }

  // Broad canopy crowns
  function canopy(ox, oy, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(ox - 135 * s, oy + 30 * s);
    ctx.bezierCurveTo(ox - 155 * s, oy - 45 * s, ox - 85 * s, oy - 95 * s, ox - 20 * s, oy - 85 * s);
    ctx.bezierCurveTo(ox + 10 * s, oy - 135 * s, ox + 95 * s, oy - 115 * s, ox + 125 * s, oy - 55 * s);
    ctx.bezierCurveTo(ox + 165 * s, oy - 20 * s, ox + 135 * s, oy + 45 * s, ox + 65 * s, oy + 55 * s);
    ctx.bezierCurveTo(ox, oy + 75 * s, ox - 105 * s, oy + 65 * s, ox - 135 * s, oy + 30 * s);
    ctx.closePath();
    ctx.fill();
  }

  canopy(256, 175, 1.2, SHADOW_DEEP);
  canopy(195, 215, 0.75, SHADOW);
  canopy(325, 205, 0.7, SHADOW);

  // Laser-cut foliage apertures
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 22; i++) {
    const x = 130 + Math.random() * 250;
    const y = 90 + Math.random() * 170;
    ctx.beginPath();
    ctx.ellipse(x, y, 7 + Math.random() * 8, 4 + Math.random() * 4, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  // Gold edge outlines
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(120, 205);
  ctx.bezierCurveTo(100, 135, 170, 85, 235, 95);
  ctx.bezierCurveTo(265, 45, 345, 65, 380, 125);
  ctx.bezierCurveTo(420, 155, 390, 230, 320, 230);
  ctx.stroke();

  paperGrain(ctx, w, h, 0.05);
  return c;
}

/** Moon Palace (Quảng Hàn Cung) — Imperial multi-tiered pavilion silhouette with glowing halls */
export function makePalaceTexture() {
  const w = 640;
  const h = 480;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  ctx.fillStyle = SHADOW;

  // Base terrace
  ctx.fillRect(80, 400, 480, 40);
  ctx.fillRect(120, 380, 400, 24);

  // Main pavilion body
  ctx.beginPath();
  ctx.moveTo(150, 380);
  ctx.lineTo(150, 210);
  ctx.lineTo(320, 130);
  ctx.lineTo(490, 210);
  ctx.lineTo(490, 380);
  ctx.closePath();
  ctx.fill();

  // Side wings
  ctx.fillRect(90, 275, 75, 115);
  ctx.fillRect(475, 275, 75, 115);

  // Traditional sweeping curved roofs (mái đao cong vút)
  function roof(x, y, w2, h2) {
    ctx.beginPath();
    ctx.moveTo(x - w2 / 2 - 28, y);
    ctx.quadraticCurveTo(x - w2 / 2, y - h2 * 0.35, x, y - h2);
    ctx.quadraticCurveTo(x + w2 / 2, y - h2 * 0.35, x + w2 / 2 + 28, y);
    ctx.quadraticCurveTo(x + w2 / 2 + 10, y - 10, x + w2 / 2 - 12, y - 4);
    ctx.lineTo(x - w2 / 2 + 12, y - 4);
    ctx.quadraticCurveTo(x - w2 / 2 - 10, y - 10, x - w2 / 2 - 28, y);
    ctx.closePath();
    ctx.fill();
  }

  roof(320, 190, 310, 80);
  roof(320, 120, 210, 60);
  roof(125, 275, 120, 45);
  roof(515, 275, 120, 45);

  // Central roof spire
  ctx.beginPath();
  ctx.moveTo(320, 120);
  ctx.lineTo(326, 60);
  ctx.lineTo(332, 45);
  ctx.lineTo(320, 28);
  ctx.lineTo(308, 45);
  ctx.lineTo(314, 60);
  ctx.closePath();
  ctx.fill();

  // Glowing papercut lattice windows
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 5; i++) {
    const x = 185 + i * 58;
    ctx.beginPath();
    ctx.arc(x, 290, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 7, 310, 14, 38);
  }
  ctx.globalCompositeOperation = "source-over";

  // Warm golden lantern light from within
  ctx.fillStyle = "rgba(255,224,138,0.45)";
  for (let i = 0; i < 5; i++) {
    const x = 185 + i * 58;
    ctx.beginPath();
    ctx.arc(x, 290, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 5, 312, 10, 34);
  }

  // Golden eaves & ridge outlines
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.8;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 12;

  // Upper roof ridge
  ctx.beginPath();
  ctx.moveTo(200, 120);
  ctx.quadraticCurveTo(320, 60, 440, 120);
  ctx.stroke();

  // Middle roof ridge
  ctx.beginPath();
  ctx.moveTo(135, 190);
  ctx.quadraticCurveTo(320, 115, 505, 190);
  ctx.stroke();

  // Pillars & foundation rim
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(150, 380);
  ctx.lineTo(150, 210);
  ctx.moveTo(490, 210);
  ctx.lineTo(490, 380);
  ctx.moveTo(80, 420);
  ctx.lineTo(560, 420);
  ctx.stroke();

  // Spire tip glowing pearl
  ctx.fillStyle = GOLD_GLOW;
  ctx.beginPath();
  ctx.arc(320, 28, 5, 0, Math.PI * 2);
  ctx.fill();

  paperGrain(ctx, w, h, 0.05);
  return c;
}

/**
 * Goddess Hằng Nga (Chị Hằng) — Elegant, fluid celestial maiden silhouette.
 * Traditional Vietnamese / Asian mythic style: slender proportions, layered flowing robes,
 * high celestial bun with gold hairpins & hanging pearls, delicate features, NO robot ball on stomach!
 */
/**
 * Goddess Hằng Nga (Chị Hằng Cung Trăng) — Exquisite Celestial Maiden.
 * Redesigned with authentic royal Vietnamese / mythic Asian aesthetics:
 * - Slender, graceful continuous silhouette (no robotic segmented parts or square neck)
 * - Beautiful sloping shoulders with majestic flowing royal bell sleeves (Tay áo thụng thướt tha)
 * - Delicate porcelain hands gently cradling a glowing lotus blossom
 * - Multi-tiered pleated celestial skirt (Xiêm y ngũ sắc) cascading in fluid, undulating S-curves
 * - High winged celestial chignon (Búi tóc mây kế phi thiên) with golden lotus hairpin & hanging pearls
 * - Translucent peach-rose celestial silk ribbons (Dải lụa tiên) arching in an ethereal halo
 */
export function makeGoddessTexture(mode = "full") {
  const w = 512;
  const h = 720;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  // Separate silk ribbons for independent floating animation
  if (mode === "ribbonL" || mode === "ribbonR") {
    drawCelestialRibbon(ctx, w, h, mode === "ribbonL" ? -1 : 1);
    return c;
  }

  // ——— 1. Cascading Multi-Layered Celestial Skirt (Tà Xiêm Y Lượn Sóng) ———
  // Flowing bottom skirt tiers with continuous organic drape
  const skirtGrad = ctx.createLinearGradient(160, 360, 360, 700);
  skirtGrad.addColorStop(0, "#232F65");
  skirtGrad.addColorStop(0.35, "#33448C");
  skirtGrad.addColorStop(0.7, "#1D285B");
  skirtGrad.addColorStop(1, "#121A3E");
  ctx.fillStyle = skirtGrad;

  ctx.beginPath();
  ctx.moveTo(234, 340);
  // Left billowing skirt drape
  ctx.bezierCurveTo(200, 420, 155, 520, 130, 650);
  ctx.bezierCurveTo(160, 680, 205, 685, 242, 655);
  // Center cascading flute folds
  ctx.bezierCurveTo(248, 560, 252, 470, 256, 395);
  ctx.bezierCurveTo(260, 470, 264, 560, 270, 655);
  // Right billowing skirt drape
  ctx.bezierCurveTo(307, 685, 352, 680, 382, 650);
  ctx.bezierCurveTo(357, 520, 312, 420, 278, 340);
  ctx.closePath();
  ctx.fill();

  // Celestial silk shimmer highlights (Vân Sóng Lụa Tiên)
  ctx.fillStyle = "rgba(120,160,240,0.35)";
  ctx.beginPath();
  ctx.moveTo(244, 370);
  ctx.bezierCurveTo(232, 450, 218, 545, 208, 640);
  ctx.lineTo(236, 656);
  ctx.bezierCurveTo(248, 565, 252, 475, 254, 400);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(268, 370);
  ctx.bezierCurveTo(280, 450, 294, 545, 304, 640);
  ctx.lineTo(276, 656);
  ctx.bezierCurveTo(264, 565, 260, 475, 258, 400);
  ctx.closePath();
  ctx.fill();

  // Delicate gold embroidered hem lines on skirt
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.0;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(130, 650);
  ctx.bezierCurveTo(160, 680, 205, 685, 242, 655);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(270, 655);
  ctx.bezierCurveTo(307, 685, 352, 680, 382, 650);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ——— 2. Elegant Gown Bodice & Sloping Shoulders (Áo Thân Trên & Vai Xuôi) ———
  // Smooth continuous transition from shoulders to waist (NO square neck block!)
  const robeGrad = ctx.createLinearGradient(200, 170, 312, 360);
  robeGrad.addColorStop(0, "#3E52A4");
  robeGrad.addColorStop(0.5, "#2D3D82");
  robeGrad.addColorStop(1, "#1E2A60");
  ctx.fillStyle = robeGrad;

  ctx.beginPath();
  // Left shoulder curve
  ctx.moveTo(256, 170);
  ctx.bezierCurveTo(225, 175, 205, 205, 195, 240);
  // Waist taper
  ctx.bezierCurveTo(205, 285, 222, 335, 234, 345);
  ctx.lineTo(278, 345);
  // Right shoulder curve
  ctx.bezierCurveTo(290, 335, 307, 285, 317, 240);
  ctx.bezierCurveTo(307, 205, 287, 175, 256, 170);
  ctx.closePath();
  ctx.fill();

  // Pure ivory inner silk collar
  ctx.fillStyle = "#FFFBF4";
  ctx.beginPath();
  ctx.moveTo(244, 168);
  ctx.lineTo(256, 215);
  ctx.lineTo(268, 168);
  ctx.closePath();
  ctx.fill();

  // Overlapping golden royal collar trim (Áo Nhật Bình dát vàng)
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(232, 178);
  ctx.lineTo(256, 224);
  ctx.lineTo(280, 178);
  ctx.stroke();

  // Golden waist sash & jade buckle
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(222, 330);
  ctx.quadraticCurveTo(256, 348, 290, 330);
  ctx.stroke();

  // Jade medallion & twin hanging ribbons
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(256, 342, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFF9D8";
  ctx.beginPath();
  ctx.arc(256, 342, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(235,140,165,0.85)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(251, 348);
  ctx.bezierCurveTo(244, 410, 238, 480, 244, 560);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(261, 348);
  ctx.bezierCurveTo(268, 410, 274, 480, 268, 560);
  ctx.stroke();

  // ——— 3. Billowing Bell Sleeves & Gentle Arms (Tay Áo Thụng & Nét Búp Măng) ———
  // Left flowing sleeve cascading smoothly from shoulder
  ctx.fillStyle = "#33458E";
  ctx.beginPath();
  ctx.moveTo(205, 205);
  ctx.bezierCurveTo(160, 235, 145, 300, 162, 360);
  ctx.bezierCurveTo(185, 375, 215, 340, 225, 280);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(145, 300);
  ctx.bezierCurveTo(155, 340, 170, 365, 195, 368);
  ctx.stroke();

  // Right flowing sleeve cascading smoothly from shoulder
  ctx.fillStyle = "#33458E";
  ctx.beginPath();
  ctx.moveTo(307, 205);
  ctx.bezierCurveTo(352, 235, 367, 300, 350, 360);
  ctx.bezierCurveTo(327, 375, 297, 340, 287, 280);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(367, 300);
  ctx.bezierCurveTo(357, 340, 342, 365, 317, 368);
  ctx.stroke();

  // Graceful forearms merging gently into joined hands holding glowing lotus
  ctx.strokeStyle = "#F6EEE2";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(205, 240);
  ctx.bezierCurveTo(215, 245, 235, 235, 252, 220);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(307, 240);
  ctx.bezierCurveTo(297, 245, 277, 235, 260, 220);
  ctx.stroke();

  // Delicate porcelain hands cradling lotus bud
  ctx.fillStyle = "#F6EEE2";
  ctx.beginPath();
  ctx.ellipse(256, 218, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing sacred lotus bloom in hands
  ctx.fillStyle = "rgba(255,235,160,0.95)";
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(256, 198);
  ctx.quadraticCurveTo(266, 212, 256, 220);
  ctx.quadraticCurveTo(246, 212, 256, 198);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ——— 4. Slender Graceful Neck & Serene Celestial Maiden Head ———
  // Slender neck tapering organically into sloping shoulders (NO square!)
  ctx.fillStyle = "#F6EEE2";
  ctx.beginPath();
  ctx.moveTo(247, 138);
  ctx.bezierCurveTo(246, 155, 244, 168, 240, 174);
  ctx.lineTo(272, 174);
  ctx.bezierCurveTo(268, 168, 266, 155, 265, 138);
  ctx.closePath();
  ctx.fill();

  // Elegant oval face
  ctx.beginPath();
  ctx.moveTo(256, 75);
  ctx.bezierCurveTo(228, 80, 216, 108, 218, 138);
  ctx.bezierCurveTo(220, 165, 236, 178, 256, 180);
  ctx.bezierCurveTo(276, 178, 292, 165, 294, 138);
  ctx.bezierCurveTo(296, 108, 284, 80, 256, 75);
  ctx.closePath();
  ctx.fill();

  // High classical celestial bun (Búi Tóc Mây Kế Phi Thiên)
  ctx.fillStyle = "#10162E";
  ctx.beginPath();
  ctx.moveTo(256, 62);
  ctx.bezierCurveTo(216, 65, 202, 100, 210, 142);
  ctx.bezierCurveTo(214, 155, 224, 150, 224, 135);
  ctx.bezierCurveTo(230, 100, 242, 88, 256, 86);
  ctx.bezierCurveTo(270, 88, 282, 100, 288, 135);
  ctx.bezierCurveTo(288, 150, 298, 155, 302, 142);
  ctx.bezierCurveTo(310, 100, 296, 65, 256, 62);
  ctx.closePath();
  ctx.fill();

  // Winged topknot
  ctx.beginPath();
  ctx.ellipse(256, 52, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Side hair wisps
  ctx.beginPath();
  ctx.ellipse(214, 132, 7, 24, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(298, 132, 7, 24, 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Golden lotus hairpin & pearl strands
  ctx.fillStyle = GOLD;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(256, 15);
  ctx.lineTo(272, 40);
  ctx.lineTo(256, 58);
  ctx.lineTo(240, 40);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(224, 42);
  ctx.lineTo(288, 36);
  ctx.stroke();

  // Hanging pearl strand
  ctx.beginPath();
  ctx.moveTo(256, 58);
  ctx.lineTo(256, 76);
  ctx.stroke();
  ctx.fillStyle = "#FFFBF0";
  ctx.beginPath();
  ctx.arc(256, 82, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ——— 5. Delicate Face Features ———
  // Cinnabar mark
  ctx.fillStyle = "#C82838";
  ctx.beginPath();
  ctx.ellipse(256, 98, 2.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Willow eyebrows
  ctx.strokeStyle = "#121832";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(234, 114);
  ctx.quadraticCurveTo(244, 108, 252, 114);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(260, 114);
  ctx.quadraticCurveTo(268, 108, 278, 114);
  ctx.stroke();

  // Serene closed phoenix eyes
  ctx.strokeStyle = "#1E274A";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(243, 124, 6.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(269, 124, 6.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Soft nose
  ctx.strokeStyle = "rgba(180,140,130,0.5)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(256, 126);
  ctx.lineTo(256, 136);
  ctx.stroke();

  // Rosy lips
  ctx.fillStyle = "#D65C6B";
  ctx.beginPath();
  ctx.ellipse(256, 146, 4.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft cheek blush
  ctx.fillStyle = "rgba(240,140,150,0.25)";
  ctx.beginPath();
  ctx.ellipse(234, 134, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(278, 134, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Golden silhouette rim around outer edges
  goldRim(ctx, (p) => {
    p.moveTo(195, 240);
    p.bezierCurveTo(150, 320, 140, 480, 130, 650);
    p.moveTo(317, 240);
    p.bezierCurveTo(362, 320, 372, 480, 382, 650);
  }, w, h, 1.8);

  paperGrain(ctx, w, h, 0.035);
  return c;
}

/** Long curving celestial silk ribbons (Dải Lụa Tiên) arching in fluid harmonic S-curves */
function drawCelestialRibbon(ctx, w, h, dir) {
  const isLeft = dir < 0;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Translucent peach-rose silk gradient
  const grad = ctx.createLinearGradient(0, 60, 0, h - 60);
  grad.addColorStop(0, "rgba(255,210,195,0.92)");
  grad.addColorStop(0.35, "rgba(240,145,165,0.85)");
  grad.addColorStop(0.75, "rgba(220,105,130,0.8)");
  grad.addColorStop(1, "rgba(248,185,200,0.88)");

  // Main ribbon body stroke
  ctx.strokeStyle = grad;
  ctx.lineWidth = 16;
  ctx.shadowColor = "rgba(232,184,75,0.35)";
  ctx.shadowBlur = 8;

  ctx.beginPath();
  if (isLeft) {
    ctx.moveTo(215, 125);
    ctx.bezierCurveTo(115, 65, 42, 180, 75, 305);
    ctx.bezierCurveTo(118, 410, 52, 520, 80, 660);
  } else {
    ctx.moveTo(297, 125);
    ctx.bezierCurveTo(397, 65, 470, 180, 437, 305);
    ctx.bezierCurveTo(394, 410, 460, 520, 432, 660);
  }
  ctx.stroke();

  // Luminous inner silk sheen
  ctx.strokeStyle = "rgba(255,240,230,0.65)";
  ctx.lineWidth = 4.5;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  if (isLeft) {
    ctx.moveTo(213, 127);
    ctx.bezierCurveTo(117, 68, 45, 180, 77, 305);
    ctx.bezierCurveTo(119, 410, 55, 520, 82, 660);
  } else {
    ctx.moveTo(295, 127);
    ctx.bezierCurveTo(395, 68, 467, 180, 435, 305);
    ctx.bezierCurveTo(392, 410, 457, 520, 430, 660);
  }
  ctx.stroke();

  // Emissive gold foil edges
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  if (isLeft) {
    ctx.moveTo(210, 116);
    ctx.bezierCurveTo(105, 56, 32, 180, 65, 307);
    ctx.bezierCurveTo(110, 415, 42, 525, 70, 665);
  } else {
    ctx.moveTo(302, 116);
    ctx.bezierCurveTo(407, 56, 480, 180, 447, 307);
    ctx.bezierCurveTo(402, 415, 470, 525, 442, 665);
  }
  ctx.stroke();
}

/** Jade Rabbit (Thỏ Ngọc Cung Trăng) papercut sitting on an auspicious cloud */
export function makeRabbitTexture() {
  const w = 256;
  const h = 256;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  // Golden cloud pedestal at bottom
  ctx.fillStyle = "#A82230";
  ctx.beginPath();
  ctx.arc(80, 205, 30, 0, Math.PI * 2);
  ctx.arc(128, 195, 38, 0, Math.PI * 2);
  ctx.arc(176, 205, 30, 0, Math.PI * 2);
  ctx.fill();
  goldRim(ctx, (p) => {
    p.arc(80, 205, 30, 0, Math.PI * 2);
    p.arc(128, 195, 38, 0, Math.PI * 2);
    p.arc(176, 205, 30, 0, Math.PI * 2);
  }, w, h, 2);

  // Rabbit body (ivory papercut)
  ctx.fillStyle = "#FFFDF8";
  ctx.beginPath();
  ctx.ellipse(128, 150, 45, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rabbit head
  ctx.beginPath();
  ctx.ellipse(128, 95, 32, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tall cute bunny ears
  for (const [ex, rot] of [[112, -0.15], [144, 0.15]]) {
    ctx.save();
    ctx.translate(ex, 75);
    ctx.rotate(rot);
    // Outer white ear
    ctx.fillStyle = "#FFFDF8";
    ctx.beginPath();
    ctx.ellipse(0, -32, 11, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner pink ear
    ctx.fillStyle = "rgba(245,160,175,0.6)";
    ctx.beginPath();
    ctx.ellipse(0, -30, 6, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Pink nose & mouth
  ctx.fillStyle = "#D65C6B";
  ctx.beginPath();
  ctx.arc(128, 102, 3, 0, Math.PI * 2);
  ctx.fill();

  // Dark sparkling eye
  ctx.fillStyle = "#C42535";
  ctx.beginPath();
  ctx.arc(114, 92, 4, 0, Math.PI * 2);
  ctx.arc(142, 92, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(113, 91, 1.5, 0, Math.PI * 2);
  ctx.arc(141, 91, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Holding a tiny star lantern
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  const R = 18;
  const r = 8;
  for (let i = 0; i < 5; i++) {
    const a1 = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a1 + Math.PI / 5;
    ctx.lineTo(128 + Math.cos(a1) * R, 150 + Math.sin(a1) * R);
    ctx.lineTo(128 + Math.cos(a2) * r, 150 + Math.sin(a2) * r);
  }
  ctx.closePath();
  ctx.fill();

  goldRim(ctx, (p) => {
    p.ellipse(128, 150, 45, 40, 0, 0, Math.PI * 2);
    p.ellipse(128, 95, 32, 28, 0, 0, Math.PI * 2);
  }, w, h, 1.5);

  paperGrain(ctx, w, h, 0.04);
  return c;
}

/** Floating Lotus Lantern (Đèn Hoa Đăng Cung Đình) with warm candle glow */
export function makeLotusLanternTexture() {
  const w = 192;
  const h = 192;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  const cx = w / 2;
  const cy = 115;

  // Warm candlelight halo
  const halo = ctx.createRadialGradient(cx, cy - 20, 2, cx, cy - 20, 60);
  halo.addColorStop(0, "rgba(255,225,120,0.85)");
  halo.addColorStop(0.4, "rgba(255,160,50,0.3)");
  halo.addColorStop(1, "transparent");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // Outer green lotus leaf pedestal
  ctx.fillStyle = "#1E705A";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18, 55, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Layer 1: Outer pink lotus petals
  ctx.fillStyle = "#B82545";
  for (let i = -3; i <= 3; i++) {
    const px = cx + i * 14;
    ctx.beginPath();
    ctx.moveTo(px, cy + 14);
    ctx.quadraticCurveTo(px + i * 3, cy - 24, cx + i * 16, cy + 14);
    ctx.fill();
  }

  // Layer 2: Inner rose lotus petals
  ctx.fillStyle = "#E85C7A";
  for (let i = -2; i <= 2; i++) {
    const px = cx + i * 11;
    ctx.beginPath();
    ctx.moveTo(px, cy + 12);
    ctx.quadraticCurveTo(px + i * 2, cy - 30, cx + i * 13, cy + 12);
    ctx.fill();
  }

  // Golden petal rims
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.4;
  for (let i = -2; i <= 2; i++) {
    const px = cx + i * 11;
    ctx.beginPath();
    ctx.moveTo(px, cy + 12);
    ctx.quadraticCurveTo(px + i * 2, cy - 30, cx + i * 13, cy + 12);
    ctx.stroke();
  }

  // Candle flame at center
  const flame = ctx.createRadialGradient(cx, cy - 15, 1, cx, cy - 15, 12);
  flame.addColorStop(0, "#FFFFFF");
  flame.addColorStop(0.35, "#FFE670");
  flame.addColorStop(0.7, "#FF7820");
  flame.addColorStop(1, "transparent");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.arc(cx, cy - 15, 12, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

/**
 * Traditional Vietnamese Lion Dance Head (Đầu Lân Hoàng Gia — Oai Dũng & Lộng Lẫy).
 * Redesigned with authentic royal Vietnamese papercraft aesthetics:
 * - Magnificent fan-shaped multi-layered headdress mane (Bờm quạt hoàng gia dát vàng)
 * - Proud spiraled golden horn (Sừng kỳ lân) with glowing sunburst crest
 * - Dynamic sculpted ears (Đôi tai lân vểnh uy nghiêm) with golden inner tufts
 * - Massive flame-carved eyebrows (Lông mày lửa vút nhọn) with gold foil edging
 * - Expressive, spirited theatrical eyes (Đôi mắt lân long lanh thần thái)
 * - Sculpted lion nose & whisker pads with auspicious cloud scrolls (Vân mây như ý)
 * - Roaring open jaw with pristine ivory fangs & flowing tiered chin beard
 */
export function makeLionTexture(facing = 1) {
  const w = 512;
  const h = 512;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  if (facing < 0) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  // ——— 1. LAYER 1: Imperial Fan-Shaped Mane Headdress (Bờm Quạt Hoàng Gia 17 Cánh) ———
  // Radiates majestically like an imperial golden chrysanthemum
  const maneCount = 17;
  for (let i = 0; i < maneCount; i++) {
    const tNorm = i / (maneCount - 1);
    const ang = -Math.PI * 0.95 + tNorm * Math.PI * 0.90;
    const radX = 180;
    const radY = 168;
    const x = 256 + Math.cos(ang) * radX;
    const y = 252 + Math.sin(ang) * radY;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + Math.PI / 2);

    // Warm royal scarlet to deep ruby plume
    const plumeGrad = ctx.createLinearGradient(0, -65, 0, 32);
    plumeGrad.addColorStop(0, "#7E121D");
    plumeGrad.addColorStop(0.35, "#B81D2C");
    plumeGrad.addColorStop(0.75, "#D83242");
    plumeGrad.addColorStop(1, "#E85D38");
    ctx.fillStyle = plumeGrad;

    // Smooth rounded scallop petal
    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.bezierCurveTo(24, -40, 26, 12, 10, 32);
    ctx.quadraticCurveTo(0, 40, -10, 32);
    ctx.bezierCurveTo(-26, 12, -24, -40, 0, -68);
    ctx.closePath();
    ctx.fill();

    // Embossed gold leaf petal cap
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.bezierCurveTo(12, -50, 10, -32, 0, -26);
    ctx.bezierCurveTo(-10, -32, -12, -50, 0, -68);
    ctx.closePath();
    ctx.fill();

    // Auspicious cloud curl inside plume
    ctx.strokeStyle = "rgba(255,235,160,0.85)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -2, 11, 0.2 * Math.PI, 1.4 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // ——— 2. LAYER 2: Inner Brocade Collar (Vảy Gấm Cát Tường) ———
  const collarCount = 13;
  for (let i = 0; i < collarCount; i++) {
    const tNorm = i / (collarCount - 1);
    const ang = -Math.PI * 0.93 + tNorm * Math.PI * 0.86;
    const x = 256 + Math.cos(ang) * 142;
    const y = 250 + Math.sin(ang) * 132;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + Math.PI / 2);

    // Festive alternating ruby and imperial jade
    ctx.fillStyle = i % 2 === 0 ? "#C42030" : "#008B7A";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Center sparkling gold pearl
    ctx.fillStyle = GOLD_GLOW;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ——— 3. LAYER 3: Perky Festive Ears (Đôi Tai Lân Hoan Hỉ) ———
  for (const [earX, earDir] of [[150, -1], [362, 1]]) {
    ctx.save();
    ctx.translate(earX, 150);
    ctx.scale(earDir, 1);

    // Outer warm crimson ear shell
    ctx.fillStyle = "#A61826";
    ctx.beginPath();
    ctx.moveTo(4, 42);
    ctx.bezierCurveTo(-38, 15, -55, -35, -30, -56);
    ctx.bezierCurveTo(-5, -60, 24, -20, 18, 42);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3.0;
    ctx.stroke();

    // Inner peach-gold ear tuft
    ctx.fillStyle = "#FFE8B0";
    ctx.beginPath();
    ctx.moveTo(-2, 28);
    ctx.bezierCurveTo(-28, 8, -40, -25, -22, -42);
    ctx.bezierCurveTo(-5, -45, 12, -12, 10, 28);
    ctx.closePath();
    ctx.fill();

    // Fluffy cloud ear scallops
    ctx.fillStyle = "#FFFBF2";
    for (let si = 0; si < 3; si++) {
      ctx.beginPath();
      ctx.arc(-26 + si * 14, -38 + si * 16, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ——— 4. LAYER 4: Plump, Auspicious Face Mask (Khuôn Mặt Tròn Phúc Hậu) ———
  // Broad, harmonious, chubby face contour (NO pointy demon jaw!)
  const faceGrad = ctx.createLinearGradient(256, 120, 256, 430);
  faceGrad.addColorStop(0, "#FFFDF7");
  faceGrad.addColorStop(0.5, "#FBF2DE");
  faceGrad.addColorStop(0.85, "#F0DEC0");
  faceGrad.addColorStop(1, "#E4CCA6");
  ctx.fillStyle = faceGrad;

  ctx.beginPath();
  ctx.moveTo(256, 132);
  // Rounded temples
  ctx.bezierCurveTo(345, 134, 388, 182, 386, 255);
  // Plump chubby cheeks
  ctx.bezierCurveTo(384, 330, 355, 395, 308, 420);
  // Gentle, broad rounded chin (NOT sharp)
  ctx.quadraticCurveTo(256, 432, 204, 420);
  // Symmetric left cheek
  ctx.bezierCurveTo(157, 395, 128, 330, 126, 255);
  ctx.bezierCurveTo(124, 182, 167, 134, 256, 132);
  ctx.closePath();
  ctx.fill();

  // Cheek cloud tufts (Bờm má cuộn mây may mắn 2 bên)
  for (const [cx, cDir] of [[120, -1], [392, 1]]) {
    ctx.save();
    ctx.translate(cx, 280);
    ctx.scale(cDir, 1);
    ctx.fillStyle = "#C42030";
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Inner golden swirl
    ctx.strokeStyle = GOLD_GLOW;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(4, 0, 15, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  // Rosy cheeks (Má hồng hây hây đón Tết Trung Thu)
  for (const rx of [176, 336]) {
    const rosyGrad = ctx.createRadialGradient(rx, 310, 4, rx, 310, 34);
    rosyGrad.addColorStop(0, "rgba(240, 75, 90, 0.45)");
    rosyGrad.addColorStop(0.7, "rgba(240, 75, 90, 0.15)");
    rosyGrad.addColorStop(1, "transparent");
    ctx.fillStyle = rosyGrad;
    ctx.beginPath();
    ctx.arc(rx, 310, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  // Forehead golden crown plate
  ctx.fillStyle = "#FFFDF8";
  ctx.beginPath();
  ctx.ellipse(256, 205, 92, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  // ——— 5. LAYER 5: Spiraled Golden Horn (Sừng Lân Bọc Vàng Cát Tường) ———
  const hornGrad = ctx.createLinearGradient(235, 140, 275, 30);
  hornGrad.addColorStop(0, "#C98814");
  hornGrad.addColorStop(0.4, GOLD);
  hornGrad.addColorStop(0.85, "#FFF2B5");
  hornGrad.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = hornGrad;

  ctx.beginPath();
  ctx.moveTo(240, 148);
  ctx.quadraticCurveTo(236, 85, 250, 40);
  ctx.quadraticCurveTo(256, 22, 262, 40);
  ctx.quadraticCurveTo(276, 85, 272, 148);
  ctx.closePath();
  ctx.fill();

  // Smooth spiral ridges on horn
  ctx.strokeStyle = "#8A5408";
  ctx.lineWidth = 2.4;
  for (let y = 52; y < 138; y += 17) {
    ctx.beginPath();
    ctx.moveTo(244, y);
    ctx.quadraticCurveTo(256, y + 8, 268, y);
    ctx.stroke();
  }

  // Brilliant sunburst jewel at horn tip
  ctx.fillStyle = GOLD_GLOW;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(256, 28, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(256, 28, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Twin secondary golden crests
  for (const [hx, hDir] of [[182, -1], [330, 1]]) {
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(hx, 158);
    ctx.quadraticCurveTo(hx + hDir * 40, 68, hx + hDir * 14, 46);
    ctx.quadraticCurveTo(hx + hDir * 18, 105, hx - hDir * 10, 158);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8A5408";
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // ——— 6. LAYER 6: Forehead Mirror & Dragon Pearl (Gương Bát Quái & Ngọc Minh Châu) ———
  ctx.save();
  ctx.translate(256, 180);
  ctx.fillStyle = GOLD;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 14;

  // Octagonal golden frame
  ctx.beginPath();
  const rad = 25;
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Lotus petal frame
  ctx.fillStyle = "#C42030";
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * 17, Math.sin(ang) * 17, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dragon Pearl in mirror
  const pearlGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
  pearlGrad.addColorStop(0, "#FFFFFF");
  pearlGrad.addColorStop(0.3, "#FFF5A8");
  pearlGrad.addColorStop(0.7, "#E52538");
  pearlGrad.addColorStop(1, "#7D0D18");
  ctx.fillStyle = pearlGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ——— 7. LAYER 7: Auspicious Rolling Cloud Eyebrows (Lông Mày Thụy Vân Lễ Hội) ———
  // Flowing, auspicious traditional Vietnamese temple cloud swirls (NO jagged spikes!)
  for (const [bx, bDir] of [[206, -1], [306, 1]]) {
    ctx.save();
    ctx.translate(bx, 214);
    ctx.scale(bDir, 1);

    // Main cloud brow body: 3 rolling, graceful cloud billows
    const browGrad = ctx.createLinearGradient(-42, 10, 48, -25);
    browGrad.addColorStop(0, "#8C121D");
    browGrad.addColorStop(0.5, "#B81D2C");
    browGrad.addColorStop(1, "#DB2838");
    ctx.fillStyle = browGrad;

    ctx.beginPath();
    ctx.moveTo(-45, 10);
    // Billow 1
    ctx.bezierCurveTo(-38, -12, -18, -18, -10, -6);
    // Billow 2
    ctx.bezierCurveTo(-5, -28, 22, -32, 30, -14);
    // Billow 3: sweeping tail
    ctx.bezierCurveTo(42, -26, 56, -18, 52, -2);
    // Bottom return curve
    ctx.bezierCurveTo(40, 2, 20, 6, -10, 6);
    ctx.bezierCurveTo(-25, 6, -38, 12, -45, 10);
    ctx.closePath();
    ctx.fill();

    // Gold embossed outline
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Auspicious golden swirl scrolls inside each wave
    ctx.strokeStyle = GOLD_GLOW;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-22, -4, 7, 0.2 * Math.PI, 1.6 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(10, -12, 9, 0.1 * Math.PI, 1.5 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // ——— 8. LAYER 8: Big, Spirited Round Eyes (Đôi Mắt Lân To Tròn Đen Láy Sáng Ngời) ———
  // Traditional Vietnamese lion eyes: huge, round, sparkling, friendly & full of vitality
  for (const [ex, ey] of [[212, 246], [300, 246]]) {
    ctx.save();
    ctx.translate(ex, ey);

    // Thick gold-embossed eye socket frame
    ctx.fillStyle = "#0D1430";
    ctx.beginPath();
    ctx.arc(0, 0, 31, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3.6;
    ctx.stroke();

    // Eye socket papercut scallop ring
    ctx.fillStyle = "#A61826";
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * 27, Math.sin(ang) * 27, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm luminous amber-gold iris
    const irisGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 23);
    irisGrad.addColorStop(0, "#FFFDF0");
    irisGrad.addColorStop(0.3, "#FFE870");
    irisGrad.addColorStop(0.65, "#E89B1A");
    irisGrad.addColorStop(0.9, "#B84E0C");
    irisGrad.addColorStop(1, "#541208");
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 23, 0, Math.PI * 2);
    ctx.fill();

    // Iris inner gold rim
    ctx.strokeStyle = "rgba(255, 235, 140, 0.75)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // *** BIG ROUND JET-BLACK PUPIL (NO REPTILIAN SLIT!) ***
    ctx.fillStyle = "#0A0D18";
    ctx.beginPath();
    ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // *** SPARKLING TWIN CATCHLIGHT REFLECTIONS (LONG LANH CÓ THẦN) ***
    // Primary large highlight
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(-4, -4.5, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Secondary soft sparkle
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(4, 3.5, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ——— 9. LAYER 9: Round Auspicious Snout & Whisker Pads (Mũi Tròn & Mép Lân Bầu Bĩnh) ———
  // Antique parchment nose bridge with gold spine
  ctx.fillStyle = "#ECD7B8";
  ctx.beginPath();
  ctx.moveTo(256, 244);
  ctx.lineTo(276, 286);
  ctx.lineTo(256, 298);
  ctx.lineTo(236, 286);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Round, plump auspicious crimson button nose (Mũi lân quả gấc tròn xoe)
  const noseGrad = ctx.createRadialGradient(256, 283, 3, 256, 287, 21);
  noseGrad.addColorStop(0, "#FF7E8C");
  noseGrad.addColorStop(0.55, "#D82032");
  noseGrad.addColorStop(1, "#8A0E1A");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(256, 287, 23, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Gold auspicious cloud stamp on nose tip
  ctx.strokeStyle = GOLD_GLOW;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(256, 284, 6.5, 0.2 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();

  // Plump, joyful whisker pads (Mép lân cười phúc hậu, nở nụ cười rạng rỡ)
  ctx.fillStyle = "#FFFDF5";
  ctx.beginPath();
  ctx.ellipse(218, 324, 34, 23, -0.14, 0, Math.PI * 2);
  ctx.ellipse(294, 324, 34, 23, 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Golden whisker dot clusters
  ctx.fillStyle = GOLD;
  for (const [wx, wy] of [
    [208, 320], [220, 318], [232, 322],
    [304, 320], [292, 318], [280, 322],
  ]) {
    ctx.beginPath();
    ctx.arc(wx, wy, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ——— 10. LAYER 10: Cheerful Wide Smile & Jade Pearl Teeth (Miệng Cười Đón Lộc & Răng Hạt Bắp) ———
  // Warm festive scarlet mouth cavity (NOT pitch black cave!)
  const mouthGrad = ctx.createLinearGradient(256, 328, 256, 396);
  mouthGrad.addColorStop(0, "#6E0D16");
  mouthGrad.addColorStop(0.5, "#9E1624");
  mouthGrad.addColorStop(1, "#B81D2C");
  ctx.fillStyle = mouthGrad;

  // Harmonious, wide cheerful smile shape
  ctx.beginPath();
  ctx.moveTo(186, 330);
  ctx.quadraticCurveTo(256, 404, 326, 330);
  ctx.quadraticCurveTo(256, 350, 186, 330);
  ctx.closePath();
  ctx.fill();

  // Cheerful pink-coral tongue
  const tongueGrad = ctx.createLinearGradient(256, 360, 256, 392);
  tongueGrad.addColorStop(0, "#FF6B7D");
  tongueGrad.addColorStop(1, "#E53548");
  ctx.fillStyle = tongueGrad;
  ctx.beginPath();
  ctx.ellipse(256, 376, 26, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 235, 140, 0.8)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // *** JADE PEARL TEETH: CLEAN, ROUNDED, AUSPICIOUS (NO VAMPIRE FANGS!) ***
  // Upper row of 6 neat, rounded pearl teeth
  ctx.fillStyle = "#FFFFFA";
  const teethCount = 6;
  for (let ti = 0; ti < teethCount; ti++) {
    const tx = 216 + ti * 16;
    ctx.beginPath();
    ctx.arc(tx, 332, 6.5, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.0;
    ctx.stroke();
  }

  // Two cute, rounded lucky corner canines (Răng khểnh may mắn, bo tròn đầu xinh xắn)
  for (const cx of [202, 310]) {
    ctx.fillStyle = "#FFFFFA";
    ctx.beginPath();
    ctx.arc(cx, 333, 7.5, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Smiling lower lip with gold trim
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(186, 330);
  ctx.quadraticCurveTo(256, 404, 326, 330);
  ctx.stroke();

  // ——— 11. LAYER 11: Cascading Silk Papercut Chin Beard (Chòm Râu Lân Quý Phái) ———
  // Flowing scalloped silk paper folds under chin
  for (let bi = 0; bi < 7; bi++) {
    const bx = 208 + bi * 16;
    const by = 400;
    ctx.fillStyle = bi % 2 === 0 ? "#C42030" : GOLD;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by);
    ctx.quadraticCurveTo(bx - 6, by + 26, bx, by + 32);
    ctx.quadraticCurveTo(bx + 6, by + 26, bx + 10, by);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = GOLD_GLOW;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  for (let bi = 0; bi < 5; bi++) {
    const bx = 224 + bi * 16;
    const by = 424;
    ctx.fillStyle = bi % 2 === 0 ? GOLD : "#A61826";
    ctx.beginPath();
    ctx.moveTo(bx - 9, by);
    ctx.quadraticCurveTo(bx - 5, by + 26, bx, by + 34);
    ctx.quadraticCurveTo(bx + 5, by + 26, bx + 9, by);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = GOLD_GLOW;
    ctx.lineWidth = 1.0;
    ctx.stroke();
  }

  // Master outer gold rim on plump head contour
  goldRim(ctx, (p) => {
    p.moveTo(256, 132);
    p.bezierCurveTo(345, 134, 388, 182, 386, 255);
    p.bezierCurveTo(384, 330, 355, 395, 308, 420);
    p.quadraticCurveTo(256, 432, 204, 420);
    p.bezierCurveTo(157, 395, 128, 330, 126, 255);
    p.bezierCurveTo(124, 182, 167, 134, 256, 132);
  }, w, h, 2.4);

  paperGrain(ctx, w, h, 0.04);
  return c;
}

/** Eyelid texture for traditional mechanical puppet blink */
export function makeEyelidTexture() {
  const w = 128;
  const h = 64;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  // Crimson scalloped lid with gold foil trim
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#8C121D");
  g.addColorStop(0.7, "#B81D2C");
  g.addColorStop(1, "#D83242");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.quadraticCurveTo(w / 2, h + 8, w - 4, 4);
  ctx.lineTo(w - 4, 0);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.quadraticCurveTo(w / 2, h + 8, w - 4, 4);
  ctx.stroke();

  return c;
}

/** Gentle subtle warm starlight twinkle for eyes */
export function makeEyeTexture() {
  const size = 64;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 28);
  g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  g.addColorStop(0.2, "rgba(255, 235, 140, 0.6)");
  g.addColorStop(0.5, "rgba(235, 140, 40, 0.15)");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/**
 * Vertical couplet / riddle banner (Liễn Câu Đối / Câu Đố Trung Thu).
 * Narrower, elegant proportions (140 x 720).
 * Features:
 * - Turned wooden rollers with gold end caps at top and bottom (Trục cuốn bọc vàng)
 * - Semi-translucent crimson paper texture with subtle gold foil stamped border patterns
 * - Crisp, elegant vertical calligraphy with grapheme cluster awareness
 */
export function makeBannerTexture(side, text) {
  // High-resolution 280x1200 canvas for razor-sharp typography in WebGL
  const w = 280;
  const h = 1200;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  // ——— 1. Imperial Crimson Velvet Ground ———
  const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
  bgGrad.addColorStop(0, "#2D0508");
  bgGrad.addColorStop(0.12, "#5C0E15");
  bgGrad.addColorStop(0.35, "#8E1620");
  bgGrad.addColorStop(0.5, "#A81A25");
  bgGrad.addColorStop(0.65, "#8E1620");
  bgGrad.addColorStop(0.88, "#5C0E15");
  bgGrad.addColorStop(1, "#2D0508");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(16, 42, w - 32, h - 84);

  // Delicate woven silk texture lines
  ctx.strokeStyle = "rgba(255, 230, 150, 0.05)";
  ctx.lineWidth = 1;
  for (let y = 50; y < h - 50; y += 10) {
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(w - 22, y);
    ctx.stroke();
  }

  // ——— 2. Imperial Gold Foil Stamped Borders (Viền Vàng Hoàng Gia) ———
  // Outer thick gold border
  ctx.strokeStyle = "#FFE066";
  ctx.lineWidth = 4.0;
  ctx.shadowColor = "rgba(255, 215, 0, 0.65)";
  ctx.shadowBlur = 10;
  ctx.strokeRect(24, 52, w - 48, h - 104);

  // Inner fine gold border
  ctx.strokeStyle = "#E8B84B";
  ctx.lineWidth = 1.6;
  ctx.shadowBlur = 0;
  ctx.strokeRect(32, 60, w - 64, h - 120);

  // Ornate Royal Cloud Corner Motifs (Hoa Văn Mây Như Ý Bốn Góc)
  const cornerR = 14;
  for (const [cx, cy] of [
    [32, 60],
    [w - 32, 60],
    [32, h - 60],
    [w - 32, h - 60],
  ]) {
    ctx.fillStyle = "#FFE066";
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#E8B84B";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, cornerR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header Imperial Medallion (Huy Hiệu Trăng Rằm)
  ctx.fillStyle = "#FFE066";
  ctx.shadowColor = "rgba(255, 215, 0, 0.75)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(w / 2, 95, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8E1620";
  ctx.beginPath();
  ctx.arc(w / 2, 95, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFF275";
  ctx.font = 'bold 20px "Cinzel", "Be Vietnam Pro", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 4;
  ctx.fillText("秋", w / 2, 96);

  // ——— 3. Turned Gold Wooden Rollers (Trục Cuốn Gỗ Bọc Vàng Kim) ———
  function drawRoller(yPos) {
    // Turned gold end knobs
    ctx.fillStyle = "#FFE066";
    ctx.shadowColor = "rgba(255, 215, 0, 0.7)";
    ctx.shadowBlur = 8;
    ctx.fillRect(0, yPos - 10, 18, 20);
    ctx.fillRect(w - 18, yPos - 10, 18, 20);
    ctx.beginPath();
    ctx.arc(3, yPos, 10, 0, Math.PI * 2);
    ctx.arc(w - 3, yPos, 10, 0, Math.PI * 2);
    ctx.fill();

    // Polished rosewood roller bar
    const woodGrad = ctx.createLinearGradient(0, yPos - 12, 0, yPos + 12);
    woodGrad.addColorStop(0, "#5A2810");
    woodGrad.addColorStop(0.35, "#8B421A");
    woodGrad.addColorStop(0.7, "#4E200C");
    woodGrad.addColorStop(1, "#2C1005");
    ctx.fillStyle = woodGrad;
    ctx.fillRect(16, yPos - 11, w - 32, 22);

    // Gold decorative sleeve rings
    ctx.fillStyle = "#FFE066";
    ctx.fillRect(19, yPos - 11, 5, 22);
    ctx.fillRect(w - 24, yPos - 11, 5, 22);
    ctx.shadowBlur = 0;
  }

  // Draw top & bottom wooden rollers
  drawRoller(38);
  drawRoller(h - 38);

  // Bottom hanging silk cord & crimson tassel
  ctx.strokeStyle = "#FFE066";
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 28);
  ctx.lineTo(w / 2, h - 4);
  ctx.stroke();

  ctx.fillStyle = "#A81A25";
  ctx.beginPath();
  ctx.arc(w / 2, h - 4, 7, 0, Math.PI * 2);
  ctx.fill();

  // ——— 4. Bold Majestic Royal Calligraphy (Chữ Vàng Kim Đậm Sắc Nét) ———
  const defaultText =
    side === "left"
      ? "VẰNG VẶC TRĂNG RẰM SOI ĐẤT VIỆT"
      : "RỘN RÃ LÂN MÚA ĐÓN TRUNG THU";
  const rawText = (text || defaultText).toUpperCase().trim();
  const words = rawText.split(/\s+/); // 7 authentic words

  // Generous vertical distribution across 1200px canvas
  const startY = 175;
  const totalSlots = words.length;
  const availableH = h - 180 - startY; // ~845px
  const stepY = availableH / (totalSlots - 1);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  words.forEach((word, i) => {
    const y = startY + i * stepY;

    // Word font: Extra Bold, majestic typography with full Vietnamese diacritics
    // Word length responsive sizing (longer words like "TRĂNG" scaled slightly to keep margin)
    const fontSize = word.length >= 5 ? 35 : 38;
    ctx.font = `800 ${fontSize}px "Cinzel", "Be Vietnam Pro", system-ui, sans-serif`;

    // Pass 1: Sharp deep shadow for maximum legibility and contrast against crimson
    ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#000000";
    ctx.fillText(word, w / 2, y + 2);

    // Pass 2: Outer intense golden bloom glow
    ctx.shadowColor = "rgba(255, 215, 0, 0.85)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Imperial Gold Gradient Fill
    const goldGrad = ctx.createLinearGradient(0, y - 22, 0, y + 22);
    goldGrad.addColorStop(0, "#FFFDF0");
    goldGrad.addColorStop(0.3, "#FFF275");
    goldGrad.addColorStop(0.7, "#FFE066");
    goldGrad.addColorStop(1, "#D49B22");
    ctx.fillStyle = goldGrad;
    ctx.fillText(word, w / 2, y);

    // Pass 3: Crisp gold edge stroke for razor-sharp definition
    ctx.strokeStyle = "rgba(255, 250, 200, 0.65)";
    ctx.lineWidth = 0.8;
    ctx.shadowBlur = 0;
    ctx.strokeText(word, w / 2, y);

    // Subtle golden separator diamond between words
    if (i < words.length - 1) {
      const midY = y + stepY * 0.5;
      ctx.fillStyle = "#FFE066";
      ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(w / 2, midY - 6);
      ctx.lineTo(w / 2 + 5, midY);
      ctx.lineTo(w / 2, midY + 6);
      ctx.lineTo(w / 2 - 5, midY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });

  // Soft silk sheen overlay
  const sheen = ctx.createLinearGradient(0, 0, 0, h);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  sheen.addColorStop(0.4, "rgba(255, 255, 255, 0)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0.22)");
  ctx.fillStyle = sheen;
  ctx.fillRect(16, 42, w - 32, h - 84);

  paperGrain(ctx, w, h, 0.035);
  return c;
}

/** Mid-Autumn Festival Lanterns (Đèn Lồng Truyền Thống) */
export function makeLanternTexture(type = "round") {
  const w = 256;
  const h = 320;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  if (type === "star") return drawStarLantern(ctx, w, h), c;
  if (type === "fish") return drawFishLantern(ctx, w, h), c;
  if (type === "mooncake") return drawMooncakeLantern(ctx, w, h), c;
  return drawRoundLantern(ctx, w, h), c;
}

function lanternHalo(ctx, cx, cy, r) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.2);
  g.addColorStop(0, "rgba(255,220,120,0.6)");
  g.addColorStop(0.4, "rgba(255,160,60,0.22)");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawTassel(ctx, x, y) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 26);
  ctx.stroke();

  ctx.fillStyle = "#C42535";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + 26);
    ctx.lineTo(x + i * 3.5, y + 54);
    ctx.strokeStyle = "#C42535";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y + 22, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundLantern(ctx, w, h) {
  const cx = w / 2;
  const cy = 140;
  lanternHalo(ctx, cx, cy, 70);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, 68);
  ctx.stroke();

  const g = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, 75);
  g.addColorStop(0, "#FFEAA5");
  g.addColorStop(0.5, "#F09A35");
  g.addColorStop(1, "#CE4818");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 56, 72, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(160,45,15,0.45)";
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + i * 15, cy, 11, 72, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = GOLD;
  ctx.fillRect(cx - 18, 68, 36, 12);
  ctx.fillRect(cx - 18, 200, 36, 12);

  goldRim(ctx, (p) => p.ellipse(cx, cy, 56, 72, 0, 0, Math.PI * 2), w, h, 2);
  drawTassel(ctx, cx, 212);
  paperGrain(ctx, w, h, 0.03);
}

function drawStarLantern(ctx, w, h) {
  const cx = w / 2;
  const cy = 145;
  lanternHalo(ctx, cx, cy, 80);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 15);
  ctx.lineTo(cx, 55);
  ctx.stroke();

  const R = 80;
  const r = 32;
  ctx.fillStyle = "#E03828";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a1 + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
    ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Luminous inner star face
  ctx.fillStyle = "#FFE290";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a1 + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a1) * (R - 16), cy + Math.sin(a1) * (R - 16));
    ctx.lineTo(cx + Math.cos(a2) * (r - 8), cy + Math.sin(a2) * (r - 8));
  }
  ctx.closePath();
  ctx.fill();

  // Center full moon disc
  ctx.fillStyle = "#FFF7D4";
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  drawTassel(ctx, cx, 230);
  paperGrain(ctx, w, h, 0.03);
}

function drawFishLantern(ctx, w, h) {
  const cx = w / 2;
  const cy = 145;
  lanternHalo(ctx, cx, cy, 70);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.lineTo(cx, 55);
  ctx.stroke();

  ctx.fillStyle = "#E89B2B";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 66, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#E84535";
  ctx.beginPath();
  ctx.moveTo(cx + 55, cy);
  ctx.quadraticCurveTo(cx + 95, cy - 45, cx + 105, cy - 20);
  ctx.quadraticCurveTo(cx + 90, cy, cx + 105, cy + 20);
  ctx.quadraticCurveTo(cx + 95, cy + 45, cx + 55, cy);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx - 35, cy - 8, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#151B38";
  ctx.fill();
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(cx - 37, cy - 10, 3, 0, Math.PI * 2);
  ctx.fill();

  goldRim(ctx, (p) => p.ellipse(cx, cy, 66, 48, 0, 0, Math.PI * 2), w, h, 2);
  drawTassel(ctx, cx, 200);
  paperGrain(ctx, w, h, 0.03);
}

function drawMooncakeLantern(ctx, w, h) {
  const cx = w / 2;
  const cy = 145;
  lanternHalo(ctx, cx, cy, 70);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.lineTo(cx, 55);
  ctx.stroke();

  const g = ctx.createRadialGradient(cx - 12, cy - 12, 8, cx, cy, 65);
  g.addColorStop(0, "#FFE0A0");
  g.addColorStop(0.7, "#E8B050");
  g.addColorStop(1, "#B87020");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 62, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#D48B25";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#C83240";
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.font = "bold 18px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("月", cx, cy + 1);

  goldRim(ctx, (p) => p.arc(cx, cy, 62, 0, Math.PI * 2), w, h, 2);
  drawTassel(ctx, cx, 215);
  paperGrain(ctx, w, h, 0.03);
}

/** Stage floor paper cutout */
export function makeFloorTexture() {
  const w = 1024;
  const h = 256;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(8,12,30,0)");
  g.addColorStop(0.3, "rgba(10,16,42,0.75)");
  g.addColorStop(1, "#050918");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.quadraticCurveTo(w / 2, 12, w, 30);
  ctx.stroke();

  ctx.beginPath();
  for (let x = 0; x < w; x += 8) {
    const y = 55 + Math.sin(x * 0.04) * 6;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(232,184,75,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  return c;
}

/**
 * Rabbit Lantern (Lồng Đèn Thỏ) — Cute chibi bunny silhouette lantern.
 * Oval peach-pink glowing body, long bunny ears at top, cute face (dot eyes,
 * pink nose, smile, whiskers, rosy cheeks), fluffy round tail below, gold tassel.
 * Canvas: 256 × 360
 */
export function makeRabbitLanternTexture() {
  const w = 256;
  const h = 360;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const cx = w / 2;

  // Glow halo behind the body
  const haloR = ctx.createRadialGradient(cx, 180, 20, cx, 180, 110);
  haloR.addColorStop(0, 'rgba(255,230,200,0.75)');
  haloR.addColorStop(0.55, 'rgba(255,180,120,0.30)');
  haloR.addColorStop(1, 'transparent');
  ctx.fillStyle = haloR;
  ctx.fillRect(0, 0, w, h);

  // Hanging string
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 12);
  ctx.lineTo(cx, 52);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, 12, 5, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();

  // Long bunny ears (behind body)
  function drawEar(ex, eyBase, lean) {
    ctx.save();
    ctx.translate(ex, eyBase);
    ctx.rotate(lean);
    ctx.beginPath();
    ctx.ellipse(0, -38, 16, 44, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F5E0D0';
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -36, 9, 32, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F5A0A8';
    ctx.fill();
    ctx.restore();
  }
  drawEar(cx - 26, 90, -0.18);
  drawEar(cx + 26, 90, 0.18);

  // Main oval body
  const bodyGrad = ctx.createRadialGradient(cx - 18, 170, 18, cx, 185, 82);
  bodyGrad.addColorStop(0, '#FFF8F0');
  bodyGrad.addColorStop(0.45, '#F9D4B6');
  bodyGrad.addColorStop(0.85, '#F0A880');
  bodyGrad.addColorStop(1, '#D07040');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, 185, 72, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lantern ribs
  ctx.strokeStyle = 'rgba(190,100,50,0.25)';
  ctx.lineWidth = 1.4;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + i * 18, 185, 12, 90, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Gold band top & bottom
  ctx.fillStyle = GOLD;
  ctx.shadowColor = GOLD_GLOW;
  ctx.shadowBlur = 6;
  ctx.fillRect(cx - 24, 96, 48, 10);
  ctx.fillRect(cx - 24, 269, 48, 10);
  ctx.shadowBlur = 0;

  // Bunny eyes
  const eyeY = 172;
  [[cx - 22, eyeY], [cx + 22, eyeY]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.arc(ex, ey, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#1A0A08';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + 2.5, ey - 2.5, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
  });

  // Pink nose
  ctx.beginPath();
  ctx.ellipse(cx, eyeY + 14, 5.5, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#F08090';
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#8B4040';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, eyeY + 16, 10, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = 'rgba(80,40,30,0.5)';
  ctx.lineWidth = 1.2;
  [[-1, -4], [-1, 2], [1, -4], [1, 2]].forEach(([sx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + sx * 6, eyeY + 14 + dy);
    ctx.lineTo(cx + sx * 28, eyeY + 10 + dy * 2);
    ctx.stroke();
  });

  // Rosy cheeks
  [[cx - 28, eyeY + 10], [cx + 28, eyeY + 10]].forEach(([bx, by]) => {
    const chk = ctx.createRadialGradient(bx, by, 0, bx, by, 14);
    chk.addColorStop(0, 'rgba(255,120,120,0.35)');
    chk.addColorStop(1, 'transparent');
    ctx.fillStyle = chk;
    ctx.beginPath();
    ctx.ellipse(bx, by, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Gold rim outline
  goldRim(ctx, (p) => p.ellipse(cx, 185, 72, 90, 0, 0, Math.PI * 2), w, h, 2.5);

  // Fluffy cotton tail
  ctx.beginPath();
  ctx.arc(cx, 278, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF5EE';
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let a = 0; a < Math.PI * 2; a += 1.05) {
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 10, 278 + Math.sin(a) * 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tassel
  drawTassel(ctx, cx, 280);
  paperGrain(ctx, w, h, 0.025);
  return c;
}

