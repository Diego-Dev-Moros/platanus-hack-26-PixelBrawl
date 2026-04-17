// Pixel Brawl - local 1v1 platform fighter

const W = 800, H = 600;
const GRAVITY = 980, SPEED = 220, JUMP = -420, LIVES = 3;
const ATK_CD = 280, DASH_CD = 900, FATIGUE_MS = 1000, INVULN_MS = 1200, EXHAUST_RECOVER = 35;
const BUFF_POWER_DUR = 10000, BUFF_SPEED_DUR = 10000, BUFF_REGEN_DUR = 8000;
const BASE_KB_X = 240, BASE_KB_Y = 155;
const DEATH_X = 80, DEATH_Y = 680;

const C = {
  bg: 0x08111f, grid: 0x1b3550, frame: 0x204e7b, plat: 0x25394f, edge: 0x5ccdf7,
  text: '#d7f3ff', dim: '#6a8ba5', p1: '#8affd2', p2: '#ff93ba',
};

const CHARS = [
  { id: 'pulse', name: 'PULSE', color: 0x00e5ff, accent: 0xffffff, line: 'Shockwave / area push', head: 0, sp: 2200, sd: 12 },
  { id: 'volt', name: 'VOLT', color: 0xffdd00, accent: 0xff7a00, line: 'Uppercut / anti-air', head: 1, sp: 2000, sd: 14 },
  { id: 'crush', name: 'CRUSH', color: 0xff3cac, accent: 0xff5a36, line: 'Ground Slam / landing burst', head: 0, sp: 2400, sd: 15 },
];

const STAGE = [
  { x: 400, y: 470, w: 420, h: 28 },
  { x: 240, y: 352, w: 120, h: 20 },
  { x: 560, y: 352, w: 120, h: 20 },
  { x: 400, y: 270, w: 100, h: 18 },
];

const SPAWNS = [{ x: 320, y: 300 }, { x: 480, y: 300 }];

// ── 8-bit music data ──────────────────────────────────────────────────────
const NOTES = { A2:110.0, C3:130.8, G3:196.0, C5:523.3, D5:587.3, E5:659.3, G5:784.0, A5:880.0 };
// A-minor pentatonic, 16-step loop at 130 BPM (8th-note grid)
const MELODY = ['E5',null,'G5','A5','E5','D5','E5',null,'C5',null,'E5','G5','A5',null,'E5',null];
const BASS   = ['A2',null,null,null,'A2',null,'G3',null,'A2',null,null,null,'C3',null,'A2',null];
const RHYTHM = [1,0,1,1,0,1,0,1];   // 8-step hi-hat pattern, loops inside 16

// DO NOT replace existing keys - they match the physical arcade cabinet wiring.
const CABINET_KEYS = {
  P1_U: ['w'], P1_D: ['s'], P1_L: ['a'], P1_R: ['d'],
  P1_1: ['u'], P1_2: ['i'], P1_3: ['o'],
  P1_4: ['j'], P1_5: ['k'], P1_6: ['l'],
  P2_U: ['ArrowUp'], P2_D: ['ArrowDown'], P2_L: ['ArrowLeft'], P2_R: ['ArrowRight'],
  P2_1: ['r'], P2_2: ['t'], P2_3: ['y'],
  P2_4: ['f'], P2_5: ['g'], P2_6: ['h'],
  START1: ['Enter'], START2: ['2'],
};

function nk(k) { return k === ' ' ? 'space' : k.length === 1 ? k.toLowerCase() : k; }
const KEY_MAP = {};
for (const [code, keys] of Object.entries(CABINET_KEYS)) for (const k of keys) KEY_MAP[nk(k)] = code;

function tone(scene, f, type, vol, dur) {
  try {
    const ctx = scene.sound.context;
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.01);
  } catch (_) {}
}

function bindKeys(scene) {
  scene.ctrl = { held: {}, pressed: {} };
  const onDown = e => {
    const ctx = scene.sound && scene.sound.context;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const code = KEY_MAP[nk(e.key)];
    if (!code) return;
    if (!scene.ctrl.held[code]) scene.ctrl.pressed[code] = true;
    scene.ctrl.held[code] = true;
  };
  const onUp = e => {
    const code = KEY_MAP[nk(e.key)];
    if (code) scene.ctrl.held[code] = false;
  };
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onDown);
    window.removeEventListener('keyup', onUp);
  });
}

function flush(scene) { for (const k in scene.ctrl.pressed) scene.ctrl.pressed[k] = false; }

function addLabel(scene, x, y, text, size, color, align) {
  return scene.add.text(x, y, text, {
    fontFamily: 'monospace', fontSize: size + 'px', fontStyle: 'bold', color, align: align || 'left',
  });
}

function anyOf(scene, codes) { return codes.some(c => scene.ctrl.pressed[c]); }

function drawBg(scene, title) {
  scene.add.rectangle(W / 2, H / 2, W, H, C.bg);
  const g = scene.add.graphics().lineStyle(1, C.grid, 0.42);
  for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
  for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
  g.lineStyle(2, C.frame, 0.8).strokeRect(28, 28, W - 56, H - 56);
  if (title) addLabel(scene, W / 2, 52, title, 30, C.text, 'center').setOrigin(0.5);
}

function buildFighter(scene, x, y, ch, s) {
  const c = scene.add.container(x, y).setScale(s);
  const r = (cx, cy, w, h, col) => c.add(scene.add.rectangle(cx, cy, w, h, col));
  if (ch.id === 'pulse') {
    r( 0,  -16, 12, 10, 0x00e5ff);  // head
    r( 0,  -15,  8,  2, 0xffffff);  // visor
    r( 0,  -10,  6,  4, 0x007799);  // neck
    r( 0,    1, 16, 22, 0x007799);  // torso
    r( 0,   -1,  5,  5, 0x00e5ff);  // core gem
    r(-12,  -2,  8,  4, 0x00e5ff);  // L arm
    r( 12,  -2,  8,  4, 0x00e5ff);  // R arm
    r(-5,   16,  6, 12, 0x005566);  // L leg
    r( 5,   16,  6, 12, 0x005566);  // R leg
    r(-5,   23,  8,  4, 0x00e5ff);  // L boot
    r( 5,   23,  8,  4, 0x00e5ff);  // R boot
  } else if (ch.id === 'volt') {
    r( 0,  -17, 14, 10, 0xffdd00);  // head
    r( 0,  -17, 10,  2, 0xff7a00);  // visor
    r(-12,  -8, 10,  5, 0xff7a00);  // L shoulder
    r( 12,  -8, 10,  5, 0xff7a00);  // R shoulder
    r( 0,    1, 18, 20, 0xddaa00);  // torso
    r( 0,   11, 18,  3, 0xff7a00);  // belt stripe
    r(-5,   18,  8, 10, 0x886600);  // L leg
    r( 5,   18,  8, 10, 0x886600);  // R leg
    r(-5,   25, 10,  4, 0xffdd00);  // L boot
    r( 5,   25, 10,  4, 0xffdd00);  // R boot
  } else {
    r( 0,  -15, 18, 12, 0xff3cac);  // head
    r( 0,  -15, 12,  3, 0xff5a36);  // visor
    r( 0,   -8, 12,  5, 0xcc1a7a);  // neck guard
    r( 0,    3, 24, 22, 0xcc1a7a);  // torso
    r( 0,    0, 16,  8, 0xff3cac);  // chest plate
    r(-15,   2, 10,  6, 0xff5a36);  // L arm
    r( 15,   2, 10,  6, 0xff5a36);  // R arm
    r(-6,   18, 10,  8, 0xff3cac);  // L knee
    r( 6,   18, 10,  8, 0xff3cac);  // R knee
    r(-6,   25, 12,  5, 0xff5a36);  // L boot
    r( 6,   25, 12,  5, 0xff5a36);  // R boot
  }
  return c;
}

