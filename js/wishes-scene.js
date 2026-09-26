/**
 * Wishes & Fireworks Scene — Màn Mưa Lời Chúc & Pháo Hoa Hội Trăng
 * Full-screen celebratory view triggered by clicking Chị Hằng or "Đón Nhận Lời Chúc".
 * Self-contained: builds its own DOM, manages animation loops, cleans up on exit.
 */

import { playFireworkExplosion, playRocketWhistle, playFireworkBarrage } from "./audio.js?v=6";

// ── Wish pool ──────────────────────────────────────────────────────────────────
const WISHES = [
  "Chúc bạn mùa trăng ngập tràn hạnh phúc! 🌕💖",
  "Tương lai xán lạn như dải ngân hà ✨",
  "Tròn vẹn yêu thương, vạn sự hanh thông 🥮",
  "Gia đình sum vầy, an yên hạnh phúc 🌸",
  "Nguyện ước đêm rằm đều thành hiện thực 🌙",
  "Tâm an vạn sự an, đời đời vui vẻ 💫",
  "Nụ cười rạng rỡ như ánh trăng tròn 🏮",
  "Gửi ngàn vì sao mang điều ước đến bạn 🌟",
  "Đoàn viên ấm áp bên người thân yêu 🥮❤️",
  "Bình an như ý, vạn dặm bình yên 🏮✨",
  "Ánh trăng soi đường muôn nẻo thành công 🌕🚀",
  "Gặp nhiều may mắn, phú quý an khang 💰🌸",
  "Thanh xuân tươi đẹp, hạnh phúc đong đầy 🌺💖",
  "Đêm hội trăng rằm rộn rã tiếng cười 🐰🎶",
  "Mỗi ngày đều ngọt ngào như bánh dẻo 🥮🍯",
  "Trăng tròn người trọn, vẹn tròn ước mơ 🌕💫",
  "Tài lộc tấn tới, phúc khí dồi dào 🏮💰",
  "Sức khỏe dồi dào, thảnh thơi an lạc 🌸🌿",
  "Vui tết Trung Thu, rộn ràng trống lân 🥁🏮",
  "Mọi điều mong ước đều hóa thành hoa 🌸✨",
  "Trăng sáng soi sáng triệu điều ước mơ 🌟💫",
  "Thắp sáng niềm tin, vững bước tương lai 🏮🌕",
  "Ngọt ngào sum họp, trọn vẹn yêu thương 💖🌸",
  "Vui hội trăng rằm cùng Chị Hằng & Chú Cuội 🐰🌙",
  "Phú quý vinh hoa, cát tường như ý 🍀💖",
  "Trăm năm hạnh phúc, vạn đời bình an 🌕🌸",
];

// Firework color palettes
const FW_PALETTES = [
  ['#ffd700', '#ffec6e', '#fff4b8'],   // Imperial Gold
  ['#ff4757', '#ff6b81', '#ff9ca8'],   // Crimson Red
  ['#2ed573', '#7bed9f', '#a8e6b3'],   // Jade Cyan
  ['#a55eea', '#cc99ff', '#e0c5ff'],   // Neon Purple
  ['#ff9f43', '#ffd076', '#ffe8b8'],   // Sunset Orange
  ['#54a0ff', '#74b9ff', '#a8d0ff'],   // Celestial Blue
];

// ── Main class ─────────────────────────────────────────────────────────────────
export class WishesScene {
  constructor(options = {}) {
    this.options     = options;
    this.view        = null;   // The full-screen overlay element
    this.canvas      = null;   // Fireworks canvas
    this.ctx         = null;
    this.visible     = false;
    this.rafId       = null;
    this.autoFwTimer = null;

    // Wish rain state
    this.pills       = [];     // live wish pill elements + physics
    this.pillRafId   = null;

    // Fireworks state
    this.rockets     = [];
    this.bursts      = [];

    // Sound
    this.soundOn     = true;
    this._audioCtx   = null;

    this._buildDOM();
    this._attachEvents();
  }

