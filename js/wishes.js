/**
 * Celestial Galaxy of Mid-Autumn Wishes (Dải Ngân Hà Lời Chúc)
 * Floating 3D glassmorphic wish pills, continuous weightless drift, and centerpiece greeting card.
 */

import { playWishPop } from './audio.js';

const WISHES = [
  "Chúc bạn mùa trăng ngập tràn hạnh phúc! 🌕💖",
  "Tương lai rực rỡ như vầng trăng rằm ✨",
  "Tròn vẹn yêu thương, vạn sự hanh thông 🥮",
  "Hương vị bánh nướng ấm áp đêm trăng 🏮",
  "Gửi ngàn vì sao mang điều ước đến bạn 🌟",
  "Gia đình sum vầy, an yên hạnh phúc 🌸",
  "Nguyện ước đêm rằm đều thành hiện thực 🌙",
  "Tâm an vạn sự an, đời đời vui vẻ ✨",
  "Nụ cười rạng rỡ như ánh trăng tròn 💫",
  "Đoàn viên ấm áp bên người thân yêu 🥮❤️",
  "Bình an như ý, vạn dặm bình yên 🏮✨",
  "Ánh trăng soi đường muôn nẻo thành công 🌕🚀",
  "Gặp nhiều may mắn, phú quý an khang 💰🌸",
  "Thanh xuân tươi đẹp, hạnh phúc đong đầy 🌺💖",
  "Đêm hội trăng rằm rộn rã tiếng cười 🐰🎶",
  "Mỗi ngày đều ngọt ngào như bánh dẻo 🥮🍯",
  "Hạnh phúc trường cửu, vạn sự cát tường 🌟🍀",
  "Trăng tròn người trọn, vẹn tròn ước mơ 🌕💫",
  "Tài lộc tấn tới, phúc khí dồi dào 🏮💰",
  "Sức khỏe dồi dào, thảnh thơi an lạc 🌸🌿",
  "Gặp được tri kỷ cùng ngắm trăng rằm 🌙🥂",
  "Đong đầy niềm vui, xua tan âu lo 💖✨",
  "Cung trăng tỏa sáng, may mắn ngập tràn 🐰🌕",
  "Vui tết Trung Thu, rộn ràng trống lân 🥁🏮",
  "Mọi điều mong ước đều hóa thành hoa 🌸✨",
  "Trăng sáng soi sáng triệu điều ước mơ 🌟💫",
  "Một đời bình an, vạn sự cát lành 🍀🥮",
  "Thắp sáng niềm tin, vững bước tương lai 🏮🌕",
  "Ngọt ngào sum họp, trọn vẹn yêu thương 💖🌸",
  "Vui hội trăng rằm cùng Chị Hằng & Chú Cuội 🐰🌙"
];

export class WishesGalaxy {
  constructor() {
    this.container = document.getElementById('wishes-galaxy');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'wishes-galaxy';
      this.container.className = 'wishes-galaxy';
      document.body.appendChild(this.container);
    }

    this.modal = document.getElementById('celebration-modal');
    this.bubbleItems = [];
    this.animating = false;
    this.rafId = null;
    this.lastTime = 0;

