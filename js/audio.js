/**
 * Procedural Web Audio Synthesizer for Fairy Magic Chimes & Sparkles
 * Zero external audio files, zero latency, 100% self-contained.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ── Authentic Recorded Firework Audio Buffers ─────────────────────────────────
const audioBuffers = {};
const AUDIO_SOURCES = {
  burst1: './assets/audio/burst1.mp3',
  burst2: './assets/audio/burst2.mp3',
  burstSm: './assets/audio/burst-sm-1.mp3',
  crackle: './assets/audio/crackle1.mp3',
  lift1: './assets/audio/lift1.mp3',
  lift2: './assets/audio/lift2.mp3',
  lift3: './assets/audio/lift3.mp3',
};

let preloaded = false;
export function preloadFireworkSounds() {
  const ctx = getAudioContext();
  if (!ctx || preloaded) return;
  preloaded = true;

  for (const [name, url] of Object.entries(AUDIO_SOURCES)) {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        audioBuffers[name] = decoded;
      })
      .catch((err) => {
        console.warn(`[Audio] Notice: loading ${name}:`, err.message);
      });
  }
}

// Unmute & Preload instantly on first user gesture
if (typeof window !== 'undefined') {
  const onUserGesture = () => {
    getAudioContext();
    preloadFireworkSounds();
    window.removeEventListener('pointerdown', onUserGesture);
    window.removeEventListener('touchstart', onUserGesture);
    window.removeEventListener('keydown', onUserGesture);
  };
  window.addEventListener('pointerdown', onUserGesture, { passive: true });
  window.addEventListener('touchstart', onUserGesture, { passive: true });
  window.addEventListener('keydown', onUserGesture, { passive: true });
}

function playBuffer(buffer, { volume = 1.0, playbackRate = 1.0 } = {}) {
  const ctx = getAudioContext();
  if (!ctx || !buffer) return false;

  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const gainNode = ctx.createGain();
    gainNode.gain.value = Math.max(0, Math.min(2.0, volume));

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Play a cascading crystal chime arpeggio (fairy magic chime)
 */
export function playFairyChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Celestial pentatonic scale (C6, E6, G6, A6, C7, E7, G7, C8)
  const notes = [1046.5, 1318.51, 1567.98, 1760.0, 2093.0, 2637.02, 3135.96, 4186.01];

  notes.forEach((freq, index) => {
    const noteTime = now + index * 0.045; // Rapid cascading arpeggio
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator(); // Inharmonic bell chime partial
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, noteTime);

    // Chime overtone (metallic crystal bell harmonic)
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, noteTime);

    // Gain envelope: instant attack, graceful bell decay
    gainNode.gain.setValueAtTime(0.0001, noteTime);
    gainNode.gain.exponentialRampToValueAtTime(0.22 / (index * 0.15 + 1), noteTime + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.95 + index * 0.05);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(noteTime);
    osc2.start(noteTime);
    osc1.stop(noteTime + 1.1);
    osc2.stop(noteTime + 1.1);
  });
}

/**
 * Play a gentle stardust pop / bubble sound when clicking on a wish tag
 */
export function playWishPop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Ancient wood/stone gate drum roll + deep thud (opening cue)
 */
export function playGateDrum() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Deep wooden thud
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.type = "sine";
  thud.frequency.setValueAtTime(90, now);
  thud.frequency.exponentialRampToValueAtTime(38, now + 0.35);
  thudGain.gain.setValueAtTime(0.0001, now);
  thudGain.gain.exponentialRampToValueAtTime(0.32, now + 0.015);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.start(now);
  thud.stop(now + 0.6);

  // Body / click transient
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "triangle";
  click.frequency.setValueAtTime(220, now);
  click.frequency.exponentialRampToValueAtTime(80, now + 0.08);
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start(now);
  click.stop(now + 0.2);

  // Soft festival drum roll (3 hits)
  for (let i = 1; i <= 3; i++) {
    const t = now + 0.12 * i;
    const d = ctx.createOscillator();
    const dg = ctx.createGain();
    d.type = "sine";
    d.frequency.setValueAtTime(70 - i * 6, t);
    d.frequency.exponentialRampToValueAtTime(32, t + 0.22);
    dg.gain.setValueAtTime(0.0001, t);
    dg.gain.exponentialRampToValueAtTime(0.14 / i, t + 0.01);
    dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    d.connect(dg);
    dg.connect(ctx.destination);
    d.start(t);
    d.stop(t + 0.35);
  }
}

/**
 * Antique wooden latch click + deep gate thud (opening cue)
 */