  // ── DOM Construction ─────────────────────────────────────────────────────────
  _buildDOM() {
    this.view = document.createElement('div');
    this.view.id = 'wishes-galaxy-view';
    this.view.className = 'wgv';
    this.view.setAttribute('aria-modal', 'true');
    this.view.setAttribute('role', 'dialog');
    this.view.hidden = true;
    this.view.style.display = 'none';

    this.view.innerHTML = `
      <!-- ── Celestial background layers ── -->
      <div class="wgv-bg">
        <div class="wgv-moon"></div>
        <div class="wgv-nebula wgv-nebula1"></div>
        <div class="wgv-nebula wgv-nebula2"></div>
        <div class="wgv-stars"></div>
      </div>

      <!-- ── Fireworks canvas (behind content) ── -->
      <canvas class="wgv-fw-canvas" id="wgv-fw-canvas"></canvas>

      <!-- ── Wish rain container ── -->
      <div class="wgv-rain" id="wgv-rain"></div>

      <!-- ── Drifting Sky Lanterns in background (Thiên Đăng Thả Trời) ── -->
      <div class="wgv-sky-lanterns">
        <div class="wgv-sky-lantern wgv-sl-1" style="left: 12%; animation-delay: 0s; animation-duration: 16s;"><div class="wgv-sl-flame"></div></div>
        <div class="wgv-sky-lantern wgv-sl-2" style="left: 28%; animation-delay: -5s; animation-duration: 20s;"><div class="wgv-sl-flame"></div></div>
        <div class="wgv-sky-lantern wgv-sl-3" style="left: 45%; animation-delay: -11s; animation-duration: 18s;"><div class="wgv-sl-flame"></div></div>
        <div class="wgv-sky-lantern wgv-sl-4" style="left: 68%; animation-delay: -3s; animation-duration: 22s;"><div class="wgv-sl-flame"></div></div>
        <div class="wgv-sky-lantern wgv-sl-5" style="left: 82%; animation-delay: -8s; animation-duration: 17s;"><div class="wgv-sl-flame"></div></div>
        <div class="wgv-sky-lantern wgv-sl-6" style="left: 92%; animation-delay: -14s; animation-duration: 19s;"><div class="wgv-sl-flame"></div></div>
      </div>

      <!-- ── Hanging Decorative Mid-Autumn Lanterns Arch (Dàn Lồng Đèn Hội Trăng) ── -->
      <!-- 1. Left Outer: Red Palace -->
      <div class="wgv-lantern-hang wgv-hang-1">
        <div class="wgv-cord" style="height: 38px;"></div>
        <div class="wgv-lantern wgv-lantern-red" title="Lồng đèn cung đình">
          <svg viewBox="0 0 100 160" class="wgv-lantern-svg">
            <defs>
              <radialGradient id="lRedG" cx="45%" cy="40%" r="55%">
                <stop offset="0%" stop-color="#fff1c4"/>
                <stop offset="35%" stop-color="#f53b57"/>
                <stop offset="75%" stop-color="#c0152b"/>
                <stop offset="100%" stop-color="#6b0512"/>
              </radialGradient>
            </defs>
            <rect x="35" y="10" width="30" height="10" rx="3" fill="#e8b84b" stroke="#fff" stroke-width="0.8"/>
            <circle cx="50" cy="10" r="5" fill="none" stroke="#e8b84b" stroke-width="2"/>
            <ellipse cx="50" cy="65" rx="42" ry="46" fill="url(#lRedG)"/>
            <path d="M50,19 C25,25 25,105 50,111" fill="none" stroke="#e8b84b" stroke-width="1.8" opacity="0.85"/>
            <path d="M50,19 C75,25 75,105 50,111" fill="none" stroke="#e8b84b" stroke-width="1.8" opacity="0.85"/>
            <line x1="50" y1="19" x2="50" y2="111" stroke="#e8b84b" stroke-width="1.5" opacity="0.75"/>
            <ellipse cx="50" cy="65" rx="42" ry="46" fill="none" stroke="#ffd700" stroke-width="2"/>
            <rect x="35" y="108" width="30" height="9" rx="2" fill="#e8b84b" stroke="#fff" stroke-width="0.8"/>
            <circle cx="50" cy="122" r="4" fill="#ffd700"/>
            <line x1="50" y1="117" x2="50" y2="122" stroke="#e8b84b" stroke-width="2"/>
            <path d="M46,126 L42,156 M48,126 L47,158 M50,126 L50,160 M52,126 L53,158 M54,126 L58,156" stroke="#f53b57" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 2. Left Mid-Outer: Bunny -->
      <div class="wgv-lantern-hang wgv-hang-2">
        <div class="wgv-cord" style="height: 85px;"></div>
        <div class="wgv-lantern wgv-lantern-rabbit" title="Lồng đèn thỏ ngọc">
          <svg viewBox="0 0 100 170" class="wgv-lantern-svg">
            <defs>
              <radialGradient id="lRabG" cx="45%" cy="45%" r="60%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="40%" stop-color="#ffe6eb"/>
                <stop offset="80%" stop-color="#ffb8c6"/>
                <stop offset="100%" stop-color="#f57b93"/>
              </radialGradient>
            </defs>
            <ellipse cx="38" cy="24" rx="8" ry="20" transform="rotate(-10 38 24)" fill="#fff0f3" stroke="#e8b84b" stroke-width="1.5"/>
            <ellipse cx="38" cy="24" rx="4" ry="14" transform="rotate(-10 38 24)" fill="#ff99aa"/>
            <ellipse cx="62" cy="24" rx="8" ry="20" transform="rotate(10 62 24)" fill="#fff0f3" stroke="#e8b84b" stroke-width="1.5"/>
            <ellipse cx="62" cy="24" rx="4" ry="14" transform="rotate(10 62 24)" fill="#ff99aa"/>
            <circle cx="50" cy="38" r="4" fill="none" stroke="#e8b84b" stroke-width="2"/>
            <ellipse cx="50" cy="80" rx="38" ry="42" fill="url(#lRabG)" stroke="#e8b84b" stroke-width="2"/>
            <circle cx="40" cy="74" r="3.5" fill="#2d1318"/>
            <circle cx="41" cy="72.5" r="1.2" fill="#fff"/>
            <circle cx="60" cy="74" r="3.5" fill="#2d1318"/>
            <circle cx="61" cy="72.5" r="1.2" fill="#fff"/>
            <ellipse cx="50" cy="81" rx="3.5" ry="2.5" fill="#ff5e7e"/>
            <path d="M47,84 Q50,87 53,84" fill="none" stroke="#681b2a" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="33" cy="80" r="5" fill="#ff4d79" opacity="0.35"/>
            <circle cx="67" cy="80" r="5" fill="#ff4d79" opacity="0.35"/>
            <circle cx="50" cy="122" r="7" fill="#fff" stroke="#e8b84b" stroke-width="1.2"/>
            <circle cx="50" cy="133" r="3" fill="#ffd700"/>
            <path d="M47,136 L43,162 M50,136 L50,166 M53,136 L57,162" stroke="#e8b84b" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 3. Left Mid-Inner: Lotus Lantern -->
      <div class="wgv-lantern-hang wgv-hang-3">
        <div class="wgv-cord" style="height: 48px;"></div>
        <div class="wgv-lantern wgv-lantern-lotus" title="Đèn hoa sen">
          <svg viewBox="0 0 100 160" class="wgv-lantern-svg">
            <defs>
              <radialGradient id="lLotG" cx="50%" cy="55%" r="60%">
                <stop offset="0%" stop-color="#fff8db"/>
                <stop offset="35%" stop-color="#fbc531"/>
                <stop offset="80%" stop-color="#e17055"/>
                <stop offset="100%" stop-color="#c23616"/>
              </radialGradient>
            </defs>
            <rect x="36" y="14" width="28" height="8" rx="2" fill="#ffd700"/>
            <circle cx="50" cy="14" r="4" fill="none" stroke="#ffd700" stroke-width="2"/>
            <ellipse cx="50" cy="68" rx="40" ry="44" fill="url(#lLotG)"/>
            <path d="M50,24 C28,35 18,85 50,112 C82,85 72,35 50,24 Z" fill="none" stroke="#ffd700" stroke-width="2"/>
            <circle cx="50" cy="68" r="16" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
            <ellipse cx="50" cy="68" rx="40" ry="44" fill="none" stroke="#ffd700" stroke-width="2"/>
            <rect x="36" y="112" width="28" height="8" rx="2" fill="#ffd700"/>
            <circle cx="50" cy="124" r="3.5" fill="#ffd700"/>
            <path d="M46,128 L42,158 M50,128 L50,162 M54,128 L58,158" stroke="#fbc531" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 4. Left Inner: Star Lantern -->
      <div class="wgv-lantern-hang wgv-hang-4">
        <div class="wgv-cord" style="height: 102px;"></div>
        <div class="wgv-lantern wgv-lantern-star" title="Đèn ông sao">
          <svg viewBox="0 0 100 170" class="wgv-lantern-svg">
            <defs>
              <radialGradient id="lStarG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff8d6"/>
                <stop offset="45%" stop-color="#ff9900"/>
                <stop offset="100%" stop-color="#d63031"/>
              </radialGradient>
            </defs>
            <circle cx="50" cy="68" r="32" fill="none" stroke="#e8b84b" stroke-width="2.5" stroke-dasharray="4 2"/>
            <polygon points="50,22 59,52 90,52 65,70 75,100 50,82 25,100 35,70 10,52 41,52"
                     fill="url(#lStarG)" stroke="#ffd700" stroke-width="2.5"/>
            <circle cx="50" cy="64" r="10" fill="#fff" opacity="0.85"/>
            <circle cx="50" cy="64" r="5" fill="#ff4757"/>
            <line x1="50" y1="100" x2="50" y2="135" stroke="#e8b84b" stroke-width="3" stroke-linecap="round"/>
            <path d="M44,135 Q40,150 42,165" fill="none" stroke="#ff4757" stroke-width="2"/>
            <path d="M50,135 Q50,152 48,168" fill="none" stroke="#ffd700" stroke-width="2"/>
            <path d="M56,135 Q60,150 58,165" fill="none" stroke="#2ed573" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- 5. Right Inner: Star Lantern -->
      <div class="wgv-lantern-hang wgv-hang-5">
        <div class="wgv-cord" style="height: 102px;"></div>
        <div class="wgv-lantern wgv-lantern-star" title="Đèn ông sao">
          <svg viewBox="0 0 100 170" class="wgv-lantern-svg">
            <circle cx="50" cy="68" r="32" fill="none" stroke="#e8b84b" stroke-width="2.5" stroke-dasharray="4 2"/>
            <polygon points="50,22 59,52 90,52 65,70 75,100 50,82 25,100 35,70 10,52 41,52"
                     fill="url(#lStarG)" stroke="#ffd700" stroke-width="2.5"/>
            <circle cx="50" cy="64" r="10" fill="#fff" opacity="0.85"/>
            <circle cx="50" cy="64" r="5" fill="#ff4757"/>
            <line x1="50" y1="100" x2="50" y2="135" stroke="#e8b84b" stroke-width="3" stroke-linecap="round"/>
            <path d="M44,135 Q40,150 42,165" fill="none" stroke="#ff4757" stroke-width="2"/>
            <path d="M50,135 Q50,152 48,168" fill="none" stroke="#ffd700" stroke-width="2"/>
            <path d="M56,135 Q60,150 58,165" fill="none" stroke="#2ed573" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- 6. Right Mid-Inner: Lotus Lantern -->
      <div class="wgv-lantern-hang wgv-hang-6">
        <div class="wgv-cord" style="height: 48px;"></div>
        <div class="wgv-lantern wgv-lantern-lotus" title="Đèn hoa sen">
          <svg viewBox="0 0 100 160" class="wgv-lantern-svg">
            <rect x="36" y="14" width="28" height="8" rx="2" fill="#ffd700"/>
            <circle cx="50" cy="14" r="4" fill="none" stroke="#ffd700" stroke-width="2"/>
            <ellipse cx="50" cy="68" rx="40" ry="44" fill="url(#lLotG)"/>
            <path d="M50,24 C28,35 18,85 50,112 C82,85 72,35 50,24 Z" fill="none" stroke="#ffd700" stroke-width="2"/>
            <circle cx="50" cy="68" r="16" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
            <ellipse cx="50" cy="68" rx="40" ry="44" fill="none" stroke="#ffd700" stroke-width="2"/>
            <rect x="36" y="112" width="28" height="8" rx="2" fill="#ffd700"/>
            <circle cx="50" cy="124" r="3.5" fill="#ffd700"/>
            <path d="M46,128 L42,158 M50,128 L50,162 M54,128 L58,158" stroke="#fbc531" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 7. Right Mid-Outer: Bunny -->
      <div class="wgv-lantern-hang wgv-hang-7">
        <div class="wgv-cord" style="height: 85px;"></div>
        <div class="wgv-lantern wgv-lantern-rabbit" title="Lồng đèn thỏ ngọc">
          <svg viewBox="0 0 100 170" class="wgv-lantern-svg">
            <ellipse cx="38" cy="24" rx="8" ry="20" transform="rotate(-10 38 24)" fill="#fff0f3" stroke="#e8b84b" stroke-width="1.5"/>
            <ellipse cx="38" cy="24" rx="4" ry="14" transform="rotate(-10 38 24)" fill="#ff99aa"/>
            <ellipse cx="62" cy="24" rx="8" ry="20" transform="rotate(10 62 24)" fill="#fff0f3" stroke="#e8b84b" stroke-width="1.5"/>
            <ellipse cx="62" cy="24" rx="4" ry="14" transform="rotate(10 62 24)" fill="#ff99aa"/>
            <circle cx="50" cy="38" r="4" fill="none" stroke="#e8b84b" stroke-width="2"/>
            <ellipse cx="50" cy="80" rx="38" ry="42" fill="url(#lRabG)" stroke="#e8b84b" stroke-width="2"/>
            <circle cx="40" cy="74" r="3.5" fill="#2d1318"/>
            <circle cx="41" cy="72.5" r="1.2" fill="#fff"/>
            <circle cx="60" cy="74" r="3.5" fill="#2d1318"/>
            <circle cx="61" cy="72.5" r="1.2" fill="#fff"/>
            <ellipse cx="50" cy="81" rx="3.5" ry="2.5" fill="#ff5e7e"/>
            <path d="M47,84 Q50,87 53,84" fill="none" stroke="#681b2a" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="33" cy="80" r="5" fill="#ff4d79" opacity="0.35"/>
            <circle cx="67" cy="80" r="5" fill="#ff4d79" opacity="0.35"/>
            <circle cx="50" cy="122" r="7" fill="#fff" stroke="#e8b84b" stroke-width="1.2"/>
            <circle cx="50" cy="133" r="3" fill="#ffd700"/>
            <path d="M47,136 L43,162 M50,136 L50,166 M53,136 L57,162" stroke="#e8b84b" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 8. Right Outer: Red Palace -->
      <div class="wgv-lantern-hang wgv-hang-8">
        <div class="wgv-cord" style="height: 38px;"></div>
        <div class="wgv-lantern wgv-lantern-red" title="Lồng đèn cung đình">
          <svg viewBox="0 0 100 160" class="wgv-lantern-svg">
            <rect x="35" y="10" width="30" height="10" rx="3" fill="#e8b84b" stroke="#fff" stroke-width="0.8"/>
            <circle cx="50" cy="10" r="5" fill="none" stroke="#e8b84b" stroke-width="2"/>
            <ellipse cx="50" cy="65" rx="42" ry="46" fill="url(#lRedG)"/>
            <path d="M50,19 C25,25 25,105 50,111" fill="none" stroke="#e8b84b" stroke-width="1.8" opacity="0.85"/>
            <path d="M50,19 C75,25 75,105 50,111" fill="none" stroke="#e8b84b" stroke-width="1.8" opacity="0.85"/>
            <line x1="50" y1="19" x2="50" y2="111" stroke="#e8b84b" stroke-width="1.5" opacity="0.75"/>
            <ellipse cx="50" cy="65" rx="42" ry="46" fill="none" stroke="#ffd700" stroke-width="2"/>
            <rect x="35" y="108" width="30" height="9" rx="2" fill="#e8b84b" stroke="#fff" stroke-width="0.8"/>
            <circle cx="50" cy="122" r="4" fill="#ffd700"/>
            <line x1="50" y1="117" x2="50" y2="122" stroke="#e8b84b" stroke-width="2"/>
            <path d="M46,126 L42,156 M48,126 L47,158 M50,126 L50,160 M52,126 L53,158 M54,126 L58,156" stroke="#f53b57" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>


      <!-- ── Celebration card ── -->
      <div class="wgv-card" id="wgv-card">
        <div class="wgv-card-corners">
          <span class="wgv-corner wgv-corner-tl"></span>
          <span class="wgv-corner wgv-corner-tr"></span>
          <span class="wgv-corner wgv-corner-bl"></span>
          <span class="wgv-corner wgv-corner-br"></span>
        </div>

        <div class="wgv-rabbit-icon">🐰<span class="wgv-moon-flare">🌕</span></div>
        <p class="wgv-subtitle">ĐÊM HỘI TRĂNG RẰM · ĐOÀN VIÊN NHƯ Ý</p>
        <h2 class="wgv-title">🌕 CHÚC MỪNG TẾT TRUNG THU ✨</h2>

        <div class="wgv-divider"></div>

        <p class="wgv-message">
          Thân chúc bạn và gia đình một mùa Tết Trung Thu ấm áp, viên mãn,
          tràn ngập tiếng cười và vạn sự như ý bên ánh trăng rằm sáng trong!
        </p>

        <div class="wgv-tags">
          <span>🌸 Hạnh Phúc</span>
          <span>🏮 Bình An</span>
          <span>✨ May Mắn</span>
          <span>💫 Thành Công</span>
        </div>

        <!-- Action buttons -->
        <div class="wgv-actions">
          <button class="wgv-btn wgv-btn-fw" id="wgv-btn-fw">Bắn Pháo Hoa 🎆</button>
          <button class="wgv-btn wgv-btn-sound" id="wgv-btn-sound" title="Âm thanh">🔊</button>
        </div>
      </div>

      <!-- ── Back to stage button ── -->
      <button class="wgv-back-btn" id="wgv-back-btn" aria-label="Quay lại sân khấu">
        ↺ Quay lại Sân Khấu
      </button>
    `;

    document.getElementById('app').appendChild(this.view);

    this.canvas = this.view.querySelector('#wgv-fw-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this._resizeCanvas();

    // Seed stars in background
    this._seedStars();
  }

  _seedStars() {
    const starsEl = this.view.querySelector('.wgv-stars');
    const count = window.innerWidth < 768 ? 32 : 48;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'wgv-star';
      s.style.left   = Math.random() * 100 + '%';
      s.style.top    = Math.random() * 80 + '%';
      const sz = 1 + Math.random() * 2.5;
      s.style.width  = sz + 'px';
      s.style.height = sz + 'px';
      s.style.animationDelay    = -(Math.random() * 6) + 's';
      s.style.animationDuration = (2.5 + Math.random() * 3.5) + 's';
      starsEl.appendChild(s);
    }
  }

