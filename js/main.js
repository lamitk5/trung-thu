import { PaperStage } from "./scene.js?v=17";
import { TheaterUI } from "./ui.js?v=15";
import { StardustPhoenix } from "./phoenix.js?v=11";
import { playFairyChime, playWoodLatch, playFireworkExplosion } from "./audio.js?v=5";
import { WishesScene } from "./wishes-scene.js?v=9";

const gsap = window.gsap;
if (!gsap) {
  console.error("GSAP failed to load");
}

const canvas = document.getElementById("stage");
const stage = new PaperStage(canvas);
stage.start();

// Initialize the Sparkling Celestial Phoenix flying in 3D orbit around Chị Hằng
const phoenix = new StardustPhoenix({
  stage,
  scene: stage.scene,
  camera: stage.camera,
  speed: 1.0,
});
stage.phoenix = phoenix;

// Initialize the full-screen Wishes & Fireworks Scene
const wishesScene = new WishesScene({
  onOpen: () => {
    stage.stop();
  },
  onClose: () => {
    stage.start();
  },
});

// Wire the "Đón Nhận Lời Chúc" button in old celebration modal to open wishesScene
const oldCelebClose = document.querySelector('.btn-celebration-close');
if (oldCelebClose) {
  oldCelebClose.addEventListener('click', () => {
    const oldModal = document.getElementById('celebration-modal');
    if (oldModal) { oldModal.classList.remove('visible'); oldModal.hidden = true; }
    wishesScene.show();
  });
}

const ui = new TheaterUI({
  onStart: () => {
    playWoodLatch();
    ui.playOpening(gsap);
    stage.introCamera(gsap);
    phoenix.triggerStardustBurst(60);

    gsap.delayedCall(2.3, () => stage.dropBanners(gsap));
    gsap.delayedCall(1.8, () => {
      for (let i = 0; i < 3; i++) {
        gsap.delayedCall(i * 0.35, () => {
          stage.fireworks.burst(
            (Math.random() - 0.5) * 8,
            1.5 + Math.random() * 2.5,
            -7
          );
          playFireworkExplosion({ volume: 0.75 });
          phoenix.triggerStardustBurst(35);
        });
      }
    });
  },
  onRiddleOpen: () => {
    gsap.to(stage.camera.position, {
      z: 7.4,
      duration: 0.8,
      ease: "power2.out",
    });
  },
  onRiddleClose: () => {
    gsap.to(stage.camera.position, {
      z: 8.2,
      duration: 0.8,
      ease: "power2.out",
    });
  },
  onGoddessClick: () => {
    playFairyChime();
    stage.triggerGoddessBloomFlash();
    phoenix.triggerStardustBurst(85);
    // Open the full-screen Wishes & Fireworks Scene
    wishesScene.show();
  },
});

ui.bindBannerClicks(stage, gsap);

// Pointer & Touch move: Parallax + Cursor feedback
window.addEventListener("pointermove", (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  stage.setMouse(nx, -ny);
});

// Single finger swipe for smooth 3D tilt / parallax on mobile
window.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const nx = (touch.clientX / window.innerWidth) * 2 - 1;
      const ny = (touch.clientY / window.innerHeight) * 2 - 1;
      stage.setMouse(nx, -ny);
    }
  },
  { passive: true }
);

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

// ── Background click → bắn pháo hoa lên trời đêm ──
window.addEventListener("pointerup", (e) => {
  if (!stage.opened) return;
  if (e.button !== 0) return;
  if (wishesScene.visible) return;        // wishes scene handles own clicks
  if (e.target && e.target !== canvas) return;

  const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);

  const hitGoddess = stage.raycastGoddess(ndcX, ndcY);
  const hitBanner  = stage.raycastBanner(ndcX, ndcY);
  if (hitGoddess || hitBanner) return;

  stage.fireAtNDC(ndcX, ndcY);
});

gsap.delayedCall(0.5, () => {
  stage.fireworks.burst(-2, 2, -8);
});

// Pause WebGL rendering when user switches tabs or browser is hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stage.stop();
  } else if (!wishesScene.visible) {
    stage.start();
  }
});

console.info("[Trung Thu] Paper stage, Phoenix & Wishes Scene ready ✨");
