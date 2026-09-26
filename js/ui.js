/** Curtain intro + seal shatter + riddle modal */

const RIDDLES = {
  left: {
    label: "CÂU ĐỐ · VẾ TRÁI",
    title: "Trăng rằm soi đất Việt",
    body: "Vằng vặc trăng rằm soi đất Việt — Em đoán xem: vật gì treo trên trời đêm Trung Thu, sáng tỏ suốt canh khuya mà không cần thắp đèn?",
    answer: "Ông Trăng / Mặt Trăng rằm",
  },
  right: {
    label: "CÂU ĐỐ · VẾ PHẢI",
    title: "Lân múa đón Trung Thu",
    body: "Rộn rã lân múa đón Trung Thu — Em đoán xem: linh vật đầu sư tử, thân kỳ lân, hay múa trước cửa nhà mỗi dịp rằm tháng Tám?",
    answer: "Kỳ Lân / Lân Sư Rồng",
  },
};

export class TheaterUI {
  constructor({ onStart, onRiddleOpen, onRiddleClose, onGoddessClick }) {
    this.onStart = onStart;
    this.onRiddleOpen = onRiddleOpen;
    this.onRiddleClose = onRiddleClose;
    this.onGoddessClick = onGoddessClick;

    this.layer = document.getElementById("curtain-layer");
    this.left = document.getElementById("curtain-left");
    this.right = document.getElementById("curtain-right");
    this.sealWrap = document.getElementById("seal-wrap");
    this.btnStart = document.getElementById("btn-start");
    this.stardust = document.getElementById("stardust");
    this.hud = document.getElementById("hud");
    this.modal = document.getElementById("riddle-modal");
    this.riddleLabel = document.getElementById("riddle-label");
    this.riddleTitle = document.getElementById("riddle-title");
    this.riddleBody = document.getElementById("riddle-body");
    this.riddleAnswer = document.getElementById("riddle-answer");
    this.btnReveal = document.getElementById("btn-reveal");

    this.currentSide = null;

    this.spawnMotes();

    this.btnStart.addEventListener("click", () => this.handleStart());
    this.modal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", () => this.closeRiddle());
    });
    this.btnReveal.addEventListener("click", () => {
      this.riddleAnswer.hidden = false;
      this.btnReveal.hidden = true;
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeRiddle();
    });
  }

  handleStart() {
    if (this._started) return;
    this._started = true;
    this.playStardust();
    this.onStart?.();
  }

  playStardust() {
    const canvas = this.stardust;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const particles = Array.from({ length: 70 }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 12;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        size: 1.5 + Math.random() * 3.5,
      };
    });

    canvas.style.opacity = "1";
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.99;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, `rgba(255,240,180,${p.life})`);
        g.addColorStop(0.4, `rgba(232,184,75,${p.life * 0.6})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame++;
      if (frame < 90) requestAnimationFrame(draw);
      else canvas.style.opacity = "0";
    };
    draw();
  }

  spawnMotes() {
    const host = document.getElementById("motes");
    if (!host) return;
    const count = 18;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "mote";
      el.style.left = Math.random() * 100 + "%";
      el.style.top = Math.random() * 100 + "%";
      el.style.animationDelay = -Math.random() * 12 + "s";
      el.style.animationDuration = 8 + Math.random() * 7 + "s";
      host.appendChild(el);
    }
  }

  /**
   * Cinematic open: moon latch splits → wooden doors pivot/slide aside
   * with golden light & mist flooding the stage.
   */
  playOpening(gsap) {
    const tl = gsap.timeline();
    const latch = this.btnStart;
    const light = document.getElementById("gate-light");

    // 1. Moon latch charges
    tl.to(latch, {
      scale: 1.12,
      duration: 0.28,
      ease: "power2.in",
    }, 0);

    tl.to(latch, {
      filter: "drop-shadow(0 0 36px rgba(255,215,0,0.9)) drop-shadow(0 0 70px rgba(255,220,100,0.55))",
      duration: 0.22,
      ease: "power1.in",
    }, 0);

    // 2. Latch splits / flashes
    tl.to(".latch-half-l", {
      xPercent: -120,
      opacity: 0,
      duration: 0.45,
      ease: "power3.in",
    }, 0.22);

    tl.to(".latch-half-r", {
      xPercent: 120,
      opacity: 0,
      duration: 0.45,
      ease: "power3.in",
    }, 0.22);

    tl.to(latch, {
      scale: 1.55,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
    }, 0.28);

    tl.to(this.sealWrap, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.out",
    }, 0.38);

    // 3. Wooden doors slide + slight 3D pivot outward
    tl.to(this.left, {
      xPercent: -102,
      rotationY: 14,
      duration: 2.4,
      ease: "power3.inOut",
    }, 0.3);

    tl.to(this.right, {
      xPercent: 102,
      rotationY: -14,
      duration: 2.4,
      ease: "power3.inOut",
    }, 0.3);

    // 4. Temple roof lifts away
    tl.to(".temple-roof", {
      yPercent: -110,
      opacity: 0.45,
      duration: 1.5,
      ease: "power2.in",
    }, 0.42);

    // 5. Golden light + mist flood out
    if (light) {
      tl.to(light, {
        opacity: 1,
        duration: 0.55,
        ease: "power2.out",
      }, 0.48);
      tl.fromTo(light.querySelectorAll(".light-ray"), {
        scaleY: 0.3,
        opacity: 0,
      }, {
        scaleY: 1.15,
        opacity: 1,
        duration: 1.55,
        stagger: 0.1,
        ease: "power2.out",
      }, 0.48);
      tl.fromTo(light.querySelectorAll(".mist"), {
        scale: 0.35,
        opacity: 0,
      }, {
        scale: 1.3,
        opacity: 1,
        duration: 1.8,
        stagger: 0.12,
        ease: "power2.out",
      }, 0.46);
      tl.to(light, {
        opacity: 0,
        duration: 1.1,
        ease: "power2.in",
      }, 2.0);
    }

    // 6. Fade the gate layer
    tl.to(this.layer, {
      opacity: 0,
      duration: 0.55,
      ease: "power2.out",
      onComplete: () => {
        this.layer.classList.add("opened");
        this.layer.style.display = "none";
        this.hud.classList.remove("hidden");
      },
    }, 2.15);

    return tl;
  }

  showHud() {
    this.hud.classList.remove("hidden");
  }

  openRiddle(side) {
    const data = RIDDLES[side];
    if (!data) return;
    this.currentSide = side;
    this.riddleLabel.textContent = data.label;
    this.riddleTitle.textContent = data.title;
    this.riddleBody.textContent = data.body;
    this.riddleAnswer.textContent = `✦ ${data.answer}`;
    this.riddleAnswer.hidden = true;
    this.btnReveal.hidden = false;
    this.modal.hidden = false;
    this.onRiddleOpen?.(side);
  }

  closeRiddle() {
    if (this.modal.hidden) return;
    this.modal.hidden = true;
    this.onRiddleClose?.();
  }

  bindBannerClicks(stage, gsapRef) {
    const g = gsapRef || window.gsap;
    const canvas = document.getElementById("stage");
    let pointerDownPos = null;
    let pointerDownTime = 0;

    canvas.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();
    });

    canvas.addEventListener("pointerup", (e) => {
      if (!pointerDownPos) return;
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      const dist = Math.hypot(dx, dy);
      const dt = Date.now() - pointerDownTime;
      pointerDownPos = null;

      // Distinguish deliberate tap (< 14px, < 450ms) from drag/swipe
      if (dist > 14 || dt > 450) return;

      if (!this.modal.hidden) return;
      if (!this._started || !stage.opened) return;
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      let side = stage.raycastBanner(ndcX, ndcY);
      // fallback: pick nearest banner by screen X/Y if raycast misses thin silk
      if (stage.opened && !side && stage.banners.length) {
        let best = null;
        let bestDist = window.innerWidth < 768 ? 0.28 : 0.18;
        for (const b of stage.banners) {
          const v = new (b.position.constructor)(0, -1.0, 0).applyMatrix4(b.matrixWorld);
          v.project(stage.camera);
          const d = Math.hypot(v.x - ndcX, (v.y - ndcY) * 0.4);
          if (d < bestDist) {
            bestDist = d;
            best = b.userData.side;
          }
        }
        side = best;
      }
      if (side) {
        this.openRiddle(side);
        const target = stage.banners.find((b) => b.userData.side === side);
        if (target) {
          g.fromTo(
            target.scale,
            { x: 1, y: 1 },
            { x: 1.05, y: 1.05, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" }
          );
        }
      } else if (stage.raycastGoddess?.(ndcX, ndcY)) {
        this.onGoddessClick?.(stage.getGoddessScreenPos?.());
      } else {
        stage.burstAtScreen?.(e.clientX, e.clientY);
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!stage.opened) return;
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      let side = stage.raycastBanner(ndcX, ndcY);
      if (!side && stage.banners.length) {
        for (const b of stage.banners) {
          const v = new (b.position.constructor)(0, -1.44, 0).applyMatrix4(b.matrixWorld);
          v.project(stage.camera);
          if (Math.hypot(v.x - ndcX, (v.y - ndcY) * 0.4) < 0.16) {
            side = b.userData.side;
            break;
          }
        }
      }
      const isGoddess = stage.raycastGoddess?.(ndcX, ndcY);
      canvas.style.cursor = (side || isGoddess) ? "pointer" : "default";
    });
  }
}

export { RIDDLES };