function hitRect(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
}

// ── Music engine ──────────────────────────────────────────────────────────

function playNote(ctx, freq, type, startTime, dur, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  o.start(startTime); o.stop(startTime + dur + 0.01);
}

function startMusic(scene) {
  if (scene._musicEvent) return;
  let step = 0;
  scene._musicEvent = scene.time.addEvent({
    delay: 231,   // ms per 8th note at 130 BPM
    loop: true,
    callback: () => {
      const ctx = scene.sound && scene.sound.context;
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime + 0.005;
      const m = MELODY[step % 16];  if (m) playNote(ctx, NOTES[m], 'square',   t, 0.14, 0.038);
      const b = BASS[step % 16];    if (b) playNote(ctx, NOTES[b], 'square',   t, 0.20, 0.028);
      if (RHYTHM[step % 8])               playNote(ctx, 220,       'triangle', t, 0.05, 0.018);
      step++;
    },
  });
  scene.events.once('shutdown', () => stopMusic(scene));
}

function stopMusic(scene) {
  if (scene._musicEvent) { scene._musicEvent.remove(); scene._musicEvent = null; }
}

function showPickupText(scene, x, y, text, color) {
  const t = scene.add.text(x, y - 24, text, {
    fontFamily: 'monospace', fontSize: '15px', fontStyle: 'bold', color,
  }).setOrigin(0.5).setDepth(15);
  scene.tweens.add({ targets: t, y: y - 62, alpha: 0, duration: 950, onComplete: () => t.destroy() });
}

function burst(scene, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const dist = Phaser.Math.Between(38, 100);
    const r = scene.add.rectangle(x, y, 5, 5, color, 1);
    scene.tweens.add({
      targets: r, x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist,
      alpha: 0, scaleX: 0.2, scaleY: 0.2, duration: 350 + Math.random() * 80,
      onComplete: () => r.destroy(),
    });
  }
}

// ── Desert background ─────────────────────────────────────────────────────

function createDesertBackground(scene) {
  // Sky (static) ────────────────────────────────────────────────────────────
  const sk = scene.add.graphics();
  sk.fillStyle(0x1a0a04, 1); sk.fillRect(0, 0, W, H);
  sk.fillStyle(0x250e06, 0.55); sk.fillRect(0, 160, W, H - 160);
  sk.fillStyle(0x300e04, 0.32); sk.fillRect(0, 340, W, H - 340);
  // Sun glow layers
  sk.fillStyle(0xc85000, 0.10); sk.fillCircle(138, 106, 98);
  sk.fillStyle(0xdc6a10, 0.22); sk.fillCircle(138, 106, 66);
  sk.fillStyle(0xee8820, 0.50); sk.fillCircle(138, 106, 44);
  sk.fillStyle(0xffa040, 0.80); sk.fillCircle(138, 106, 26);
  sk.fillStyle(0xffc870, 1.00); sk.fillCircle(138, 106, 14);
  // Subtle noise dots
  sk.fillStyle(0xc08040, 0.18);
  [[300,40],[440,68],[560,30],[690,55],[740,22],[780,48],
   [200,88],[360,94],[520,75],[660,90]].forEach(([x, y]) => sk.fillRect(x, y, 2, 2));

  // Far layer — slow-scrolling building silhouettes ──────────────────────────
  scene.bgFar = scene.add.container(0, 0);
  const fg = scene.add.graphics();
  scene.bgFar.add(fg);
  const FAR = [
    [40,42,165],[108,28,128],[178,50,195],[262,34,112],
    [360,46,175],[460,26,108],[544,52,185],[640,36,138],
    [718,44,162],[790,28,118],
  ];
  FAR.forEach(([bx, bw, bh]) => {
    [0, W].forEach(ox => {
      fg.fillStyle(0x0e0706, 1);
      fg.fillRect(ox + bx - bw / 2, H - bh, bw, bh);
      fg.fillStyle(0x1a0a04, 1);
      fg.fillRect(ox + bx - bw / 2 + 3, H - bh, 6, ~~(bh * 0.10));
      fg.fillRect(ox + bx + bw / 2 - 11, H - bh, 7, ~~(bh * 0.07));
    });
  });

  // Mid layer — dunes + ruins, scrolls faster ────────────────────────────────
  scene.bgMid = scene.add.container(0, 0);
  const mg = scene.add.graphics();
  scene.bgMid.add(mg);

  // Sine-wave dunes — frequencies chosen so W is an integer number of periods
  // (n * 2π / W) ensures seamless wrap when container resets by W
  const dune = (baseY, amp, freq, col) => {
    mg.fillStyle(col, 1);
    [0, W].forEach(ox => {
      mg.beginPath();
      mg.moveTo(ox - 20, baseY + amp * Math.sin((ox - 20) * freq));
      for (let x = ox - 14; x <= ox + W + 20; x += 6)
        mg.lineTo(x, baseY + amp * Math.sin(x * freq));
      mg.lineTo(ox + W + 20, H);
      mg.lineTo(ox - 20, H);
      mg.closePath();
      mg.fillPath();
    });
  };
  dune(442, 20, 8 * Math.PI / W,  0x1e0f06);  // 4 periods
  dune(460, 14, 10 * Math.PI / W, 0x180c04);  // 5 periods
  dune(474, 10, 12 * Math.PI / W, 0x120902);  // 6 periods

  // Half-buried ruins above dunes
  [[80,16,52],[212,20,66],[388,14,48],[552,18,58],[726,16,54]].forEach(([rx, rw, rh]) => {
    [0, W].forEach(ox => {
      mg.fillStyle(0x0e0a04, 1);
      mg.fillRect(ox + rx - rw / 2, 438 - rh, rw, rh);
      mg.fillRect(ox + rx - rw / 2 + 2, 438 - rh - 10, 5, 10);
    });
  });

  // Particles layer — dust and wind streaks ─────────────────────────────────
  scene.bgParticles = scene.add.container(0, 0);
  scene.dustParticles = [];
  scene.windStreaks = [];

  for (let i = 0; i < 22; i++) {
    const r = scene.add.rectangle(
      Phaser.Math.Between(0, W), Phaser.Math.Between(200, H - 60),
      Phaser.Math.Between(2, 5), 1, 0xc89a50,
      Phaser.Math.FloatBetween(0.12, 0.40)
    );
    scene.bgParticles.add(r);
    scene.dustParticles.push({ r, spd: Phaser.Math.FloatBetween(18, 55) });
  }
  for (let i = 0; i < 10; i++) {
    const len = Phaser.Math.Between(28, 72);
    const r = scene.add.rectangle(
      Phaser.Math.Between(-W, W), Phaser.Math.Between(100, H - 80),
      len, 1, 0xd0a060,
      Phaser.Math.FloatBetween(0.06, 0.22)
    );
    scene.bgParticles.add(r);
    scene.windStreaks.push({ r, spd: Phaser.Math.FloatBetween(70, 160) });
  }
}

