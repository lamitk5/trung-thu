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
 * Realistic Firework Aerial Burst Sound ("Tiếng pháo hoa nổ ĐÙNG... rào rào ngoài đời thực")
 * Multi-layer acoustic synthesis:
 * 1. Deep Sub-bass Shockwave (ĐÙNG!! - 140Hz -> 32Hz heavy exponential drop + punchy transient)
 * 2. Gunpowder Noise Blast (Khùng... - Swept bandpass/lowpass filtered noise)
 * 3. Distance Atmosphere Rumble (Âm rền bầu trời đêm)
 * 4. Micro Sparks Crackle / Sizzle Tail (Tiếng rào rào, tí tách tia lửa)
 */
export function playFireworkExplosion(options = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options.volume || 1.0) * 0.95;

  const master = ctx.createGain();
  master.gain.setValueAtTime(vol, now);
  master.connect(ctx.destination);

  // ── 1. The Deep Shockwave Boom ("ĐÙNG!!") ──
  const boom = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boom.type = "sine";
  const startFreq = 135 + Math.random() * 30; // 135 - 165 Hz
  const endFreq = 28 + Math.random() * 8;     // 28 - 36 Hz
  boom.frequency.setValueAtTime(startFreq, now);
  boom.frequency.exponentialRampToValueAtTime(endFreq, now + 0.36);

  boomGain.gain.setValueAtTime(0.001, now);
  boomGain.gain.linearRampToValueAtTime(0.9, now + 0.006);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);

  boom.connect(boomGain);
  boomGain.connect(master);
  boom.start(now);
  boom.stop(now + 0.85);

  // ── 2. The Explosive Gunpowder Blast ("KHÙNG...") ──
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

  // ── 3. Atmospheric Night Sky Rumble Tail (Âm rền lan tỏa) ──
  const rumble = ctx.createOscillator();
  const rumbleGain = ctx.createGain();
  rumble.type = "triangle";
  rumble.frequency.setValueAtTime(58, now);
  rumble.frequency.exponentialRampToValueAtTime(24, now + 1.3);

  rumbleGain.gain.setValueAtTime(0.001, now);
  rumbleGain.gain.linearRampToValueAtTime(0.38, now + 0.05);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

  rumble.connect(rumbleGain);
  rumbleGain.connect(master);
  rumble.start(now + 0.02);
  rumble.stop(now + 1.45);

  // ── 4. Sizzling Star Crackles ("Rào rào... tí tách") ──
  const numCrackles = 6 + Math.floor(Math.random() * 6);
  for (let j = 0; j < numCrackles; j++) {
    const crackleTime = now + 0.14 + Math.random() * 0.55;
    const crackLen = Math.floor(ctx.sampleRate * 0.035);
    const cBuffer = ctx.createBuffer(1, crackLen, ctx.sampleRate);
    const cData = cBuffer.getChannelData(0);
    for (let k = 0; k < crackLen; k++) {
      cData[k] = (Math.random() * 2 - 1) * Math.exp(-k / (ctx.sampleRate * 0.007));
    }
    const cSource = ctx.createBufferSource();
    cSource.buffer = cBuffer;

    const cFilter = ctx.createBiquadFilter();
    cFilter.type = "bandpass";
    cFilter.frequency.setValueAtTime(1600 + Math.random() * 2400, crackleTime);
    cFilter.Q.value = 3.2;

    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.18 + Math.random() * 0.14, crackleTime);
    cGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.035);

    cSource.connect(cFilter);
    cFilter.connect(cGain);
    cGain.connect(master);
    cSource.start(crackleTime);
  }
}

/**
 * Pre-launch rocket whistle / whoosh ("Tiếng rít viuuuuu... phóng lên trời")
 */
export function playRocketWhistle() {
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