    this.initModalEvents();
  }

  initModalEvents() {
    if (!this.modal) return;
    const closeBtns = this.modal.querySelectorAll('[data-close-celebration]');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.closeModal());
    });
  }

  /**
   * Spawn the galaxy of floating wish tags bursting outward from Chị Hằng's screen position
   */
  spawn(origin = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 }) {
    this.clear();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768 || h > w;
    const count = isMobile ? Math.min(14, WISHES.length) : Math.min(30, WISHES.length);
    // Shuffle wishes
    const shuffled = [...WISHES].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'wish-pill';
      el.textContent = shuffled[i];

      // Add to container
      this.container.appendChild(el);

      let targetX, targetY;
      if (isMobile) {
        // Distribute nicely in vertical bands avoiding the centerpiece modal (y: 32% - 66%)
        const half = Math.ceil(count / 2);
        const isUpper = i < half;
        const slot = isUpper ? i : (i - half);
        const slotsTotal = isUpper ? half : (count - half);

        // Disperse horizontally across screen with gentle jitter
        const xPct = (slot + 0.5) / slotsTotal;
        targetX = Math.max(30, Math.min(w - 30, w * xPct + (Math.random() - 0.5) * 24));

        if (isUpper) {
          // Upper sky zone: 8% to 28% of viewport height
          targetY = 45 + (slot / Math.max(1, slotsTotal - 1)) * (h * 0.20) + (Math.random() - 0.5) * 15;
        } else {
          // Lower stage zone: 68% to 88% of viewport height
          targetY = h * 0.68 + (slot / Math.max(1, slotsTotal - 1)) * (h * 0.18) + (Math.random() - 0.5) * 15;
        }
      } else {
        // Desktop radial dispersion
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const radius = 160 + Math.random() * Math.min(w * 0.45, h * 0.42);
        targetX = Math.max(70, Math.min(w - 70, origin.x + Math.cos(angle) * radius));
        targetY = Math.max(60, Math.min(h - 60, origin.y + Math.sin(angle) * (radius * 0.85)));
      }

      const targetZ = (Math.random() - 0.5) * (isMobile ? 220 : 450); // 3D depth

      // Physics state
      const item = {
        el,
        x: origin.x,
        y: origin.y,
        z: 0,
        targetX,
        targetY,
        targetZ,
        baseX: targetX,
        baseY: targetY,
        baseZ: targetZ,
        vx: (targetX - origin.x) * 0.05,
        vy: (targetY - origin.y) * 0.05,
        vz: targetZ * 0.05,
        phase: Math.random() * Math.PI * 2,
        freq: 0.8 + Math.random() * 0.8,
        driftSpeedY: -0.12 - Math.random() * 0.25, // slow lantern drift upward
        driftSpeedZ: 0.08 + Math.random() * 0.20,  // slow float toward camera
        hovered: false,
        settled: false,
      };

      // Interactive hover
      el.addEventListener('mouseenter', () => {
        item.hovered = true;
      });
      el.addEventListener('mouseleave', () => {
        item.hovered = false;
      });

      // Click to pop mini sparks
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        playWishPop();
        this.triggerPillPop(el, item);
      });

      this.bubbleItems.push(item);

      // Radial burst spring-in using GSAP
      if (window.gsap) {
        gsap.fromTo(
          item,
          { x: origin.x, y: origin.y, z: -200 },
          {
            x: targetX,
            y: targetY,
            z: targetZ,
            duration: 1.4 + Math.random() * 0.6,
            ease: 'back.out(1.4)',
            delay: i * 0.025,
            onComplete: () => {
              item.settled = true;
              item.baseX = item.x;
              item.baseY = item.y;
              item.baseZ = item.z;
            },
          }
        );
      } else {
        item.settled = true;
      }
    }

    // Start 60 FPS floating physics
    this.startLoop();

    // Show centerpiece celebratory popup modal card
    this.openModal();
  }

  triggerPillPop(el, item) {
    el.classList.add('popped');
    const emojis = ['✨', '💖', '🥮', '🌟', '🌕', '🐰'];
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('span');
      spark.className = 'pill-spark';
      spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const rect = el.getBoundingClientRect();
      spark.style.left = `${rect.left + rect.width / 2}px`;
      spark.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(spark);

      const dx = (Math.random() - 0.5) * 140;
      const dy = -40 - Math.random() * 80;

      if (window.gsap) {
        gsap.to(spark, {
          x: dx,
          y: dy,
          opacity: 0,
          scale: 1.6,
          duration: 0.9,
          ease: 'power2.out',
          onComplete: () => spark.remove(),
        });
      } else {
        setTimeout(() => spark.remove(), 800);
      }
    }
  }

  startLoop() {
    if (this.animating) return;
    this.animating = true;

    const loop = (timestamp) => {
      if (!this.animating) return;
      this.rafId = requestAnimationFrame(loop);

      const t = timestamp * 0.001;
      const dt = 0.016;

      const w = window.innerWidth;
      const h = window.innerHeight;

      for (let i = 0; i < this.bubbleItems.length; i++) {
        const item = this.bubbleItems[i];
        if (!item.hovered && item.settled) {
          // Slow continuous vertical and depth drift
          item.baseY += item.driftSpeedY;
          item.baseZ += item.driftSpeedZ;

          // Wrap around if floating off screen
          if (item.baseY < -50) item.baseY = h + 40;
          if (item.baseZ > 300) item.baseZ = -350;

          // Harmonic organic wobbling
          const wobbleX = Math.sin(t * item.freq + item.phase) * 12;
          const wobbleY = Math.cos(t * item.freq * 0.8 + item.phase) * 8;

          item.x = item.baseX + wobbleX;
          item.y = item.baseY + wobbleY;
          item.z = item.baseZ;
        }

        // Apply 3D transform
        const scale = Math.max(0.65, Math.min(1.25, 1 + item.z / 600));
        const opacity = Math.max(0.35, Math.min(0.95, 0.75 + item.z / 900));

        item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, ${item.z}px) scale(${scale})`;
        item.el.style.opacity = opacity;
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  openModal() {
    if (!this.modal) return;
    this.modal.hidden = false;
    this.modal.classList.add('visible');

    if (window.gsap) {
      const card = this.modal.querySelector('.celebration-card');
      if (card) {
        gsap.fromTo(
          card,
          { scale: 0.65, opacity: 0, y: 40 },
          { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.5)', delay: 0.25 }
        );
      }
    }
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('visible');
    setTimeout(() => {
      this.modal.hidden = true;
    }, 350);
  }

  clear() {
    this.animating = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.container.innerHTML = '';
    this.bubbleItems = [];
  }
}