function updateBackground(scene, delta) {
  if (!scene.bgFar) return;
  const s = delta / 1000;
  // Parallax scroll — far moves slower than mid
  scene.bgFar.x -= 18 * s;
  if (scene.bgFar.x <= -W) scene.bgFar.x += W;
  scene.bgMid.x -= 42 * s;
  if (scene.bgMid.x <= -W) scene.bgMid.x += W;
  // Dust drifts right
  for (const d of scene.dustParticles) {
    d.r.x += d.spd * s;
    if (d.r.x > W + 5) d.r.x = -5;
  }
  // Wind streaks move right, faster
  for (const w of scene.windStreaks) {
    w.r.x += w.spd * s;
    if (w.r.x > W + w.r.width / 2) w.r.x = -w.r.width / 2;
  }
}

// ── Platform ships ────────────────────────────────────────────────────────

function buildPlatShip(scene, w, h, type) {
  const c = scene.add.container(0, 0);
  const hw = w / 2, hh = h / 2;
  // R / Circ helpers — positions are local to container
  const R = (x, y, pw, ph, col, a) => { const r = scene.add.rectangle(x, y, pw, ph, col, a ?? 1); c.add(r); return r; };
  const G = (x, y, r, col, a)      => { const o = scene.add.circle(x, y, r, col, a); c.add(o); return o; };

  // Hull body
  R(0, 0, w, h, 0x2a1c0e);
  // Glowing top landing strip
  R(0, -hh + 1, w, 4, 0xff6600);
  // Dark belly
  R(0, hh - 2, w, 5, 0x180e04);

  if (type === 'main') {
    // Reinforced end caps + centre engine block
    R(-hw + 8, 0, 16, h + 6, 0x3a2010);
    R( hw - 8, 0, 16, h + 6, 0x3a2010);
    R(0, 0, 80, h + 4, 0x241404);
    // 4 thruster pods + fire glows
    const glows = [-hw * 0.55, -hw * 0.2, hw * 0.2, hw * 0.55].map(tx => {
      R(tx, hh + 4, 20, 7, 0x1e1008);
      return G(tx, hh + 11, 6, 0xff8c00, 0.35);
    });
    // Running lights on top edge
    const lights = [-hw * 0.45, 0, hw * 0.45].map(lx => G(lx, -hh - 3, 2, 0xffb030, 0.7));
    scene.tweens.add({ targets: glows,  alpha: { from: 0.22, to: 0.75 }, duration: 380, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: lights, alpha: { from: 0.3,  to: 1.0  }, duration: 660, yoyo: true, repeat: -1 });

  } else if (type === 'side') {
    // Side fins
    R(-hw - 5, 1, 10, h - 2, 0x2e1608);
    R( hw + 5, 1, 10, h - 2, 0x2e1608);
    // Cockpit bump + glass
    R(0, -hh - 5, 24, 9, 0x2e1a08);
    R(0, -hh - 5, 14, 6, 0xff6600, 0.35);
    // 2 thruster pods
    const glows = [-w * 0.22, w * 0.22].map(tx => {
      R(tx, hh + 4, 12, 5, 0x1e1008);
      return G(tx, hh + 9, 4, 0xff8c00, 0.35);
    });
    const lights = [G(-hw + 4, -hh - 3, 2, 0xffb030, 0.7), G(hw - 4, -hh - 3, 2, 0xffb030, 0.7)];
    scene.tweens.add({ targets: glows,  alpha: { from: 0.2, to: 0.7 }, duration: 320, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: lights, alpha: { from: 0.25, to: 0.9 }, duration: 540, yoyo: true, repeat: -1 });

  } else { // top — scout vessel
    R(-hw - 4, 0, 8, h - 2, 0x2e1608);
    R( hw + 4, 0, 8, h - 2, 0x2e1608);
    R(0, hh + 3, 12, 5, 0x1e1008);
    const g = G(0, hh + 8, 4, 0xff8c00, 0.35);
    const l = G(0, -hh - 3, 2, 0xffb030, 0.7);
    scene.tweens.add({ targets: [g], alpha: { from: 0.2,  to: 0.65 }, duration: 290, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: [l], alpha: { from: 0.3,  to: 0.9  }, duration: 700, yoyo: true, repeat: -1 });
  }
  return c;
}

function updatePlatforms(scene) {
  if (!scene.platData) return;
  const t = scene.time.now * 0.001;
  let moved = false;
  for (const p of scene.platData) {
    if (!p.speed) continue;
    const nx = p.baseX + Math.sin(t * p.speed + p.phase) * p.range;
    p.hitbox.x = nx;
    p.visual.x  = nx;
    moved = true;
  }
  if (moved) scene.plats.refresh();
}

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Menu'); }
}

// ── Main Menu ──────────────────────────────────────────────────────────────

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    bindKeys(this);
    this.sel = 0;
    this.OPTS = ['PLAY', 'CONTROLS', 'CREDITS', 'EXIT'];
    drawBg(this, 'PIXEL BRAWL');
    addLabel(this, W / 2, 92, 'LOCAL ARCADE PLATFORM FIGHTER', 13, C.dim, 'center').setOrigin(0.5);
    buildFighter(this, W / 2 - 82, 202, CHARS[0], 1);
    buildFighter(this, W / 2,      194, CHARS[1], 1.1);
    buildFighter(this, W / 2 + 82, 202, CHARS[2], 1);
    this.items = this.OPTS.map((t, i) =>
      addLabel(this, W / 2, 312 + i * 48, t, 26, C.dim, 'center').setOrigin(0.5)
    );
    this.note = addLabel(this, W / 2, H - 50, '', 12, '#ff7a7a', 'center').setOrigin(0.5);
    addLabel(this, W / 2, H - 28, 'W/S  ·  ARROWS = NAVIGATE     ENTER = SELECT', 12, C.dim, 'center').setOrigin(0.5);
    this.refresh();
  }
  update() {
    if (anyOf(this, ['P1_U', 'P2_U'])) this.sel = (this.sel + this.OPTS.length - 1) % this.OPTS.length;
    if (anyOf(this, ['P1_D', 'P2_D'])) this.sel = (this.sel + 1) % this.OPTS.length;
    if (anyOf(this, ['START1', 'START2', 'P2_4', 'P1_5'])) this.confirm();
    this.refresh();
    flush(this);
  }
  confirm() {
    tone(this, 420, 'square', 0.05, 0.07);
    const opt = this.OPTS[this.sel];
    if (opt === 'PLAY') this.scene.start('Select');
    else if (opt === 'CONTROLS') this.scene.start('Controls');
    else if (opt === 'CREDITS') this.scene.start('Credits');
    else { this.note.setText('EXIT NOT AVAILABLE IN BROWSER'); try { window.close(); } catch (_) {} }
  }
  refresh() {
    for (let i = 0; i < this.items.length; i++) {
      const on = i === this.sel;
      this.items[i].setText((on ? '▶  ' : '   ') + this.OPTS[i])
        .setColor(on ? C.text : C.dim).setFontSize(on ? '28px' : '24px');
    }
  }
}