export function playWoodLatch() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Sharp wood click (latch release)
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();
  click.type = "square";
  click.frequency.setValueAtTime(180, now);
  click.frequency.exponentialRampToValueAtTime(60, now + 0.06);
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = 900;
  clickFilter.Q.value = 2.5;
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  click.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start(now);
  click.stop(now + 0.15);

  // Deep wooden body thud
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.type = "sine";
  thud.frequency.setValueAtTime(95, now);
  thud.frequency.exponentialRampToValueAtTime(36, now + 0.38);
  thudGain.gain.setValueAtTime(0.0001, now);
  thudGain.gain.exponentialRampToValueAtTime(0.3, now + 0.015);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.start(now + 0.02);
  thud.stop(now + 0.65);

  // Soft festival drum hits
  for (let i = 1; i <= 3; i++) {
    const t = now + 0.14 * i;
    const d = ctx.createOscillator();
    const dg = ctx.createGain();
    d.type = "sine";
    d.frequency.setValueAtTime(68 - i * 5, t);
    d.frequency.exponentialRampToValueAtTime(30, t + 0.25);
    dg.gain.setValueAtTime(0.0001, t);
    dg.gain.exponentialRampToValueAtTime(0.12 / i, t + 0.01);
    dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    d.connect(dg);
    dg.connect(ctx.destination);
    d.start(t);
    d.stop(t + 0.38);
  }
}

/**
 * Realistic Firework Aerial Burst Sound (Real Recorded Audio)
 * Randomizes between authentic explosion recordings (burst1, burst2, burstSm)
 * with organic pitch variation and real sizzling star crackles.
 */
export function playFireworkExplosion(options = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  preloadFireworkSounds();
  const vol = (options.volume || 1.0) * 0.95;

  const bursts = ['burst1', 'burst2', 'burstSm'];
  const name = bursts[Math.floor(Math.random() * bursts.length)];
  const buffer = audioBuffers[name];

  const rate = 0.94 + Math.random() * 0.12; // 0.94 - 1.06 pitch variance for organic feel
  const played = playBuffer(buffer, { volume: vol, playbackRate: rate });

  // Add authentic sizzling crackle tail (70% chance)
  if (Math.random() < 0.70 && audioBuffers.crackle) {
    setTimeout(() => {
      playBuffer(audioBuffers.crackle, {
        volume: vol * 0.65,
        playbackRate: 0.96 + Math.random() * 0.08,
      });
    }, 240 + Math.random() * 120);
  }

  // Graceful fallback to procedural synthesis if file is still downloading
  if (!played) {
    playProceduralFireworkExplosion(options);
  }
}

/**
 * Pre-launch rocket whistle / whoosh (Real Recorded Audio)
 * Randomizes between real rocket lift recordings (lift1, lift2, lift3).
 */
export function playRocketWhistle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  preloadFireworkSounds();

  const lifts = ['lift1', 'lift2', 'lift3'];
  const name = lifts[Math.floor(Math.random() * lifts.length)];
  const buffer = audioBuffers[name];

  const rate = 0.95 + Math.random() * 0.10;
  const played = playBuffer(buffer, { volume: 0.8, playbackRate: rate });

  if (!played) {
    playProceduralRocketWhistle();
  }
}

// ── Fallback Procedural Audio Synthesizers (Offline / Zero-latency) ─────────────
function playProceduralFireworkExplosion(options = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options.volume || 1.0) * 0.95;

  const master = ctx.createGain();
  master.gain.setValueAtTime(vol, now);
  master.connect(ctx.destination);

  // 1. The Deep Shockwave Boom
  const boom = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boom.type = "sine";
  const startFreq = 135 + Math.random() * 30;
  const endFreq = 28 + Math.random() * 8;
  boom.frequency.setValueAtTime(startFreq, now);
  boom.frequency.exponentialRampToValueAtTime(endFreq, now + 0.36);

  boomGain.gain.setValueAtTime(0.001, now);
  boomGain.gain.linearRampToValueAtTime(0.9, now + 0.006);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);

  boom.connect(boomGain);
  boomGain.connect(master);
  boom.start(now);
  boom.stop(now + 0.85);

  // 2. Gunpowder Blast
  const bufferLen = Math.floor(ctx.sampleRate * 0.55);
  const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(950 + Math.random() * 300, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(130, now + 0.45);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.001, now);
  noiseGain.gain.linearRampToValueAtTime(0.75, now + 0.01);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
}

function playProceduralRocketWhistle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
  osc.frequency.exponentialRampToValueAtTime(1100 + Math.random() * 300, now + 0.55);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.exponentialRampToValueAtTime(1400, now + 0.55);
  filter.Q.value = 4.5;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.60);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.62);
}