  _resizeCanvas() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // ── Events ────────────────────────────────────────────────────────────────────
  _attachEvents() {
    // Back button
    this.view.querySelector('#wgv-back-btn').addEventListener('click', () => this.hide());

    // Fireworks barrage button
    this.view.querySelector('#wgv-btn-fw').addEventListener('click', () => {
      if (this.soundOn) playFireworkBarrage({ volume: 0.9 });
      for (let i = 0; i < 7; i++) {
        setTimeout(() => this._launchRocket(
          0.12 + Math.random() * 0.76,
          0.16 + Math.random() * 0.40
        ), i * 90);
      }
    });


    // Sound toggle
    const soundBtn = this.view.querySelector('#wgv-btn-sound');
    soundBtn.addEventListener('click', () => {
      this.soundOn = !this.soundOn;
      soundBtn.textContent = this.soundOn ? '🔊' : '🔇';
    });

    // Tap anywhere on view (except buttons/pills) → instant firework
    this.view.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, .wgv-btn, .wgv-pill')) return;
      const rx = e.clientX / window.innerWidth;
      const ry = e.clientY / window.innerHeight;
      this._launchRocket(rx, Math.min(0.65, ry));
    });

    // Resize
    window.addEventListener('resize', () => {
      if (this.visible) this._resizeCanvas();
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) this.hide();
    });
  }

  // ── Show / Hide ───────────────────────────────────────────────────────────────
  show() {
    if (this.visible) return;
    this.visible = true;
    if (typeof this.options?.onOpen === 'function') {
      try { this.options.onOpen(); } catch (_) {}
    }
    this.view.hidden = false;
    this.view.classList.add('visible');
    this.view.style.display = 'flex';
    this.view.style.opacity = '0';

    // Slight delay for browser to paint
    requestAnimationFrame(() => {
      this.view.style.transition = 'opacity 0.65s ease';
      this.view.style.opacity    = '1';
    });

    // Card spring-in
    const card = this.view.querySelector('#wgv-card');
    if (window.gsap) {
      gsap.fromTo(card,
        { scale: 0.7, opacity: 0, y: 60 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.6)', delay: 0.3 }
      );
    }

    this._resizeCanvas();
    this._startWishRain();
    this._startFwLoop();
    this._scheduleAutoFw();
  }

  hide() {
    if (!this.visible) return;
    if (typeof this.options?.onClose === 'function') {
      try { this.options.onClose(); } catch (_) {}
    }
    this.view.style.transition = 'opacity 0.4s ease';
    this.view.style.opacity    = '0';
    setTimeout(() => {
      this.visible = false;
      this.view.hidden = true;
      this.view.classList.remove('visible');
      this.view.style.display = 'none';
      this._stopAll();
    }, 420);
  }

  _stopAll() {
    cancelAnimationFrame(this.rafId);
    cancelAnimationFrame(this.pillRafId);
    clearTimeout(this.autoFwTimer);
    this.rockets = [];
    this.bursts  = [];
    this.pills   = [];
    this.view.querySelector('#wgv-rain').innerHTML = '';
  }

  // ── Wish Rain ─────────────────────────────────────────────────────────────────
  _startWishRain() {
    const isMobile = window.innerWidth < 768;
    const count    = isMobile ? 5 : 8;
    const h        = window.innerHeight;

    // Instantly spawn and distribute wishes across the viewport (no waiting delay)
    for (let i = 0; i < count; i++) {
      const initialY = (i / count) * (h * 0.85) - 20;
      this._spawnSinglePill(null, false, initialY);
    }

    // Start physics loop
    const loop = (ts) => {
      if (!this.visible) return;
      this.pillRafId = requestAnimationFrame(loop);
      const t = ts * 0.001;
      const vh = window.innerHeight;

      for (const p of this.pills) {
        if (p.hovered) continue;
        p.y += p.speedY;
        p.x  = p.baseX + Math.sin(t * p.freq + p.phase) * p.sway;

        // Smooth fade-in at top and fade-out near bottom
        const topRatio = Math.max(0, Math.min(1, (p.y + 30) / 90));
        const botRatio = Math.max(0, Math.min(1, (vh + 20 - p.y) / 90));
        const opacity = Math.min(topRatio, botRatio) * 0.90;
        p.el.style.opacity = opacity;

        if (p.y > vh + 35) {
          // Recycle to top, pick a new wish text, reset speed
          p.y = -35 - Math.random() * 45;
          p.baseX = 25 + Math.random() * (window.innerWidth - 50);
          p.x = p.baseX;
          p.speedY = 1.7 + Math.random() * 1.5; // Fast cycle: stays on screen ~5-7s instead of 20s
          p.el.textContent = WISHES[Math.floor(Math.random() * WISHES.length)];
        }
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }
    };
    this.pillRafId = requestAnimationFrame(loop);
  }

  _spawnSinglePill(text, isUserWish, customY = null) {
    const rain = this.view.querySelector('#wgv-rain');
    if (!rain) return;

    const txt  = text || WISHES[Math.floor(Math.random() * WISHES.length)];
    const el   = document.createElement('div');
    el.className = 'wgv-pill' + (isUserWish ? ' wgv-pill-user' : '');
    el.textContent = txt;

    const startX = 30 + Math.random() * (window.innerWidth - 60);
    const startY = customY !== null ? customY : (-35 - Math.random() * 50);

    el.style.transform = `translate(${startX}px, ${startY}px)`;
    rain.appendChild(el);

    const p = {
      el,
      x: startX, y: startY,
      baseX: startX,
      speedY: isUserWish ? -1.8 : 1.7 + Math.random() * 1.5, // Fast drift (reduced screen presence time)
      freq:  0.5 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      sway:  16 + Math.random() * 20,
      hovered: false,
    };

    el.addEventListener('mouseenter', () => {
      p.hovered = true;
      el.classList.add('wgv-pill-hover');
    });
    el.addEventListener('mouseleave', () => {
      p.hovered = false;
      el.classList.remove('wgv-pill-hover');
    });

    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      p.hovered = !p.hovered;
      el.classList.toggle('wgv-pill-hover', p.hovered);
    }, { passive: false });

    this.pills.push(p);

    // For user wishes, fade out after 6s and remove
    if (isUserWish) {
      setTimeout(() => {
        el.style.transition = 'opacity 1s';
        el.style.opacity = '0';
        setTimeout(() => {
          el.remove();
          this.pills = this.pills.filter(x => x !== p);
        }, 1100);
      }, 6000);
    }
  }

  // ── Fireworks Canvas System ──────────────────────────────────────────────────
  _startFwLoop() {
    const loop = (ts) => {
      if (!this.visible) return;
      this.rafId = requestAnimationFrame(loop);
      const dt = 0.016;

      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(0,0,0,0.18)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = 'lighter';

      // Update rockets
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i];
        r.x  += r.vx;
        r.y  += r.vy;
        r.vy += 0.08;  // slight gravity pull on ascent
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 14) r.trail.shift();

        // Draw trail
        for (let j = 1; j < r.trail.length; j++) {
          const a = j / r.trail.length;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(255,200,80,${a * 0.7})`;
          this.ctx.lineWidth = a * 2.5;
          this.ctx.moveTo(r.trail[j-1].x, r.trail[j-1].y);
          this.ctx.lineTo(r.trail[j].x, r.trail[j].y);
          this.ctx.stroke();
        }

        // Burst at apex
        if (r.vy >= 0 || r.y < r.burstY) {
          this._burst(r.x, r.y, r.palette);
          if (this.soundOn) playFireworkExplosion({ volume: 0.95 });
          this.rockets.splice(i, 1);
        }
      }

      // Update burst particles
      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.life -= dt / b.maxLife;
        if (b.life <= 0) { this.bursts.splice(i, 1); continue; }

        b.x  += b.vx;
        b.y  += b.vy;
        b.vy += 0.055;   // gravity
        b.vx *= 0.985;
        b.vy *= 0.985;

        const a = Math.max(0, b.life);
        const size = b.size * (0.5 + a * 0.7);
        const col = b.color;
        const grd = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, size);
        grd.addColorStop(0, col.replace(')', `,${a})`).replace('rgb', 'rgba'));
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.beginPath();
        this.ctx.fillStyle = grd;
        this.ctx.arc(b.x, b.y, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Twinkle extra spark dot
        if (a > 0.3 && Math.random() < 0.15) {
          this.ctx.beginPath();
          this.ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
          this.ctx.arc(b.x + (Math.random()-0.5)*4, b.y + (Math.random()-0.5)*4, 1, 0, Math.PI*2);
          this.ctx.fill();
        }
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  _launchRocket(rx, ry) {
    if (this.soundOn) playRocketWhistle();
    const w = this.canvas.width;
    const h = this.canvas.height;
    const startX = w * (0.3 + Math.random() * 0.4);
    const startY = h * 0.98;
    const targetX = w * rx;
    const targetY = h * ry;

    const dist = Math.hypot(targetX - startX, targetY - startY);
    const speed = 10 + dist * 0.018;
    const angle = Math.atan2(targetY - startY, targetX - startX);

    this.rockets.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed * 0.6,
      vy: Math.sin(angle) * speed,
      burstY: targetY,
      trail: [],
      palette: FW_PALETTES[Math.floor(Math.random() * FW_PALETTES.length)],
    });
  }

  _burst(cx, cy, palette) {
    const isMobile = window.innerWidth < 768;
    const n = isMobile ? 42 : 70;
    const type = Math.random();   // 0-0.5 = circular, 0.5-0.8 = willow, 0.8-1 = glitter

    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + (Math.random()-0.5)*0.25;
      let speed;
      if (type < 0.5) {
        speed = 2.8 + Math.random() * 3.0;
      } else if (type < 0.8) {
        // Willow: stronger upward bias
        speed = 3.2 + Math.random() * 4.0;
      } else {
        speed = 1.2 + Math.random() * 5.5;
      }

      const col = palette[Math.floor(Math.random() * palette.length)];
      const hex2rgb = (h) => {
        const r = parseInt(h.slice(1,3),16);
        const g = parseInt(h.slice(3,5),16);
        const b = parseInt(h.slice(5,7),16);
        return `rgb(${r},${g},${b})`;
      };

      this.bursts.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type >= 0.5 ? 1.8 : 0),
        life: 1,
        maxLife: 1.4 + Math.random() * 0.9,
        size: 3.2 + Math.random() * 4.2,
        color: hex2rgb(col),
      });
    }
  }


  _scheduleAutoFw() {
    const schedule = () => {
      if (!this.visible) return;
      // Gentle pacing: 2.4s to 3.8s between firework bursts
      const delay = 2400 + Math.random() * 1400;
      this.autoFwTimer = setTimeout(() => {
        if (!this.visible) return;
        this._launchRocket(0.15 + Math.random() * 0.70, 0.20 + Math.random() * 0.35);
        schedule();
      }, delay);
    };

    // First gentle burst 800ms after opening
    this.autoFwTimer = setTimeout(() => {
      if (this.visible) {
        this._launchRocket(0.50, 0.26);
        schedule();
      }
    }, 800);
  }



  // ── Audio ─────────────────────────────────────────────────────────────────────
  _playPop() {
    if (!this.soundOn) return;
    playFireworkExplosion({ volume: 0.95 });
  }
}