// ── Character Select ───────────────────────────────────────────────────────

class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('Select'); }
  create() {
    bindKeys(this);
    this.sel = [0, 1];
    this.lock = [0, 0];
    this.cards = [];
    drawBg(this, 'SELECT YOUR BRAWLER');
    for (let i = 0; i < 3; i++) {
      const ch = CHARS[i], x = 160 + i * 240, y = 290;
      const box = this.add.rectangle(x, y, 186, 256, 0x0c1b2e).setStrokeStyle(2, 0x1e3a58);
      buildFighter(this, x, y, ch, 1);
      addLabel(this, x, y - 112, ch.name, 18, '#ffffff', 'center').setOrigin(0.5);
      addLabel(this, x, y + 90,  ch.line, 11, C.dim,     'center').setOrigin(0.5);
      const mark = addLabel(this, x, y + 114, '', 12, '#ffffff', 'center').setOrigin(0.5);
      this.cards.push({ box, mark });
    }
    this.status = addLabel(this, W / 2, H - 68, '', 16, C.text, 'center').setOrigin(0.5);
    addLabel(this, W / 2, H - 42, 'P1: A/D + F TO LOCK   ·   P2: ARROWS + K TO LOCK   ·   ENTER = START', 11, C.dim, 'center').setOrigin(0.5);
    this.refresh();
  }
  update() {
    // P1 navigation: A/D — lock: F (= P2_4 in cabinet wiring)
    if (!this.lock[0]) {
      if (this.ctrl.pressed.P1_L) this.sel[0] = (this.sel[0] + 2) % 3;
      if (this.ctrl.pressed.P1_R) this.sel[0] = (this.sel[0] + 1) % 3;
      if (this.ctrl.pressed.P2_4) { this.lock[0] = 1; tone(this, 480, 'square', 0.06, 0.08); }
    }
    // P2 navigation: Arrows — lock: K (= P1_5 in cabinet wiring)
    if (!this.lock[1]) {
      if (this.ctrl.pressed.P2_L) this.sel[1] = (this.sel[1] + 2) % 3;
      if (this.ctrl.pressed.P2_R) this.sel[1] = (this.sel[1] + 1) % 3;
      if (this.ctrl.pressed.P1_5) { this.lock[1] = 1; tone(this, 620, 'square', 0.06, 0.08); }
    }
    if (this.lock[0] && this.lock[1] && anyOf(this, ['START1', 'START2'])) {
      tone(this, 700, 'square', 0.06, 0.1);
      this.scene.start('Game', { picks: [CHARS[this.sel[0]].id, CHARS[this.sel[1]].id] });
      return;
    }
    this.refresh();
    flush(this);
  }
  refresh() {
    for (let i = 0; i < this.cards.length; i++) {
      let stroke = 0x1e3a58, fill = 0x0c1b2e, mark = '';
      const p1 = this.sel[0] === i, p2 = this.sel[1] === i;
      if (p1 && !this.lock[0]) { stroke = 0x00d4aa; fill = 0x0e2820; mark = 'P1'; }
      if (p2 && !this.lock[1]) { stroke = 0xff4488; fill = 0x2a0e1c; mark = mark ? mark + ' / P2' : 'P2'; }
      if (p1 && this.lock[0]) { stroke = 0x00ffcc; fill = 0x0f2e1e; mark = 'P1 LOCKED'; }
      if (p2 && this.lock[1]) {
        stroke = 0xff88bb; fill = 0x2a1020;
        mark = (p1 && this.lock[0]) ? 'P1 LOCKED / P2 LOCKED' : 'P2 LOCKED';
      }
      this.cards[i].box.setFillStyle(fill).setStrokeStyle(2, stroke);
      this.cards[i].mark.setText(mark);
    }
    const both = this.lock[0] && this.lock[1];
    const p1s = this.lock[0] ? 'P1 LOCKED' : 'WAITING FOR P1';
    const p2s = this.lock[1] ? 'P2 LOCKED' : 'WAITING FOR P2';
    this.status.setText(both ? 'PRESS ENTER TO START' : p1s + '   ·   ' + p2s).setColor(both ? C.text : C.dim);
  }
}

// ── Controls Screen ────────────────────────────────────────────────────────

class ControlsScene extends Phaser.Scene {
  constructor() { super('Controls'); }
  create() {
    bindKeys(this);
    drawBg(this, 'CONTROLS');
    const cx = W / 2;
    addLabel(this, cx - 200, 148, 'PLAYER 1', 20, C.p1, 'center').setOrigin(0.5);
    [['A / D', 'MOVE'], ['W', 'JUMP  (double jump)'], ['F', 'ATTACK'], ['G', 'DASH + SPECIAL']].forEach(([k, v], i) => {
      addLabel(this, cx - 296, 194 + i * 40, k, 16, '#fff0aa').setOrigin(0, 0.5);
      addLabel(this, cx - 196, 194 + i * 40, v, 14, C.text).setOrigin(0, 0.5);
    });
    this.add.graphics().lineStyle(1, C.grid, 0.5).lineBetween(cx, 138, cx, 360);
    addLabel(this, cx + 200, 148, 'PLAYER 2', 20, C.p2, 'center').setOrigin(0.5);
    [['← / →', 'MOVE'], ['↑', 'JUMP  (double jump)'], ['K', 'ATTACK'], ['L', 'DASH + SPECIAL']].forEach(([k, v], i) => {
      addLabel(this, cx + 40,  194 + i * 40, k, 16, '#fff0aa').setOrigin(0, 0.5);
      addLabel(this, cx + 140, 194 + i * 40, v, 14, C.text).setOrigin(0, 0.5);
    });
    addLabel(this, cx, 400, 'WIN BY KNOCKING YOUR RIVAL OUT OF BOUNDS.', 13, C.dim, 'center').setOrigin(0.5);
    addLabel(this, cx, H - 30, 'PRESS ENTER TO RETURN', 13, '#fff0aa', 'center').setOrigin(0.5);
  }
  update() {
    if (anyOf(this, ['START1', 'START2', 'P1_1', 'P2_1'])) this.scene.start('Menu');
    flush(this);
  }
}

// ── Credits Screen ─────────────────────────────────────────────────────────

class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }
  create() {
    bindKeys(this);
    drawBg(this, 'CREDITS');
    const cx = W / 2, cy = H / 2;
    addLabel(this, cx, cy - 108, 'PLATANUS HACK 26', 22, C.text,   'center').setOrigin(0.5);
    addLabel(this, cx, cy -  72, 'BUENOS AIRES',     18, C.dim,    'center').setOrigin(0.5);
    addLabel(this, cx, cy -  42, 'ARCADE CHALLENGE', 18, C.dim,    'center').setOrigin(0.5);
    addLabel(this, cx, cy +  10, 'DEVELOPED BY',     12, C.dim,    'center').setOrigin(0.5);
    addLabel(this, cx, cy +  50, 'ALEJANDRO BIARRIETA', 22, '#fff0aa', 'center').setOrigin(0.5);
    addLabel(this, cx, cy +  84, 'DIEGO MOROS',         22, '#fff0aa', 'center').setOrigin(0.5);
    addLabel(this, cx, H - 30,   'PRESS ENTER TO RETURN', 13, C.dim, 'center').setOrigin(0.5);
  }
  update() {
    if (anyOf(this, ['START1', 'START2', 'P1_1', 'P2_1'])) this.scene.start('Menu');
    flush(this);
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.picks = data.picks || ['pulse', 'volt']; }

  create() {
    bindKeys(this);
    this.over = 0;
    this.ready = false;
    this.drawStage();
    this.makeStage();
    this.makeHud();
    this.players = [this.makePlayer(0, this.picks[0]), this.makePlayer(1, this.picks[1])];
    this.refreshHud();
    this.pickup = null;
    this.scheduleNextPickup();
    this.startCountdown();
    startMusic(this);
  }

  drawStage() {
    createDesertBackground(this);
    // Arena overlay — sits above desert, below platforms and players
    const g = this.add.graphics();
    g.lineStyle(1, 0x4a2000, 0.07);
    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
    g.lineStyle(2, 0x6a2a00, 0.42).strokeRect(28, 28, W - 56, H - 56);
    g.lineStyle(1, 0x8a2200, 0.32).lineBetween(0, 540, W, 540);
  }

  makeStage() {
    this.plats = this.physics.add.staticGroup();
    this.platData = [];
    // [x, y, w, h, type, speed(0=static), range, phase]
    // Same hitbox positions/sizes as original STAGE for gameplay parity
    const PDEFS = [
      { x: 400, y: 470, w: 420, h: 28, type: 'main', speed: 0,   range: 0,  phase: 0 },
      { x: 240, y: 352, w: 120, h: 20, type: 'side', speed: 0.8, range: 44, phase: 0 },
      { x: 560, y: 352, w: 120, h: 20, type: 'side', speed: 0.8, range: 44, phase: Math.PI },
      { x: 400, y: 270, w: 100, h: 18, type: 'top',  speed: 0.6, range: 28, phase: 0 },
    ];
    for (const d of PDEFS) {
      // Transparent hitbox — physics only
      const hitbox = this.add.rectangle(d.x, d.y, d.w, d.h, 0x000000, 0);
      this.plats.add(hitbox);
      // Visual ship container — purely decorative
      const visual = buildPlatShip(this, d.w, d.h, d.type);
      visual.setPosition(d.x, d.y);
      this.platData.push({ hitbox, visual, baseX: d.x, baseY: d.y, speed: d.speed, range: d.range, phase: d.phase });
    }
    this.plats.refresh();
  }

  makeHud() {
    addLabel(this, W / 2, 10, 'PIXEL BRAWL', 14, '#5ca7d0', 'center').setOrigin(0.5, 0);
    this.hudP1 = addLabel(this, 14, 12, '', 14, C.p1);
    this.hudS1 = addLabel(this, 14, 34, '', 12, C.dim);
    this.hudP2 = addLabel(this, W - 14, 12, '', 14, C.p2).setOrigin(1, 0);
    this.hudS2 = addLabel(this, W - 14, 34, '', 12, C.dim).setOrigin(1, 0);
  }

  makePlayer(idx, id) {
    const ch = CHARS.find(c => c.id === id) || CHARS[0], s = SPAWNS[idx];
    // Physics hitbox — transparent, drives all gameplay logic
    const body = this.add.rectangle(s.x, s.y, 26, 40, 0x000000, 0);
    this.physics.add.existing(body);
    body.body.setCollideWorldBounds(false).setMaxVelocity(700, 1000);
    this.physics.add.collider(body, this.plats);
    // Aura (created before visual so it renders behind the fighter)
    const aura = this.add.circle(s.x, s.y, 26, 0x44ff44).setVisible(false);
    // Visual container — follows hitbox, flips with facing direction
    const visual = buildFighter(this, s.x, s.y, ch, 1);
    // Fatigue overlay — semi-transparent tint tracked separately
    const overlay = this.add.rectangle(s.x, s.y, 24, 44, 0xff4400, 0);
    const face = idx ? -1 : 1;
    visual.setScale(face, 1);
    return {
      idx, char: ch, body, visual, overlay, aura,
      lives: LIVES, alive: 1, face, jumps: 2,
      stamina: 100, staminaMax: 100, invuln: 0, fatigue: 0, stun: 0,
      atkCd: 0, dashCd: 0, spCd: 0, dashT: 0, atk: null, slam: 0,
      lastHitTime: 0, buffs: { power: 0, speed: 0, regen: 0 }, _auraType: null, recovering: false,
    };
  }

  update(_, dt) {
    updateBackground(this, dt);
    updatePlatforms(this);
    this.updatePickup(dt);
    if (this.over) {
      if (this.ctrl.pressed.START1 || this.ctrl.pressed.START2) this.scene.start('Menu');
      flush(this); return;
    }
    const p1 = this.players[0], p2 = this.players[1];
    this.tickPlayer(p1, p2, dt);
    this.tickPlayer(p2, p1, dt);
    this.refreshHud();
    flush(this);
  }

  tickPlayer(p, foe, dt) {
    if (!p.alive) return;
    this.tickTimers(p, dt);
    if (this.ready && (p.body.x < -DEATH_X || p.body.x > W + DEATH_X || p.body.y > DEATH_Y)) { this.killPlayer(p); return; }
    this.movePlayer(p);
    this.handleActions(p);
    this.updateAttack(p, foe);
    this.checkSlam(p, foe);
    this.checkPickup(p);
    this.animatePlayer(p);
    // Buff aura — priority: power > speed > regen
    const auraType = p.buffs.power > 0 ? 'power' : p.buffs.speed > 0 ? 'speed' : p.buffs.regen > 0 ? 'regen' : null;
    if (auraType !== p._auraType) {
      p._auraType = auraType;
      if (auraType) {
        const ac = auraType === 'power' ? 0x44ff44 : auraType === 'speed' ? 0x4488ff : 0x00ffcc;
        p.aura.setFillStyle(ac).setVisible(true);
      } else {
        p.aura.setVisible(false);
      }
    }
    if (auraType) {
      p.aura.setPosition(p.body.x, p.body.y);
      p.aura.setAlpha(0.22 + 0.12 * Math.sin(this.time.now * 0.005));
    }
    const lowStam = p.stamina > 0 && p.stamina < p.staminaMax * 0.35 && p.fatigue <= 0;
    p.visual.setAlpha(
      p.invuln > 0 && (Math.floor(p.invuln / 80) % 2) ? 0.3 :
      lowStam && (Math.floor(this.time.now / 600) % 2) ? 0.65 : 1
    );
    p.overlay.setAlpha(p.fatigue > 0 ? 0.5 : 0);
  }

  tickTimers(p, dt) {
    if (p.invuln > 0) p.invuln -= dt;
    if (p.stun > 0)   p.stun   -= dt;
    if (p.atkCd > 0)  p.atkCd  -= dt;
    if (p.dashCd > 0) p.dashCd -= dt;
    if (p.spCd > 0)   p.spCd   -= dt;
    if (p.dashT > 0)  p.dashT  -= dt;
    if (p.buffs.power > 0) p.buffs.power = Math.max(0, p.buffs.power - dt);
    if (p.buffs.speed > 0) p.buffs.speed = Math.max(0, p.buffs.speed - dt);
    if (p.buffs.regen > 0) p.buffs.regen = Math.max(0, p.buffs.regen - dt);
    if (p.atk) { p.atk.t -= dt; if (p.atk.t <= 0) p.atk = null; }
    // Exhausted state countdown + recovery reward
    const wasExh = p.fatigue > 0;
    if (p.fatigue > 0) p.fatigue -= dt;
    if (wasExh && p.fatigue <= 0) {
      p.stamina = Math.min(p.staminaMax, p.stamina + EXHAUST_RECOVER);
      p.recovering = true;
      this.time.delayedCall(220, () => { p.recovering = false; });
      tone(this, 500, 'triangle', 0.06, 0.18);
    }
    // Stamina recovery: regen buff is instant (no delay), passive needs 2s gap
    if (p.fatigue <= 0 && p.stamina < p.staminaMax) {
      if (p.buffs.regen > 0)
        p.stamina = Math.min(p.staminaMax, p.stamina + dt * 0.022);
      else if (this.time.now - p.lastHitTime > 2000)
        p.stamina = Math.min(p.staminaMax, p.stamina + dt * 0.008);
    }
  }

  movePlayer(p) {
    if (!this.ready) return;
    const b = p.body.body;
    const L = p.idx ? 'P2_L' : 'P1_L';
    const R = p.idx ? 'P2_R' : 'P1_R';
    const U = p.idx ? 'P2_U' : 'P1_U';
    if (b.blocked.down || b.touching.down) p.jumps = 2;
    if (p.stun > 0) return;
    if (p.dashT > 0) return;
    const spd = SPEED * (p.buffs.speed > 0 ? 1.35 : 1);
    let vx = 0;
    if (this.ctrl.held[L]) { vx = -spd; p.face = -1; }
    if (this.ctrl.held[R]) { vx = spd; p.face = 1; }
    b.setVelocityX(vx);
    if (this.ctrl.pressed[U] && p.jumps > 0) {
      b.setVelocityY(JUMP);
      p.jumps--;
      tone(this, p.idx ? 390 : 330, 'square', 0.05, 0.07);
    }
  }

  handleActions(p) {
    if (!this.ready) return;
    // P1: F (P2_4) = attack, G (P2_5) = dash+special
    // P2: K (P1_5) = attack, L (P1_6) = dash+special
    const atkCode = p.idx ? 'P1_5' : 'P2_4';
    const altCode = p.idx ? 'P1_6' : 'P2_5';
    const L = p.idx ? 'P2_L' : 'P1_L', R = p.idx ? 'P2_R' : 'P1_R';
    const moving = this.ctrl.held[L] || this.ctrl.held[R];
    if (p.stun > 0 || p.fatigue > 0) return;
    if (this.ctrl.pressed[atkCode] && p.atkCd <= 0) this.basicAttack(p);
    if (this.ctrl.pressed[altCode]) {
      if (moving && p.dashCd <= 0) this.doDash(p);
      else if (p.spCd <= 0) this.doSpecial(p);
      else if (p.dashCd <= 0) this.doDash(p);
    }
  }

  basicAttack(p) {
    p.atkCd = ATK_CD;
    p.atk = { kind: 'basic', t: 85, hit: 0, w: 40, h: 26, ox: p.face * 30, oy: -4, dmg: 8, fx: 0.95, fy: 0.72 };
    this.flash(p.body.x + p.face * 22, p.body.y - 4, 32, 16, p.char.accent, 85);
    tone(this, p.idx ? 300 : 260, 'square', 0.07, 0.06);
  }

  doDash(p) {
    const b = p.body.body;
    const dir = p.face || (p.idx ? -1 : 1);
    p.dashCd = DASH_CD;
    p.dashT = 95;
    p.atk = { kind: 'dash', t: 95, hit: 0, w: 32, h: 34, ox: dir * 18, oy: 0, dmg: 10, fx: 0.9, fy: 0.5 };
    b.setVelocityX(dir * (p.buffs.speed > 0 ? 600 : 500));
    this.flash(p.body.x, p.body.y, 44, 20, p.char.color, 110);
    tone(this, 90, 'sawtooth', 0.06, 0.14);
  }

  doSpecial(p) {
    p.spCd = p.char.sp;
    if (p.char.id === 'pulse') {
      p.atk = { kind: 'pulse', t: 110, hit: 0, w: 116, h: 116, ox: 0, oy: 0, dmg: p.char.sd, fx: 1.02, fy: 0.7 };
      this.ring(p.body.x, p.body.y, 16, 4, p.char.color, 140);
      tone(this, 260, 'triangle', 0.06, 0.14);
    } else if (p.char.id === 'volt') {
      p.atk = { kind: 'volt', t: 110, hit: 0, w: 34, h: 68, ox: p.face * 16, oy: -40, dmg: p.char.sd, fx: 0.55, fy: 1.28 };
      this.flash(p.body.x + p.face * 10, p.body.y - 38, 24, 64, p.char.accent, 120);
      tone(this, 360, 'square', 0.06, 0.12);
    } else {
      p.slam = 1;
      p.body.body.setVelocityY(600);
      this.flash(p.body.x, p.body.y + 10, 28, 34, p.char.color, 120);
      tone(this, 120, 'sawtooth', 0.06, 0.12);
    }
  }

  checkSlam(p, foe) {
    if (!p.slam) return;
    const b = p.body.body;
    if (b.blocked.down || b.touching.down) {
      p.slam = 0;
      p.atk = { kind: 'crush', t: 90, hit: 0, w: 130, h: 60, ox: 0, oy: 6, dmg: p.char.sd, fx: 1.08, fy: 0.78 };
      this.ring(p.body.x, p.body.y + 12, 12, 5.5, p.char.accent, 140);
      this.flash(p.body.x, p.body.y + 10, 90, 22, p.char.accent, 120);
      this.cameras.main.shake(90, 0.009);
      tone(this, 100, 'square', 0.08, 0.16);
      this.updateAttack(p, foe);
    }
  }

  updateAttack(p, foe) {
    const a = p.atk;
    if (!a || a.hit || !foe.alive || foe.invuln > 0) return;
    const box = { x: p.body.x + a.ox, y: p.body.y + a.oy, w: a.w, h: a.h };
    const target = { x: foe.body.x, y: foe.body.y, w: 26, h: 40 };
    if (!hitRect(box, target)) return;
    a.hit = 1;
    this.hitPlayer(foe, p, a);
  }

  hitPlayer(t, p, a) {
    const b = t.body.body;
    const ratio = t.stamina / t.staminaMax;
    const mul = 1 + (1 - ratio) * 0.8;
    const pwr = p.buffs.power > 0 ? 1.40 : 1;
    const dir = p.body.x <= t.body.x ? 1 : -1;
    let vx = dir * BASE_KB_X * (a.fx || 1) * mul * pwr;
    let vy = -BASE_KB_Y * (a.fy || 0.75) * mul * pwr;
    if (a.kind === 'dash') vy = -95 * mul * pwr;
    t.lastHitTime = this.time.now;
    t.stamina = Math.max(0, t.stamina - a.dmg * pwr);
    if (t.stamina <= 0) {
      t.fatigue = FATIGUE_MS;
      t.atk = null;
      t.slam = 0;
    }
    t.stun = a.kind === 'basic' ? 110 : a.kind === 'dash' ? 130 : 150;
    b.setVelocity(vx, vy);
    // Visual feedback — sparks + flash, scaled by attack strength
    const heavy = a.kind !== 'basic';
    this.spark(t.body.x, t.body.y - 8, p.char.accent, heavy ? 9 : 5);
    this.flash(t.body.x, t.body.y - 6, heavy ? 38 : 24, 24, p.char.accent, 90);
    // Screen shake varies by attack type
    const [shkDur, shkAmt] = a.kind === 'basic' ? [35, 0.003] : a.kind === 'dash' ? [85, 0.007] : [120, 0.013];
    this.cameras.main.shake(shkDur, shkAmt);
    // Brief physics freeze on heavy hits for visual impact
    if (heavy) this.hitFreeze(a.kind === 'dash' ? 45 : 72);
    // Sound varies by type
    const hitF = a.kind === 'dash' ? 200 : a.kind === 'basic' ? 280 : 150;
    tone(this, hitF, a.kind === 'dash' ? 'sawtooth' : 'square', 0.08, 0.09);
  }

  killPlayer(p) {
    if (!p.alive) return;
    p.alive = 0;
    p.lives--;
    p.atk = null;
    p.slam = 0;
    p.buffs.power = p.buffs.speed = p.buffs.regen = 0;
    p._auraType = null;
    p.aura.setVisible(false);
    burst(this, p.body.x, p.body.y, p.char.color, 10);
    this.cameras.main.shake(230, 0.015);
    p.body.body.enable = false;
    p.body.setPosition(-500, -500);
    p.visual.setVisible(false);
    p.overlay.setVisible(false);
    tone(this, 90, 'sawtooth', 0.22, 0.5);
    this.refreshHud();
    if (p.lives <= 0) {
      this.over = 1;
      const win = this.players[1 - p.idx];
      this.time.delayedCall(600, () => this.scene.start('End', { winner: win.idx + 1, char: win.char }));
      return;
    }
    this.time.delayedCall(INVULN_MS, () => this.respawnPlayer(p));
  }

  respawnPlayer(p) {
    if (this.over) return;
    const s = SPAWNS[p.idx];
    p.alive = 1;
    p.jumps = 2;
    p.stamina = p.staminaMax;
    p.invuln = INVULN_MS;
    p.fatigue = 0;
    p.stun = 0;
    p.atk = null;
    p.slam = 0;
    p.lastHitTime = 0;
    p.buffs.power = p.buffs.speed = p.buffs.regen = 0;
    p._auraType = null;
    p.aura.setVisible(false).setAngle(0);
    p.recovering = false;
    p.body.body.enable = true;
    p.body.body.reset(s.x, s.y);
    p.visual.setVisible(true).setAlpha(1).setAngle(0).setPosition(s.x, s.y);
    p.overlay.setVisible(true).setAlpha(0).setPosition(s.x, s.y);
    this.syncHead(p);
    burst(this, s.x, s.y, p.char.accent, 6);
    tone(this, 400, 'triangle', 0.07, 0.08);
    this.time.delayedCall(80,  () => tone(this, 520, 'triangle', 0.07, 0.08));
    this.time.delayedCall(160, () => tone(this, 660, 'triangle', 0.07, 0.12));
  }

  syncHead(p) {
    p.visual.setPosition(p.body.x, p.body.y).setAngle(0);
    p.visual.setScale(p.face < 0 ? -1 : 1, 1);
    p.overlay.setPosition(p.body.x, p.body.y);
  }

  animatePlayer(p) {
    const t = this.time.now;
    const b = p.body.body;
    const sx = p.face < 0 ? -1 : 1;

    if (p.fatigue > 0) {
      // Exhausted: lerp fighter sideways (collapse)
      const target = 82 * sx;
      p.visual.setAngle(Phaser.Math.Linear(p.visual.angle, target, 0.18));
      p.visual.setPosition(p.body.x, p.body.y).setScale(sx, 1);
      p.overlay.setPosition(p.body.x, p.body.y);
      return;
    }
    if (p.recovering) {
      // Lerp back to upright after exhaustion ends
      p.visual.setAngle(Phaser.Math.Linear(p.visual.angle, 0, 0.22));
      p.visual.setPosition(p.body.x, p.body.y).setScale(sx, 1);
      p.overlay.setPosition(p.body.x, p.body.y);
      return;
    }

    const vx = Math.abs(b.velocity.x);
    const bF = p.char.id === 'volt' ? 0.0048 : p.char.id === 'crush' ? 0.0020 : 0.0034;
    const bA = p.char.id === 'crush' ? 2.2 : 1.4;
    let yOff = 0, ang = 0;
    if (p.stun > 0) {
      yOff = Math.sin(t * 0.08) * 2;
    } else if (vx > 20 && b.blocked.down) {
      yOff = Math.sin(t * bF * 4) * bA;
      ang  = Math.sin(t * bF * 4 + Math.PI / 2) * 2.5 * p.face;
    } else {
      yOff = Math.sin(t * bF) * bA;
    }
    p.visual.setPosition(p.body.x, p.body.y + yOff).setScale(sx, 1);
    p.visual.setAngle(sx < 0 ? -ang : ang);
    p.overlay.setPosition(p.body.x, p.body.y);
  }

  hitFreeze(ms) {
    this.physics.pause();
    this.time.delayedCall(ms, () => { if (!this.over) this.physics.resume(); });
  }

  spark(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      const r = this.add.rectangle(x, y, Phaser.Math.Between(2, 5), 2, color);
      this.tweens.add({
        targets: r,
        x: x + Math.cos(ang) * Phaser.Math.Between(10, 30),
        y: y + Math.sin(ang) * Phaser.Math.Between(10, 30),
        alpha: 0, duration: Phaser.Math.Between(60, 140),
        onComplete: () => r.destroy(),
      });
    }
  }

  startCountdown() {
    const txt = this.add.text(W / 2, H / 2 - 30, '', {
      fontFamily: 'monospace', fontSize: '90px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(20);
    const steps = [
      { s: '3', c: '#ff6040', f: 330 },
      { s: '2', c: '#ff9020', f: 440 },
      { s: '1', c: '#ffe060', f: 550 },
      { s: 'BRAWL!', c: '#ffffff', f: 880 },
    ];
    steps.forEach(({ s, c, f }, i) => {
      this.time.delayedCall(i * 900, () => {
        txt.setText(s).setColor(c).setScale(1.8).setAlpha(1);
        this.tweens.add({ targets: txt, scaleX: 1, scaleY: 1, duration: 500, ease: 'Power2.easeOut' });
        tone(this, f, 'square', 0.12, i === 3 ? 0.28 : 0.14);
        if (i === steps.length - 1) {
          this.time.delayedCall(600, () => {
            this.tweens.add({ targets: txt, alpha: 0, duration: 280, onComplete: () => txt.destroy() });
            this.ready = true;
          });
        }
      });
    });
  }

  scheduleNextPickup() {
    this.pickupTimer = 7000 + Math.random() * 3000;
  }

  updatePickup(dt) {
    if (!this.pickup) {
      if ((this.pickupTimer -= dt) <= 0) this.spawnPickup();
      return;
    }
    const nx = this.pickup.plat.hitbox.x + this.pickup.offX;
    const ny = this.pickup.plat.hitbox.y - 22;
    this.pickup.orb.setPosition(nx, ny);
    this.pickup.x = nx; this.pickup.y = ny;
    if ((this.pickup.life -= dt) <= 0) {
      this.tweens.killTweensOf(this.pickup.orb);
      this.pickup.orb.destroy();
      this.pickup = null;
      this.scheduleNextPickup();
    }
  }

  spawnPickup() {
    const pl = this.platData[Phaser.Math.Between(0, this.platData.length - 1)];
    const offX = Phaser.Math.Between(-30, 30);
    const rnd  = Math.random();
    const type = rnd < 0.40 ? 'recovery' : rnd < 0.60 ? 'power' : rnd < 0.80 ? 'speed' : 'regen';
    const PCOL = { recovery: 0x00ffaa, power: 0x44ff44, speed: 0x4488ff, regen: 0x00cccc };
    const col  = PCOL[type];
    const orb  = this.add.circle(pl.hitbox.x + offX, pl.hitbox.y - 22, 8, col, 0.9);
    this.tweens.add({ targets: orb, scaleX: 1.4, scaleY: 1.4, alpha: 0.65, duration: 380, yoyo: true, repeat: -1 });
    this.pickup = { orb, type, x: orb.x, y: orb.y, plat: pl, offX, life: 5500 };
  }

  checkPickup(p) {
    if (!this.pickup) return;
    const dx = p.body.x - this.pickup.x, dy = p.body.y - this.pickup.y;
    if (dx * dx + dy * dy > 24 * 24) return;
    const { type, x, y, orb } = this.pickup;
    this.tweens.killTweensOf(orb);
    orb.destroy();
    this.pickup = null;
    this.scheduleNextPickup();
    const BCOL = { recovery: 0x00ffaa, power: 0x44ff44, speed: 0x4488ff, regen: 0x00cccc };
    burst(this, x, y, BCOL[type], 7);
    if (type === 'recovery') {
      p.stamina = Math.min(p.staminaMax, p.stamina + 35);
      p.lastHitTime = 0;
      showPickupText(this, x, y, 'STAMINA +35', '#00ffaa');
      tone(this, 660, 'triangle', 0.07, 0.18);
    } else if (type === 'power') {
      p.buffs.power = BUFF_POWER_DUR;
      showPickupText(this, x, y, 'POWER UP!', '#44ff44');
      tone(this, 880, 'square', 0.07, 0.12);
    } else if (type === 'speed') {
      p.buffs.speed = BUFF_SPEED_DUR;
      showPickupText(this, x, y, 'SPEED UP!', '#4488ff');
      tone(this, 660, 'square', 0.07, 0.10);
    } else {
      p.buffs.regen = BUFF_REGEN_DUR;
      showPickupText(this, x, y, 'REGEN UP!', '#00cccc');
      tone(this, 550, 'triangle', 0.07, 0.14);
    }
  }

  flash(x, y, w, h, c, dur) {
    const r = this.add.rectangle(x, y, w, h, c, 0.8);
    this.tweens.add({ targets: r, alpha: 0, scaleX: 1.3, scaleY: 1.3, duration: dur, onComplete: () => r.destroy() });
  }

  ring(x, y, r, endScale, c, dur) {
    const circ = this.add.circle(x, y, r, c, 0.15).setStrokeStyle(3, c);
    this.tweens.add({ targets: circ, scaleX: endScale, scaleY: endScale, alpha: 0, duration: dur, onComplete: () => circ.destroy() });
  }

  refreshHud() {
    const dots = n => '●'.repeat(n) + '○'.repeat(LIVES - n);
    const bar = p => {
      const n = Math.max(0, Math.ceil((p.stamina / p.staminaMax) * 10));
      return '█'.repeat(n) + '·'.repeat(10 - n);
    };
    const cool = p => (p.spCd > 0 ? ' SP ' + Math.ceil(p.spCd / 1000) : ' SP RDY');
    const bufStr = p => {
      const b = [];
      if (p.buffs.power > 0) b.push('P');
      if (p.buffs.speed > 0) b.push('S');
      if (p.buffs.regen > 0) b.push('R');
      return b.length ? ' [' + b.join('') + ']' : '';
    };
    const p1 = this.players[0], p2 = this.players[1];
    this.hudP1.setText('P1 ' + p1.char.name + ' ' + dots(p1.lives));
    this.hudP2.setText(dots(p2.lives) + ' ' + p2.char.name + ' P2');
    this.hudS1.setText('STM ' + bar(p1) + bufStr(p1) + (p1.fatigue > 0 ? ' EXH' : '') + cool(p1));
    this.hudS2.setText((p2.fatigue > 0 ? 'EXH ' : '') + bar(p2) + bufStr(p2) + ' STM' + cool(p2));
  }
}

class EndScene extends Phaser.Scene {
  constructor() { super('End'); }
  init(data) { this.winner = data.winner || 1; this.char = data.char || null; }
  create() {
    bindKeys(this);
    this.add.rectangle(W / 2, H / 2, W, H, 0x050b16);
    const g = this.add.graphics().lineStyle(1, C.grid, 0.28);
    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
    const col = this.winner === 1 ? C.p1 : C.p2;
    const ch = this.char;
    if (ch) {
      buildFighter(this, W / 2, 316, ch, 1.3);
      addLabel(this, W / 2, 170, ch.name + ' WINS', 52, col, 'center').setOrigin(0.5);
    } else {
      addLabel(this, W / 2, 220, 'P' + this.winner + ' WINS', 52, col, 'center').setOrigin(0.5);
    }
    addLabel(this, W / 2, 400, 'PRESS START  ·  RETURN TO SELECT', 14, C.dim, 'center').setOrigin(0.5);
    // Victory fanfare
    const win = this;
    [0, 100, 200, 350].forEach((delay, i) => {
      win.time.delayedCall(300 + delay, () => tone(win, [440, 554, 660, 880][i], 'square', 0.07, i === 3 ? 0.3 : 0.12));
    });
  }
  update() {
    if (this.ctrl.pressed.START1 || this.ctrl.pressed.START2) this.scene.start('Menu');
    flush(this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-root',
  backgroundColor: '#08111f',
  physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, CharacterSelectScene, ControlsScene, CreditsScene, GameScene, EndScene],
};

new Phaser.Game(config);
