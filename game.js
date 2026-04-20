// Pixel Brawl - local 1v1 platform fighter

const W = 800, H = 600;
const GRAVITY = 980, SPEED = 220, JUMP = -420, LIVES = 3;
const DASH_CD = 900, FATIGUE_MS = 1000, INVULN_MS = 1200, EXHAUST_RECOVER = 35;
const BUFF_POWER_DUR = 10000, BUFF_SPEED_DUR = 10000, BUFF_REGEN_DUR = 8000, BUFF_GUARD_DUR = 9000;

const BUFF_KEYS = ['power', 'speed', 'regen', 'guard'];
const AURA_KEYS = ['guard', 'power', 'speed', 'regen'];
const PICKUP_SPAWN = [4, 22, 1.7, 190], PICKUP_TAKE = [6, 46];
const PICKUP_IDLE = [2.8, 0.0055, 0.035, 0.0062, 0.21, 0.06, 0.09, 0.03, 0.18, 0.04, 0, 0.022, 0, 0.0046, 1.18, 110];
const PICKUP_CFG = {
  recovery: { col: 0xff5f77, txt: 'STAMINA +35', tc: '#ff8094', s: [660, 'triangle', 0.18], heal: 35 },
  power:    { col: 0xff7a45, txt: 'POWER UP!',   tc: '#ff9f75', s: [880, 'square',   0.12], buff: 'power', dur: BUFF_POWER_DUR, spawn: [5, 26, 1.95, 230], take: [8, 56], idle: [2.8, 0.0055, 0.06, 0.0105, 0.28, 0.09, 0.12, 0.05, 0.24, 0.06, 0, 0.022, 0.03, 0.007, 1.28, 90], shake: 0.0035 },
  speed:    { col: 0xffd54a, txt: 'SPEED UP!',   tc: '#ffe37b', s: [660, 'square',   0.10], buff: 'speed', dur: BUFF_SPEED_DUR, take: [7, 46], idle: [3.2, 0.0082, 0.045, 0.009, 0.24, 0.07, 0.1, 0.035, 0.2, 0.05, 0.8, 0.022, 0.012, 0.008, 1.22, 100] },
  regen:    { col: 0x00d7c7, txt: 'REGEN UP!',   tc: '#00d7c7', s: [550, 'triangle', 0.14], buff: 'regen', dur: BUFF_REGEN_DUR, idle: [2.4, 0.0046, 0.03, 0.0045, 0.19, 0.05, 0.08, 0.028, 0.16, 0.03, 0, 0.022, 0, 0.0046, 1.18, 110] },
  guard:    { col: 0x57c9ff, txt: 'SHIELD UP!',  tc: '#9ce5ff', s: [490, 'square',   0.15], buff: 'guard', dur: BUFF_GUARD_DUR, idle: [1.7, 0.0041, 0.024, 0.0048, 0.16, 0.04, 0.06, 0.02, 0.14, 0.02, 0, 0.022, 0, 0.0046, 1.18, 110] },
};
const BASE_KB_X = 240, BASE_KB_Y = 155;
const KB_PERCENT_CAP = 190, KB_PERCENT_DIV = 172, KB_PERCENT_GAIN = 0.46;
const DEATH_X = 80, DEATH_Y = 680;

const C = {
  bg: 0x08111f, grid: 0x1b3550, frame: 0x204e7b, plat: 0x25394f, edge: 0x5ccdf7,
  text: '#d7f3ff', dim: '#6a8ba5', p1: '#8affd2', p2: '#ff93ba',
};

const CHARS = [
  { id: 'pulse', name: 'PULSE', color: 0x00e5ff, accent: 0xffffff, line: 'Karateka / shockwave', head: 0, sp: 2200, sd: 12 },
  { id: 'volt', name: 'VOLT', color: 0xffdd00, accent: 0xff7a00, line: 'Boxer / uppercut', head: 1, sp: 2000, sd: 14 },
  { id: 'crush', name: 'CRUSH', color: 0xff3cac, accent: 0xff5a36, line: 'Sumo / ground slam', head: 0, sp: 2400, sd: 15 },
];

const SPAWNS = [{ x: 320, y: 300 }, { x: 480, y: 300 }];
const STAGE_PLATS = [
  { x: 400, y: 470, w: 420, h: 28, type: 'main', speed: 0,   range: 0,  phase: 0 },
  { x: 240, y: 352, w: 120, h: 20, type: 'side', speed: 0.8, range: 44, phase: 0,        vRange: 18, vSpeed: 0.7, vPhase: 0 },
  { x: 560, y: 352, w: 120, h: 20, type: 'side', speed: 0.8, range: 44, phase: Math.PI,  vRange: 18, vSpeed: 0.7, vPhase: Math.PI },
  { x: 400, y: 270, w: 100, h: 18, type: 'top',  speed: 0.6, range: 28, phase: 0,        vRange: 14, vSpeed: 0.5, vPhase: 0 },
];
const FINAL_PLATS = [
  { x: 280, y: 470, w: 180, h: 28, type: 'side', speed: 1.2, range: 94, phase: 0,       vRange: 18, vSpeed: 0.9, vPhase: 0 },
  { x: 520, y: 470, w: 180, h: 28, type: 'side', speed: 1.2, range: 94, phase: Math.PI, vRange: 18, vSpeed: 0.9, vPhase: Math.PI },
];
const BUFF_BADGES = {
  power: [[-2, -1, 5, 3], [0, -4, 3, 3]],
  speed: [[-3, 0, 6, 2], [-1, -4, 3, 4]],
  regen: [[-2, -4, 4, 7], [-1, -6, 2, 2]],
  guard: [[-3, -4, 6, 2], [-4, -2, 8, 4], [-2, 2, 4, 2]],
};
const MOVESET = {
  pulse: { bc:240, b:[[78,48,22,26,-6,7,0.90,0.84],[84,36,36,22,16,9,0.82,1.05]], bf:[28,-6,0xffffff], dc:780, dt:95, d:[95,36,28,24,-8,9,0.88,0.82], sk:'pulse', sp:[110,116,116,0,0,0,1.02,0.70] },
  volt:  { bc:252, b:[[72,34,24,22,-2,8,1.06,0.56],[80,28,28,18,12,7,0.78,0.88]], bf:[20,-2,0xffdd00], dc:840, dt:95, d:[90,28,32,18,-2,11,1.08,0.40], sk:'volt',  sp:[110,34,68,16,-40,0,0.55,1.28] },
  crush: { bc:330, b:[[106,50,32,20,2,10,1.20,0.40],[98,40,36,16,16,8,0.92,0.78]], bf:[18,2,0xff8844], dc:1000,dt:108,d:[108,48,40,12,4,13,1.24,0.30], slam:[90,130,60,0,6,0,1.08,0.78] },
};

const NOTES = { A2:110.0, C3:130.8, G3:196.0, C5:523.3, D5:587.3, E5:659.3, G5:784.0, A5:880.0 };
const MELODY = ['E5',null,'G5','A5','E5','D5','E5',null,'C5',null,'E5','G5','A5',null,'E5',null];
const BASS   = ['A2',null,null,null,'A2',null,'G3',null,'A2',null,null,null,'C3',null,'A2',null];
const RHYTHM = [1,0,1,1,0,1,0,1];

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
const NAV_UP_KEYS = ['P1_U', 'P2_U'], NAV_DOWN_KEYS = ['P1_D', 'P2_D'];
const START_KEYS = ['START1', 'START2'], MENU_CONFIRM_KEYS = ['START1', 'START2', 'P2_4', 'P1_5'];
const BACK_KEYS = ['START1', 'START2', 'P1_1', 'P2_1'];
const PLAYER_KEYS = [
  { left: 'P1_L', right: 'P1_R', up: 'P1_U', attack: 'P2_4', alt: 'P2_5', shield: 'P1_4' },
  { left: 'P2_L', right: 'P2_R', up: 'P2_U', attack: 'P1_5', alt: 'P1_6', shield: 'P2_6' },
];

function nk(k) { return k === ' ' ? 'space' : k.length === 1 ? k.toLowerCase() : k; }
function mapKey(k) { return KEY_MAP[nk(k)]; }
function makeCtrl() { return { held: Object.create(null), pressed: Object.create(null), frame: [] }; }
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
  const ctrl = scene.ctrl = makeCtrl();
  const onDown = e => {
    const ctx = scene.sound && scene.sound.context;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const code = mapKey(e.key);
    if (!code) return;
    if (!ctrl.held[code]) { ctrl.pressed[code] = true; ctrl.frame.push(code); }
    ctrl.held[code] = true;
  };
  const onUp = e => {
    const code = mapKey(e.key);
    if (code) ctrl.held[code] = false;
  };
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onDown);
    window.removeEventListener('keyup', onUp);
  });
}

function flush(scene) {
  const ctrl = scene.ctrl, frame = ctrl.frame, pressed = ctrl.pressed;
  for (let i = 0; i < frame.length; i++) pressed[frame[i]] = false;
  frame.length = 0;
}

function addLabel(scene, x, y, text, size, color, align) {
  return scene.add.text(x, y, text, {
    fontFamily: 'monospace', fontSize: size + 'px', fontStyle: 'bold', color, align: align || 'left',
  });
}

function anyOf(scene, codes) {
  const pressed = scene.ctrl.pressed;
  for (let i = 0; i < codes.length; i++) if (pressed[codes[i]]) return true;
  return false;
}

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
  const P = {
    pulse: [
      [ 0,-19,12,11,0xf0c49a],[ 0,-24,12, 2,0x111111],[ 0,-16, 5, 2,0x4b2417],
      [ 0, -5,17,21,0xffffff],[ 0, -2,11,14,0xfaf6eb],[ 0,  7,16, 2,0x00c3df],[ 0, 10,18, 3,0x1a1a1a],
      [-10,-8, 5,13,0xf0c49a],[ 10,-8, 5,13,0xf0c49a],[-15,-3, 9, 3,0x00e5ff],[ 15,-3, 9, 3,0x00e5ff],
      [-4, 14, 7,13,0xffffff],[ 4, 14, 7,13,0xffffff],[-4, 24, 8, 4,0x0086b2],[ 4, 24, 8, 4,0x0086b2],
      [ 0, -9, 6, 4,0x111111],[ 0,  4,14, 3,0x00e5ff],
    ],
    volt: [
      [ 0,-19,12,11,0xc98d68],[ 0,-24,12, 2,0x161616],[ 0,-16, 4, 2,0x3f2015],
      [ 0, -4,16,20,0xc81a24],[ 0, -3,10,14,0xdf4c49],[ 0, 10,18, 4,0xffffff],
      [-9,-8, 6,12,0xc98d68],[ 9,-8, 6,12,0xc98d68],[-16,-6,10, 8,0xffdd00],[ 16,-6,10, 8,0xffdd00],
      [-5, 15, 7,13,0x212f47],[ 5, 15, 7,13,0x212f47],[-5, 24, 8, 4,0xffdd00],[ 5, 24, 8, 4,0xffdd00],
      [ 0, -9, 6, 4,0x161616],[ 0,  1,16, 3,0xff7a00],[ 0, -1,18, 2,0x8d0f18],
    ],
    crush: [
      [ 0,-19,12,11,0xf3c89e],[ 0,-24,10, 2,0x131313],[ 0,-17, 4, 2,0x4a2a18],
      [ 0, -1,24,24,0xf6efe3],[ 0,  7,26,12,0x8d4427],[ 0,-10,18, 5,0xff3cac],[ 0, 11,20, 2,0x5b2d1b],
      [-14,-4, 7,14,0xf3c89e],[ 14,-4, 7,14,0xf3c89e],[-18, 4,10, 6,0xc46e39],[ 18, 4,10, 6,0xc46e39],
      [-7, 18,10,12,0x4e2515],[ 7, 18,10,12,0x4e2515],[-7, 28,11, 4,0xeac89c],[ 7, 28,11, 4,0xeac89c],
      [ 0, -9, 6, 4,0x171717],[ 0, 12,10, 4,0x26140e],
    ],
  };
  for (const [px,py,pw,ph,pc] of (P[ch.id]||P.pulse))
    c.add(scene.add.rectangle(px,py,pw,ph,pc));
  return c;
}

function hitBox(ax, ay, aw, ah, bx, by, bw, bh) {
  return Math.abs(ax - bx) * 2 < aw + bw && Math.abs(ay - by) * 2 < ah + bh;
}

function down(v, dt) {
  return v > 0 ? Math.max(0, v - dt) : 0;
}

function grounded(b) {
  return b.blocked.down || b.touching.down;
}

function clearBuffs(buffs) {
  for (const k of BUFF_KEYS) buffs[k] = 0;
}

function buffMask(buffs) {
  let mask = 0;
  for (const k of BUFF_KEYS) mask = mask * 2 + (buffs[k] > 0);
  return mask;
}

function auraTypeOf(buffs) {
  for (const k of AURA_KEYS) if (buffs[k] > 0) return k;
  return null;
}

function tickBuffs(buffs, dt) {
  for (const k of BUFF_KEYS) buffs[k] = down(buffs[k], dt);
}

function eachBuff(buffs, fn) {
  let i = 0;
  for (const k of BUFF_KEYS) if (buffs[k] > 0) fn(k, i++);
}

function applyPickupToPlayer(p, cfg) {
  if (cfg.buff) p.buffs[cfg.buff] = cfg.dur;
  else { p.stamina = Math.min(p.staminaMax, p.stamina + cfg.heal); p.lastHitTime = 0; }
}

function makeAttack(kind, spec, dir, dmg) {
  return { kind, t: spec[0], hit: 0, w: spec[1], h: spec[2], ox: dir * spec[3], oy: spec[4], dmg: dmg ?? spec[5], fx: spec[6], fy: spec[7] };
}

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
    delay: 231,
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
  fxGone(scene, t, { y: y - 62, alpha: 0, duration: 950 });
}

function fxTween(scene, cfg, fail) {
  try { return scene.tweens.add(cfg); } catch (_) { if (fail) fail(); }
  return null;
}

function fxGone(scene, node, cfg, fail) {
  const done = cfg.onComplete, out = { ...cfg, targets: node, onComplete: () => { if (done) done(); node.destroy(); } };
  return fxTween(scene, out, fail || (() => node.destroy()));
}

function emitRects(scene, x, y, n, o) {
  for (let i = 0; i < n; i++) {
    const a = o.ang ? o.ang(i, n) : Math.random() * Math.PI * 2;
    const w = Phaser.Math.Between(o.w0, o.w1), h = Phaser.Math.Between(o.h0 == null ? o.w0 : o.h0, o.h1 == null ? (o.h0 == null ? o.w1 : o.h0) : o.h1);
    const r = scene.add.rectangle(x, y, w, h, o.col(i), o.alpha == null ? 0.95 : o.alpha);
    if (o.depth != null) r.setDepth(o.depth);
    const d = Phaser.Math.Between(o.d0, o.d1);
    const tw = { x: x + Math.cos(a) * (o.dx ? o.dx(i, d) : d), y: y + Math.sin(a) * (o.dy ? o.dy(i, d) : d) + (o.yb || 0), alpha: 0, duration: o.t0 + Math.random() * ((o.t1 == null ? o.t0 : o.t1) - o.t0) };
    if (o.spin) tw.angle = Phaser.Math.Between(o.spin[0], o.spin[1]);
    if (o.sx != null) tw.scaleX = o.sx;
    if (o.sy != null) tw.scaleY = o.sy;
    if (o.ease) tw.ease = o.ease;
    fxGone(scene, r, tw);
  }
}

function burst(scene, x, y, color, n) {
  emitRects(scene, x, y, n, {
    ang: i => (Math.PI * 2 * i) / n + Math.random() * 0.4,
    col: () => color, alpha: 1, w0: 5, w1: 5, h0: 5, h1: 5, d0: 38, d1: 100, t0: 350, t1: 430, sx: 0.2, sy: 0.2,
  });
}

function drawRects(g, ox, parts) {
  for (const p of parts) {
    g.fillStyle(p[4], p[5] == null ? 1 : p[5]);
    g.fillRect(ox + p[0], p[1], p[2], p[3]);
  }
}

function drawPeaks(g, ox, parts, col, a) {
  g.fillStyle(col, a == null ? 1 : a);
  for (const p of parts)
    g.fillTriangle(ox + p[0], p[1], ox + p[0] + p[2] / 2, p[1] - p[3], ox + p[0] + p[2], p[1]);
}

function wrapLayer(node, speed, s) {
  node.x -= speed * s;
  if (node.x <= -W) node.x += W;
}

function drawBuffBadges(g, buffs, x, y, dir) {
  const mask = buffMask(buffs);
  if (g._mask === mask) return;
  g._mask = mask;
  g.clear();
  eachBuff(buffs, (type, i) => {
    const bx = x + dir * i * 16, col = PICKUP_CFG[type].col;
    g.fillStyle(0x10202c, 0.95); g.fillRoundedRect(bx - 6, y - 6, 12, 12, 3);
    g.lineStyle(1, col, 0.95); g.strokeRoundedRect(bx - 6, y - 6, 12, 12, 3);
    g.fillStyle(col, 1);
    for (const p of BUFF_BADGES[type]) g.fillRect(bx + p[0], y + p[1], p[2], p[3]);
  });
}

function drawHudFrame(g, finalPhase) {
  if (g._finalPhase === finalPhase) return;
  g._finalPhase = finalPhase;
  g.clear();
  g.fillStyle(0x07121c, 0.56);
  g.fillRoundedRect(14, 10, 224, 76, 10);
  g.fillRoundedRect(W - 238, 10, 224, 76, 10);
  g.fillStyle(0x081722, 0.72);
  g.fillRoundedRect(W / 2 - 78, 10, 156, 36, 10);
  g.lineStyle(1, 0x295374, 0.70);
  g.strokeRoundedRect(14, 10, 224, 76, 10);
  g.strokeRoundedRect(W - 238, 10, 224, 76, 10);
  g.strokeRoundedRect(W / 2 - 78, 10, 156, 36, 10);
  g.lineStyle(2, 0x143245, 0.85);
  g.lineBetween(22, 60, 230, 60);
  g.lineBetween(W - 230, 60, W - 22, 60);
  g.fillStyle(finalPhase ? 0x742a2a : 0x11293b, 0.90);
  g.fillRoundedRect(W / 2 - 34, 53, 68, 22, 8);
  g.lineStyle(1, finalPhase ? 0xff6f6f : 0x5bc6f0, 0.90);
  g.strokeRoundedRect(W / 2 - 34, 53, 68, 22, 8);
}

function drawHudBar(g, seg, x) {
  if (g._seg === seg) return;
  g._seg = seg;
  g.clear();
  const c = seg >= 7 ? 0x32e3ff : seg >= 4 ? 0xffcf45 : 0xff5668;
  for (let i = 0; i < 10; i++) {
    g.fillStyle(i < seg ? c : 0x1a2a3a, i < seg ? 1 : .25);
    g.fillRect(x + i * 10, 63, 8, 6);
  }
}

function setHudLabel(node, text, color) {
  if (node._text !== text) { node.setText(text); node._text = text; }
  if (color && node._color !== color) { node.setColor(color); node._color = color; }
}

function hudPctColor(v, base) { return v >= 150 ? '#ff6d78' : v >= 80 ? '#ffd25a' : base; }

function createDesertBackground(scene) {
  const sky = scene.add.graphics();
  const ruins = [
    [96,304,108,118,0x63504d],[126,248,30,56,0x413541],[160,268,18,36,0x3f3a44],[112,320,74,8,0x90766d,0.42],
    [316,260,148,110,0x544541],[342,236,96,24,0x312a34],[330,288,16,72,0x312a34],[438,288,16,72,0x312a34],[338,300,98,8,0x8d765f,0.40],
    [424,330,122,88,0x4f3a31],[438,342,82,8,0x88614d,0.36],
    [580,282,22,146,0x453428],[634,272,22,156,0x453428],[576,272,80,18,0x6d5240],[594,356,12,72,0x36281f],[630,346,12,82,0x36281f],
  ];
  [[0x44536a,0,188],[0x6b7890,188,76],[0xe0a062,264,70],[0xaf714d,334,86],[0x654644,420,92],[0x31253a,512,88]].forEach(p => {
    sky.fillStyle(p[0], 1); sky.fillRect(0, p[1], W, p[2]);
  });
  [[0xf3d1a0,0.22,96],[0xf3d1a0,0.42,62],[0xfff1cb,0.88,24]].forEach(p => {
    sky.fillStyle(p[0], p[1]); sky.fillCircle(152, 98, p[2]);
  });
  scene.bgClouds = scene.add.container(0, 0);
  const cg = scene.add.graphics();
  scene.bgClouds.add(cg);
  [0, W].forEach(ox => {
    [[110,118,200,34],[356,146,164,26],[642,134,210,30]].forEach(p => {
      cg.fillStyle(0xe7d7c0, 0.08); cg.fillRoundedRect(ox + p[0] - p[2] / 2, p[1], p[2], p[3], 14);
      cg.fillStyle(0x846f72, 0.07); cg.fillRoundedRect(ox + p[0] - p[2] * 0.28, p[1] + 10, p[2] * 0.56, p[3] * 0.56, 10);
    });
  });
  scene.bgFar = scene.add.container(0, 0);
  const fg = scene.add.graphics();
  scene.bgFar.add(fg);
  [0,W].forEach(ox => {
    const sil = [[52,42,108],[112,30,78],[174,56,126],[286,46,94],[390,70,146],[560,40,104],[700,60,138]];
    fg.fillStyle(0x3f485e, 1);
    sil.forEach(p => fg.fillRect(ox + p[0] - p[1] / 2, H - 252 - p[2], p[1], p[2]));
    fg.fillStyle(0x586277, 0.32);
    for (let i = 0; i < sil.length; i += 2) {
      const p = sil[i];
      fg.fillRect(ox + p[0] - p[1] / 2 + 4, H - 242 - p[2], p[1] - 8, 8);
    }
  });
  scene.bgMid = scene.add.container(0, 0);
  const mg = scene.add.graphics();
  scene.bgMid.add(mg);
  [0,W].forEach(ox => {
    drawRects(mg, ox, ruins);
    drawPeaks(mg, ox, [[234,388,54,24],[274,398,64,26],[520,402,50,22],[654,404,64,26]], 0x8a6c4e);
    drawPeaks(mg, ox, [[300,408,192,58]], 0xb99662, 0.78);
  });
  const dune = (y, a, f, col, al) => {
    mg.fillStyle(col, al);
    [0, W].forEach(ox => {
      mg.beginPath(); mg.moveTo(ox - 20, y + a * Math.sin((ox - 20) * f));
      for (let x = ox - 12; x <= ox + W + 20; x += 8) mg.lineTo(x, y + a * Math.sin(x * f));
      mg.lineTo(ox + W + 20, H); mg.lineTo(ox - 20, H); mg.closePath(); mg.fillPath();
    });
  };
  dune(418, 18, 8 * Math.PI / W, 0xae8a62, 0.82);
  dune(452, 22, 6 * Math.PI / W, 0xc39a67, 1);
  dune(484, 11, 10 * Math.PI / W, 0x76584b, 0.9);
  mg.fillStyle(0xe2bf8b, 0.32); mg.fillEllipse(404, 394, 156, 56);
  mg.fillStyle(0x6f584b, 0.38); mg.fillEllipse(404, 402, 132, 40);
  scene.bgParticles = scene.add.container(0, 0);
  scene.dustParticles = []; scene.windStreaks = [];
  for (let i = 0; i < 18; i++) {
    const r = scene.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(170, H - 56), Phaser.Math.Between(2, 4), Phaser.Math.Between(1, 3), 0xe7c08d, Phaser.Math.FloatBetween(0.10, 0.28));
    scene.bgParticles.add(r); scene.dustParticles.push({ r, spd: Phaser.Math.FloatBetween(14, 44), drift: Phaser.Math.FloatBetween(-4, 4) });
  }
  for (let i = 0; i < 8; i++) {
    const len = Phaser.Math.Between(28, 66);
    const r = scene.add.rectangle(Phaser.Math.Between(-W, W), Phaser.Math.Between(120, H - 84), len, 1, 0xf3d3a1, Phaser.Math.FloatBetween(0.07, 0.18));
    scene.bgParticles.add(r); scene.windStreaks.push({ r, spd: Phaser.Math.FloatBetween(78, 168), drift: Phaser.Math.FloatBetween(-8, 8) });
  }
}

function updateBackground(scene, delta) {
  if (!scene.bgFar) return;
  const s = delta / 1000;
  wrapLayer(scene.bgClouds, 8, s);
  wrapLayer(scene.bgFar, 18, s);
  wrapLayer(scene.bgMid, 42, s);
  for (const d of scene.dustParticles) {
    d.r.x += d.spd * s; d.r.y += d.drift * s;
    if (d.r.x > W + 5) d.r.x = -5;
    if (d.r.y < 150) d.r.y = H - 64;
    if (d.r.y > H - 46) d.r.y = 170;
  }
  for (const w of scene.windStreaks) {
    w.r.x += w.spd * s; w.r.y += w.drift * s;
    if (w.r.x > W + w.r.width / 2) w.r.x = -w.r.width / 2;
    if (w.r.y < 110) w.r.y = H - 90;
    if (w.r.y > H - 70) w.r.y = 120;
  }
}

function drawPickupIcon(scene, type, col) {
  const c = scene.add.container(0, 0), g = scene.add.graphics();
  const fill = (cc, parts, a) => { g.fillStyle(cc, a == null ? 1 : a); for (const p of parts) g.fillRect(p[0], p[1], p[2], p[3]); };
  const off = (parts, ox, oy) => parts.map(p => [p[0] + ox, p[1] + oy, p[2], p[3]]);
  const stroke = (parts, cc, a) => {
    fill(cc, off(parts, -1, -1), a); fill(cc, off(parts, 0, -1), a); fill(cc, off(parts, 1, -1), a);
    fill(cc, off(parts, -1, 0), a);                                   fill(cc, off(parts, 1, 0), a);
    fill(cc, off(parts, -1, 1), a);  fill(cc, off(parts, 0, 1), a);  fill(cc, off(parts, 1, 1), a);
  };
  let hi = 0xffd8de, base, light;

  if (type === 'recovery') {
    hi = 0xffd7de;
    base = [[-9,-8,7,7],[2,-8,7,7],[-12,-3,26,8],[-8,5,18,6],[-4,11,10,5]];
    light = [[-8,-7,3,2],[-11,-2,6,2],[-7,6,3,2]];
  } else if (type === 'power') {
    hi = 0xffd39e;
    base = [[-10,-10,4,5],[-5,-11,4,6],[0,-11,4,6],[5,-10,4,5],[-10,-5,16,11],[5,-1,7,6],[-4,6,9,6]];
    light = [[-9,-9,2,2],[-4,-10,2,2],[-9,-4,5,2]];
  } else if (type === 'speed') {
    hi = 0xfff0af;
    base = [[-10,-11,13,4],[-1,-7,8,6],[-6,-2,10,6],[1,4,8,8]];
    light = [[-9,-10,6,1],[0,-6,3,2],[-5,-1,4,1]];
  } else if (type === 'regen') {
    hi = 0xbefcf7;
    base = [[-4,-12,8,4],[-7,-8,14,4],[-10,-4,20,12],[-8,8,16,5]];
    light = [[-3,-11,3,2],[-6,-7,4,2],[-9,-3,3,6]];
  } else if (type === 'guard') {
    hi = 0xdaf8ff;
    base = [[-9,-10,18,5],[-12,-5,24,7],[-10,2,20,6],[-7,8,14,5],[-3,13,6,4]];
    light = [[-8,-9,8,2],[-11,-4,5,2],[-9,3,4,2]];
  } else {
    base = [[-8,-8,16,16]];
    light = [[-7,-7,5,2],[-7,-5,2,5]];
  }
  const shadow = off(base, 2, 2);
  c.add(g);
  fill(0x04080d, [[-17,-17,34,34]], 0.92);
  fill(0x10202c, [[-15,-15,30,30]], 0.98);
  fill(0x1d3344, [[-15,-15,30,2],[-15,-13,2,28]], 0.92);
  fill(0x061019, [[-15,13,30,2],[13,-15,2,30]], 0.95);
  fill(col, [[-15,-15,30,30]], 0.10);
  fill(0x050a10, shadow, 0.55);
  stroke(base, 0x03070b, 0.98);
  fill(col, base);
  fill(hi, light);
  return c;
}

function buildPlatShip(scene, w, h, type) {
  const c = scene.add.container(0, 0);
  const hw = w / 2, hh = h / 2;
  const R = (x, y, pw, ph, col, a) => { const r = scene.add.rectangle(x, y, pw, ph, col, a ?? 1); c.add(r); return r; };
  const G = (x, y, r, col, a)      => { const o = scene.add.circle(x, y, r, col, a); c.add(o); return o; };
  R(0, 0, w, h, 0x2a1c0e); R(0, -hh + 1, w, 4, 0xff6600); R(0, hh - 2, w, 5, 0x180e04);
  if (type === 'main') {
    R(-hw + 8, 0, 16, h + 6, 0x3a2010); R(hw - 8, 0, 16, h + 6, 0x3a2010); R(0, 0, 80, h + 4, 0x241404);
    const glows = [-hw * 0.55, -hw * 0.2, hw * 0.2, hw * 0.55].map(tx => { R(tx, hh + 4, 20, 7, 0x1e1008); return G(tx, hh + 11, 6, 0xff8c00, 0.35); });
    const lights = [-hw * 0.45, 0, hw * 0.45].map(lx => G(lx, -hh - 3, 2, 0xffb030, 0.7));
    scene.tweens.add({ targets: glows,  alpha: { from: 0.22, to: 0.75 }, duration: 380, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: lights, alpha: { from: 0.3,  to: 1.0  }, duration: 660, yoyo: true, repeat: -1 });
  } else if (type === 'side') {
    R(-hw - 5, 1, 10, h - 2, 0x2e1608); R(hw + 5, 1, 10, h - 2, 0x2e1608);
    R(0, -hh - 5, 24, 9, 0x2e1a08); R(0, -hh - 5, 14, 6, 0xff6600, 0.35);
    const glows = [-w * 0.22, w * 0.22].map(tx => { R(tx, hh + 4, 12, 5, 0x1e1008); return G(tx, hh + 9, 4, 0xff8c00, 0.35); });
    const lights = [G(-hw + 4, -hh - 3, 2, 0xffb030, 0.7), G(hw - 4, -hh - 3, 2, 0xffb030, 0.7)];
    scene.tweens.add({ targets: glows,  alpha: { from: 0.2, to: 0.7 }, duration: 320, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: lights, alpha: { from: 0.25, to: 0.9 }, duration: 540, yoyo: true, repeat: -1 });
  } else {
    R(-hw - 4, 0, 8, h - 2, 0x2e1608); R(hw + 4, 0, 8, h - 2, 0x2e1608); R(0, hh + 3, 12, 5, 0x1e1008);
    const g = G(0, hh + 8, 4, 0xff8c00, 0.35), l = G(0, -hh - 3, 2, 0xffb030, 0.7);
    scene.tweens.add({ targets: [g], alpha: { from: 0.2,  to: 0.65 }, duration: 290, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: [l], alpha: { from: 0.3,  to: 0.9  }, duration: 700, yoyo: true, repeat: -1 });
  }
  return c;
}

function addStagePlatform(scene, d) {
  const hitbox = scene.add.rectangle(d.x, d.y, d.w, d.h, 0x000000, 0);
  scene.plats.add(hitbox);
  const visual = buildPlatShip(scene, d.w, d.h, d.type);
  visual.setPosition(d.x, d.y);
  const p = {
    hitbox, visual, baseX: d.x, baseY: d.y, speed: d.speed, range: d.range, phase: d.phase,
    vRange: d.vRange, vSpeed: d.vSpeed, vPhase: d.vPhase, halfW: d.w / 2, snapTop: d.y - 10,
  };
  scene.platData.push(p);
  if (d.speed || d.vRange) scene.movingPlats.push(p);
  return p;
}

function setStagePlatformPos(p, x, y) {
  p.hitbox.x = x; p.hitbox.y = y;
  p.visual.x = x; p.visual.y = y;
  p.snapTop = y - 10;
}

function updatePlatforms(scene) {
  const plats = scene.movingPlats;
  if (!plats || !plats.length) return;
  const t = scene.time.now * 0.001, sp = scene.platSpeedMul || 1, fy = scene.finalPhase;
  for (const p of plats) {
    const nx = p.baseX + Math.sin(t * p.speed * sp + p.phase) * p.range;
    const ny = p.baseY + (fy && p.vRange ? Math.sin(t * p.vSpeed + p.vPhase) * p.vRange : 0);
    setStagePlatformPos(p, nx, ny);
  }
  scene.plats.refresh();
}

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Menu'); }
}

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
    if (anyOf(this, NAV_UP_KEYS)) this.sel = (this.sel + this.OPTS.length - 1) % this.OPTS.length;
    if (anyOf(this, NAV_DOWN_KEYS)) this.sel = (this.sel + 1) % this.OPTS.length;
    if (anyOf(this, MENU_CONFIRM_KEYS)) this.confirm();
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
    if (!this.lock[0]) {
      if (this.ctrl.pressed.P1_L) this.sel[0] = (this.sel[0] + 2) % 3;
      if (this.ctrl.pressed.P1_R) this.sel[0] = (this.sel[0] + 1) % 3;
      if (this.ctrl.pressed.P2_4) { this.lock[0] = 1; tone(this, 480, 'square', 0.06, 0.08); }
    }
    if (!this.lock[1]) {
      if (this.ctrl.pressed.P2_L) this.sel[1] = (this.sel[1] + 2) % 3;
      if (this.ctrl.pressed.P2_R) this.sel[1] = (this.sel[1] + 1) % 3;
      if (this.ctrl.pressed.P1_5) { this.lock[1] = 1; tone(this, 620, 'square', 0.06, 0.08); }
    }
    if (this.lock[0] && this.lock[1] && anyOf(this, START_KEYS)) {
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
    if (anyOf(this, BACK_KEYS)) this.scene.start('Menu');
    flush(this);
  }
}

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
    if (anyOf(this, BACK_KEYS)) this.scene.start('Menu');
    flush(this);
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.picks = data.picks || ['pulse', 'volt']; }

  create() {
    bindKeys(this);
    this.over = 0; this.matchTime = 180000; this.finalPhase = false; this.midPhase = false;
    this.platSpeedMul = 1; this.moveSpeedMul = 1.06; this.atkCdMul = 0.95;
    this.ready = false;
    this.hudDirty = false;
    this._fzEnd = 0; this._fzToken = 0;
    this.events.once('shutdown', () => {
      this._fzEnd = 0; this._fzToken = 0;
      if (this.physics && this.physics.world && this.physics.world.isPaused) this.physics.resume();
    });
    this.drawStage();
    this.makeStage();
    this.makeHud();
    this.players = [this.makePlayer(0, this.picks[0]), this.makePlayer(1, this.picks[1])];
    this.refreshHud();
    this.pickup = null;
    this.pickupTimer = 4300 + Math.random() * 1800;
    this.startCountdown();
    startMusic(this);
  }

  drawStage() {
    createDesertBackground(this);
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
    this.movingPlats = [];
    for (const d of STAGE_PLATS) addStagePlatform(this, d);
    this.mainPlat = this.platData[0] || null;
    this.plats.refresh();
  }

  makeHud() {
    this.hudFrame = this.add.graphics().setDepth(10);
    this.hudTimer = addLabel(this, W / 2, 16, '3:00', 20, C.text, 'center').setOrigin(0.5, 0).setDepth(11);
    this.hudP1 = addLabel(this, 26, 16, '', 10, C.p1).setDepth(11);
    this.hudPct1 = addLabel(this, 26, 28, '', 32, C.p1).setDepth(11);
    this.hudS1 = addLabel(this, 26, 68, '', 9, C.dim).setDepth(11);
    this.hudP2 = addLabel(this, W - 26, 16, '', 10, C.p2, 'right').setOrigin(1, 0).setDepth(11);
    this.hudPct2 = addLabel(this, W - 26, 28, '', 32, C.p2, 'right').setOrigin(1, 0).setDepth(11);
    this.hudS2 = addLabel(this, W - 26, 68, '', 9, C.dim, 'right').setOrigin(1, 0).setDepth(11);
    this.hudBar1 = this.add.graphics();
    this.hudBar2 = this.add.graphics();
    this.hudBuff1 = this.add.graphics();
    this.hudBuff2 = this.add.graphics();
    this.hudBar1.setDepth(11); this.hudBar2.setDepth(11); this.hudBuff1.setDepth(11); this.hudBuff2.setDepth(11);
    this._hudTimerS = -1; this._hudTimerFinal = null;
    drawHudFrame(this.hudFrame, this.finalPhase);
  }

  makePlayer(idx, id) {
    const ch = CHARS.find(c => c.id === id) || CHARS[0], s = SPAWNS[idx];
    const body = this.add.rectangle(s.x, s.y, 26, 40, 0x000000, 0);
    this.physics.add.existing(body);
    body.body.setCollideWorldBounds(false).setMaxVelocity(700, 1000);
    body.body.allowGravity = false;
    this.physics.add.collider(body, this.plats);
    const aura = this.add.circle(s.x, s.y, 26, 0x44ff44).setVisible(false);
    const visual = buildFighter(this, s.x, s.y, ch, 1);
    const overlay = this.add.rectangle(s.x, s.y, 24, 44, 0xff4400, 0);
    const face = idx ? -1 : 1;
    visual.setScale(face, 1);
    return {
      idx, char: ch, body, visual, overlay, aura,
      lives: LIVES, alive: 1, face, jumps: 2,
      stamina: 100, staminaMax: 100, percent: 0, invuln: 0, fatigue: 0, stun: 0,
      atkCd: 0, dashCd: 0, spCd: 0, dashT: 0, atk: null, atkChain: 0, atkChainT: 0, atkQueue: 0, slam: 0,
      lastHitTime: 0, buffs: { power: 0, speed: 0, regen: 0, guard: 0 }, _auraType: null, recovering: false,
      canAirDodge: true, canEdgeSnap: true, shielding: false, comboHits: 0, comboT: 0, _recoilT: 0, _atkPoseT: 0,
      keys: PLAYER_KEYS[idx],
      _hud: { seg: 10, sp: -1, bk: 0, fat: false, pct: 0 }, _lastAlpha: -1, _lastOvAlpha: -1, _lastOvColor: -1, _lastSx: 0,
    };
  }

  update(_, dt) {
    updateBackground(this, dt);
    updatePlatforms(this);
    this.updatePickup(dt);
    if (this.over) {
      if (anyOf(this, START_KEYS)) this.scene.start('Menu');
      flush(this); return;
    }
    const p1 = this.players[0], p2 = this.players[1];
    this.tickPlayer(p1, p2, dt);
    this.tickPlayer(p2, p1, dt);
    if (this.hudDirty) { this.refreshHud(); this.hudDirty = false; }
    this.updateMatchTimer(dt);
    flush(this);
  }

  updateMatchTimer(dt) {
    if (this.over || !this.ready) return;
    this.matchTime -= dt;
    if (!this.midPhase && this.matchTime <= 120000) this.triggerMidPhase();
    if (!this.finalPhase && this.matchTime <= 60000) this.triggerFinalPhase();
    this.updatePace();
    if (this.matchTime <= 0) { this.endMatch(); return; }
    const s = Math.max(0, Math.ceil(this.matchTime / 1000));
    if (s !== this._hudTimerS || this.finalPhase !== this._hudTimerFinal) {
      setHudLabel(this.hudTimer, ~~(s / 60) + ':' + String(s % 60).padStart(2, '0'), this.finalPhase ? '#ff4444' : C.text);
      this._hudTimerS = s; this._hudTimerFinal = this.finalPhase;
    }
  }

  updatePace() {
    const t = Math.max(0, this.matchTime), mp = this.mainPlat;
    if (!this.midPhase) {
      const q = Math.min(1, (180000 - t) / 60000);
      this.moveSpeedMul = 1.06 + q * 0.02;
      this.atkCdMul = 0.95 - q * 0.01;
      this.platSpeedMul = 1 + q * 0.03;
      return;
    }
    if (!this.finalPhase) {
      const q = Math.min(1, (120000 - t) / 60000);
      this.moveSpeedMul = 1.08 + q * 0.04;
      this.atkCdMul = 0.94 - q * 0.03;
      this.platSpeedMul = 1.03 + q * 0.22;
      if (mp) { mp.range = 18 + q * 30; mp.speed = 0.34 + q * 0.34; }
      return;
    }
    const q = Math.min(1, (60000 - t) / 60000);
    this.moveSpeedMul = 1.12 + q * 0.03;
    this.atkCdMul = 0.91 - q * 0.03;
    this.platSpeedMul = 1.25 + q * 0.11;
  }

  tickPlayer(p, foe, dt) {
    if (!p.alive) return;
    const now = this.time.now, b = p.body.body;
    this.tickTimers(p, dt, now);
    this.updateShield(p, dt);
    if (this.ready && (p.body.x < -DEATH_X || p.body.x > W + DEATH_X || p.body.y > DEATH_Y)) { this.killPlayer(p); return; }
    this.movePlayer(p, b);
    this.handleActions(p, b);
    this.updateAttack(p, foe);
    this.checkSlam(p, foe);
    this.checkPickup(p);
    this.animatePlayer(p, b, now);
    this.updateAura(p, now);
    this.updatePlayerAlpha(p, now);
    this.tryEdgeSnap(p, b);
    this.updateOverlay(p);
  }

  updateShield(p, dt) {
    const held = this.ctrl.held;
    p.shielding = p.fatigue <= 0 && p.stun <= 0 && p.stamina > 0 && !!held[p.keys.shield];
    if (!p.shielding) return;
    p.stamina = Math.max(0, p.stamina - dt * 0.025);
    if (p.stamina <= 0) { p.fatigue = FATIGUE_MS * 0.6; p.shielding = false; }
  }

  updateAura(p, now) {
    const auraType = auraTypeOf(p.buffs);
    if (auraType !== p._auraType) {
      p._auraType = auraType;
      if (auraType) {
        const ac = PICKUP_CFG[auraType].col;
        p.aura.setFillStyle(ac).setVisible(true);
      } else {
        p.aura.setVisible(false);
      }
    }
    if (auraType) {
      p.aura.setPosition(p.body.x, p.body.y);
      p.aura.setAlpha(0.22 + 0.12 * Math.sin(now * 0.005));
    }
  }

  updatePlayerAlpha(p, now) {
    const lowStam = p.stamina > 0 && p.stamina < p.staminaMax * 0.35 && p.fatigue <= 0;
    const na = p.invuln > 0 && (((now / 80) | 0) & 1) ? 0.3 :
               lowStam && (((now / 600) | 0) & 1) ? 0.65 : 1;
    if (na !== p._lastAlpha) { p.visual.setAlpha(na); p._lastAlpha = na; }
  }

  tryEdgeSnap(p, b) {
    if (!this.ready || !p.canEdgeSnap || b.blocked.down || b.velocity.y <= 80) return;
    const px = p.body.x, py = p.body.y;
    for (const pd of this.platData) {
      const ed = Math.abs(px - pd.hitbox.x) - pd.halfW;
      const yd = py - pd.snapTop;
      if (ed > 0 && ed < 24 && yd > 0 && yd < 50) {
        p.canEdgeSnap = false;
        b.velocity.x += (px < pd.hitbox.x ? 1 : -1) * 80;
        break;
      }
    }
  }

  updateOverlay(p) {
    const no = p.shielding ? 0.45 : p.fatigue > 0 ? 0.5 : 0;
    const nc = p.shielding ? 0x4488ff : 0xff4400;
    if (no !== p._lastOvAlpha || nc !== p._lastOvColor) {
      p.overlay.setFillStyle(nc).setAlpha(no);
      p._lastOvAlpha = no; p._lastOvColor = nc;
    }
  }

  tickTimers(p, dt, now) {
    const wasExh = p.fatigue > 0;
    p.invuln = down(p.invuln, dt);
    p.stun = down(p.stun, dt);
    p.atkCd = down(p.atkCd, dt);
    p.dashCd = down(p.dashCd, dt);
    p.spCd = down(p.spCd, dt);
    p.dashT = down(p.dashT, dt);
    tickBuffs(p.buffs, dt);
    if (p.atk) { p.atk.t -= dt; if (p.atk.t <= 0) p.atk = null; }
    if (p.atkChainT > 0) { p.atkChainT = down(p.atkChainT, dt); if (!p.atkChainT) { p.atkChain = 0; p.atkQueue = 0; } }
    if (p.comboT > 0) { p.comboT = down(p.comboT, dt); if (!p.comboT) p.comboHits = 0; }
    p._recoilT = down(p._recoilT, dt);
    p._atkPoseT = down(p._atkPoseT, dt);
    p.fatigue = down(p.fatigue, dt);
    if (p.stun > 0 || p.fatigue > 0) { p.atkChain = 0; p.atkChainT = 0; p.atkQueue = 0; }
    if (wasExh && !p.fatigue) this.finishFatigue(p);
    if (p.fatigue <= 0 && p.stamina < p.staminaMax) {
      if (p.buffs.regen > 0)
        p.stamina = Math.min(p.staminaMax, p.stamina + dt * 0.022);
      else if (now - p.lastHitTime > 2000)
        p.stamina = Math.min(p.staminaMax, p.stamina + dt * 0.008);
    }
    this.updateHudState(p);
  }

  finishFatigue(p) {
    p.stamina = Math.min(p.staminaMax, p.stamina + EXHAUST_RECOVER);
    p.recovering = true;
    this.time.delayedCall(220, () => { p.recovering = false; });
    tone(this, 500, 'triangle', 0.06, 0.18);
  }

  updateHudState(p) {
    const hud = p._hud;
    const ns = Math.ceil(p.stamina / p.staminaMax * 10);
    const nsp = p.spCd > 0 ? Math.ceil(p.spCd / 1000) : -1;
    const nbk = buffMask(p.buffs);
    const nf  = p.fatigue > 0;
    const np = Math.round(p.percent);
    if (ns !== hud.seg || nsp !== hud.sp || nbk !== hud.bk || nf !== hud.fat || np !== hud.pct) {
      hud.seg = ns; hud.sp = nsp; hud.bk = nbk; hud.fat = nf; hud.pct = np;
      this.hudDirty = true;
    }
  }

  movePlayer(p, b) {
    if (!this.ready) return;
    const k = p.keys, held = this.ctrl.held;
    if (grounded(b)) { p.jumps = 2; p.canAirDodge = true; p.canEdgeSnap = true; }
    if (p.stun > 0 || p.dashT > 0) return;
    if (p.shielding) { b.setVelocityX(0); return; }
    const left = held[k.left], right = held[k.right];
    const dir = right ? 1 : left ? -1 : 0;
    const spd = SPEED * (p.buffs.speed > 0 ? 1.35 : 1) * this.moveSpeedMul;
    if (dir) p.face = dir;
    b.setVelocityX(dir * spd);
    if (this.ctrl.pressed[k.up] && p.jumps > 0) {
      b.setVelocityY(JUMP);
      p.jumps--;
      tone(this, p.idx ? 390 : 330, 'square', 0.05, 0.07);
    }
  }

  handleActions(p, b) {
    if (!this.ready || p.stun > 0 || p.fatigue > 0 || p.shielding) return;
    const k = p.keys, held = this.ctrl.held, pressed = this.ctrl.pressed;
    const moving = held[k.left] || held[k.right];
    if (p.atkQueue && p.atkCd <= 0 && p.atkChainT > 0) { p.atkQueue = 0; this.basicAttack(p, b); }
    if (pressed[k.attack]) {
      if (p.atkCd <= 0) this.basicAttack(p, b);
      else if (p.atkChainT > 0) p.atkQueue = 1;
    }
    if (pressed[k.alt]) this.handleAltAction(p, b, moving);
  }

  handleAltAction(p, b, moving) {
    if (!grounded(b) && p.canAirDodge && moving) return this.doAirDodge(p, b);
    if (moving && p.dashCd <= 0) return this.doDash(p);
    if (p.spCd <= 0) return this.doSpecial(p);
    if (p.dashCd <= 0) this.doDash(p);
  }

  setAttack(p, kind, spec, dir, dmg) {
    p.atk = makeAttack(kind, spec, dir, dmg);
    p._atkPoseT = p.atk.t;
  }

  basicAttack(p, b) {
    const gr = grounded(b), m = MOVESET[p.char.id], fx = m.bf, c = p.atkChainT > 0 ? (p.atkChain + 1) % 3 : 0;
    p.atkChain = c; p.atkChainT = 300; p.atkQueue = 0;
    p.atkCd = m.bc * (this.atkCdMul || 1) * (c ? (c === 2 ? 0.66 : 0.78) : 1);
    const spec = m.b[gr ? 0 : 1], dmg = spec[5] + c;
    this.setAttack(p, 'basic', spec, p.face, dmg);
    if (c) b.setVelocityX(b.velocity.x + p.face * (c === 2 ? 56 : 34));
    this.flash(p.body.x + p.face * (fx[0] + c * 5), p.body.y + (gr ? fx[1] : 14), 30 + c * 6, 20, fx[2], 85);
    tone(this, (p.idx ? 300 : 260) + c * 46, 'square', 0.07, c ? 0.07 : 0.06);
  }

  doDash(p) {
    const b = p.body.body, id = p.char.id, m = MOVESET[id], dir = p.face || (p.idx ? -1 : 1);
    p.atkChain = 0; p.atkChainT = 0; p.atkQueue = 0;
    // Per-character dash cooldown
    p.dashCd = m.dc * (this.atkCdMul || 1);
    p.dashT = m.dt;
    if (id === 'pulse') {
      // Flying kick: long forward reach, moderate launch, upward angle
      this.setAttack(p, 'dash', m.d, dir);
    } else if (id === 'volt') {
      // Cross punch: tight, high horizontal force, minimal vertical — ground pressure
      this.setAttack(p, 'dash', m.d, dir);
    } else {
      // Charging body press: widest hitbox, highest damage, pure horizontal push
      this.setAttack(p, 'dash', m.d, dir);
    }
    b.setVelocityX(dir * (p.buffs.speed > 0 ? 600 : 500) * (this.finalPhase ? 1.15 : 1));
    this.flash(p.body.x, p.body.y, 44, 20, p.char.color, 110);
    tone(this, 90, 'sawtooth', 0.06, 0.14);
  }

  doAirDodge(p, b) {
    const dir = this.ctrl.held[p.keys.left] ? -1 : 1;
    p.atkChain = 0; p.atkChainT = 0; p.atkQueue = 0;
    p.canAirDodge = false;
    p.invuln = Math.max(p.invuln, 160);
    p.dashCd = DASH_CD * 0.7 * (this.atkCdMul || 1);
    b.setVelocity(dir * 370, -60);
    this.flash(p.body.x, p.body.y, 34, 34, p.char.color, 130);
    tone(this, 480, 'triangle', 0.04, 0.10);
  }

  doSpecial(p) {
    const m = MOVESET[p.char.id];
    p.atkChain = 0; p.atkChainT = 0; p.atkQueue = 0;
    p.spCd = p.char.sp * (this.atkCdMul || 1);
    if (m.sp) {
      this.setAttack(p, m.sk, m.sp, p.face, p.char.sd);
      if (p.char.id === 'pulse') {
        this.ring(p.body.x, p.body.y, 16, 4, p.char.color, 140);
        this.spark(p.body.x, p.body.y, 0xffffff, 7);
        tone(this, 260, 'triangle', 0.06, 0.14);
      } else {
        this.flash(p.body.x + p.face * 10, p.body.y - 38, 24, 64, p.char.accent, 120);
        this.spark(p.body.x + p.face * 10, p.body.y - 24, 0xffdd00, 6);
        tone(this, 360, 'square', 0.06, 0.12);
      }
    } else {
      p.slam = 1;
      p._atkPoseT = 85;  // dive animation
      p.invuln = Math.max(p.invuln, 380);
      p.body.body.setVelocityY(600);
      this.flash(p.body.x, p.body.y + 10, 28, 34, p.char.color, 120);
      tone(this, 120, 'sawtooth', 0.06, 0.12);
    }
  }

  checkSlam(p, foe) {
    if (!p.slam) return;
    const b = p.body.body;
    if (grounded(b)) {
      p.slam = 0;
      this.setAttack(p, 'crush', MOVESET.crush.slam, 1, p.char.sd);
      this.ring(p.body.x, p.body.y + 12, 12, 5.5, p.char.accent, 140);
      this.flash(p.body.x, p.body.y + 10, 90, 22, p.char.accent, 120);
      this.cameras.main.shake(90, 0.009);
      tone(this, 100, 'square', 0.08, 0.16);
      this.updateAttack(p, foe);
    }
  }

  updateAttack(p, foe) {
    const a = p.atk;
    if (!a || a.hit || !p || !foe || !p.alive || !foe.alive || foe.invuln > 0) return;
    if (!p.body || !foe.body || !p.body.body || !foe.body.body) return;
    const ax = p.body.x + a.ox, ay = p.body.y + a.oy;
    if (!hitBox(ax, ay, a.w, a.h, foe.body.x, foe.body.y, 26, 40)) return;
    if (a.kind === 'basic' || a.kind === 'dash') {
      const dx = p.body.x - foe.body.x, dy = p.body.y - foe.body.y, d2 = dx * dx + dy * dy;
      a._sweet = d2 < 900 ? 1.25 : d2 > 3364 ? 0.80 : 1.0;
    } else a._sweet = 1.0;
    a.hit = 1;
    this.hitPlayer(foe, p, a);
  }

  hitPlayer(t, p, a) {
    // DAMAGE PERCENT SYSTEM
    if (!t || !p || !a || !t.alive || !p.alive) return;
    if (!t.body || !p.body || !t.body.body || !p.body.body) return;
    const b = t.body.body;
    const kind = a.kind || 'basic', basic = kind === 'basic', dash = kind === 'dash', blocked = t.shielding;
    const ratio = t.stamina / t.staminaMax;
    const pct  = 1 + Math.pow(Math.min(KB_PERCENT_CAP, t.percent) / KB_PERCENT_DIV, 1.16) * KB_PERCENT_GAIN;
    const mul  = (1 + (1 - ratio) * 0.62) * pct;
    const pwr  = p.buffs.power > 0 ? 1.40 : 1;
    const rage  = p.stamina > 0 && p.stamina < p.staminaMax * 0.4 && p.fatigue <= 0
      ? 1 + (1 - p.stamina / p.staminaMax) * 0.30 : 1;
    const sweet = Number.isFinite(a._sweet) ? a._sweet : 1.0;
    const shld  = blocked ? 0.30 : t.buffs.guard > 0 ? 0.76 : 1;
    const dir  = p.body.x <= t.body.x ? 1 : -1;
    let chain = 1;
    if (!blocked) {
      t.comboHits = t.comboT > 0 ? t.comboHits + 1 : 1;
      t.comboT = 520;
      chain = t.comboHits;
    } else { t.comboHits = 0; t.comboT = 0; }
    const comboKb = chain >= 4 ? 1.12 : chain === 3 ? 1.07 : chain === 2 ? 1.03 : 1;
    let vx = dir * BASE_KB_X * (a.fx || 1) * mul * pwr * sweet * rage * shld;
    let vy = -BASE_KB_Y * (a.fy || 0.75)  * mul * pwr * sweet * rage * shld;
    if (!blocked) { vx *= comboKb; vy *= comboKb; }
    if (dash) vy = -95 * mul * pwr * sweet * rage * shld;
    const held = this.ctrl.held;
    if (held[t.keys.left]) vx -= 80;
    if (held[t.keys.right]) vx += 80;
    if (held[t.keys.up]) vy -= 35;
    t.lastHitTime = this.time.now;
    const pg = basic ? 0.98 : dash ? 1.10 : 1.22;
    t.percent = Math.min(999, t.percent + a.dmg * pg * sweet * (pwr > 1 ? 1.08 : 1));
    t.stamina = Math.max(0, t.stamina - a.dmg * pwr * sweet * rage * shld);
    if (t.stamina <= 0) { t.fatigue = FATIGUE_MS; t.atk = null; t.slam = 0; }
    t.atkChain = 0; t.atkChainT = 0; t.atkQueue = 0;
    if (!blocked && chain === 3) { p.stamina = Math.min(p.staminaMax, p.stamina + 7); this.hudDirty = true; }
    else if (!blocked && chain === 5) { this.flash(p.body.x, p.body.y, 52, 52, p.char.color, 200); tone(this, 660, 'square', 0.06, 0.10); }
    t.stun = (basic ? 110 : dash ? 130 : 150)
      * Math.max(0.60, 1 - (chain - 1) * 0.10);
    if (this.finalPhase) { vx *= 1.18; vy *= 1.18; }
    // VOLT bonus vs airborne targets
    if (p.char.id === 'volt' && !grounded(t.body.body)) { vx *= 1.22; vy *= 1.22; }
    const impact = Math.max(0.65, mul * sweet * (basic ? 1 : dash ? 1.15 : 1.30));
    const heavy = impact > 1.95 || kind === 'crush' || kind === 'volt';
    const killish = heavy && (t.percent > 160 || Math.abs(vx) > 560 || Math.abs(vy) > 380);
    const baseBld = impact > 2.25 || kind === 'crush' ? 2 : impact > 1.45 || dash || sweet > 1.15 ? 1 : 0;
    const bloodLv = Math.min(2, baseBld + (t.percent > 130 && heavy && !blocked ? 1 : 0));
    if (blocked) { vx *= 0.88; vy *= 0.84; }
    b.setVelocity(vx, vy);
    p._recoilT = blocked ? 48 : killish ? 145 : heavy ? 95 : 58;
    p._atkPoseT = 0;  // hit connected — hand off to recoil pose
    if (blocked && p.body.body) p.body.body.velocity.x -= dir * (dash ? 92 : 58);
    if (heavy) this.spark(t.body.x, t.body.y, 0xff3300, killish ? 8 : 5);
    this.spark(t.body.x, t.body.y - 8, p.char.accent, killish ? 9 : heavy || sweet > 1.1 ? 6 : chain > 3 ? 5 : chain > 1 ? 4 : 3);
    if (bloodLv && !blocked) this.bloodImpact(t.body.x, t.body.y - 8, bloodLv, killish, dir);
    if (!blocked && heavy) this.ring(t.body.x, t.body.y + 14, 9, killish ? 3.6 : 2.6, 0xc59a63, 130);
    this.flash(t.body.x, t.body.y - 6, killish ? 56 : heavy ? 42 : 24, killish ? 34 : 24, p.char.accent, killish ? 135 : 90);
    if (!blocked && chain > 1) showPickupText(this, t.body.x, t.body.y - 8, chain + ' HIT', '#fe7');
    this.cameras.main.shake(killish ? 96 : heavy ? 78 : dash ? 56 : 26, (killish ? 0.0100 : heavy ? 0.0070 : dash ? 0.0046 : 0.0018) * (blocked ? 0.35 : 1));
    // Hit freeze — every hit type gets a freeze, strength-scaled, anti-stacking handled by hitFreeze()
    this.hitFreeze(killish ? 58 : heavy ? 50 : dash ? 36 : 20);
    // Distinct sound per hit type + blocked VFX
    if (blocked) {
      this.flash(t.body.x, t.body.y - 8, 58, 58, 0xdff7ff, 110);
      this.ring(t.body.x, t.body.y - 6, 12, 3.6, 0xaee6ff, 120);
      tone(this, 360, 'triangle', 0.05, 0.08);
    } else if (killish) {
      tone(this, 88, 'sawtooth', 0.13, 0.16);
    } else if (kind === 'dash') {
      tone(this, 182, 'sawtooth', 0.09, 0.10);
    } else {
      tone(this, heavy ? 240 : sweet > 1.1 ? 320 : 276, 'square', heavy ? 0.09 : 0.07, heavy ? 0.10 : 0.07);
    }
  }

  killPlayer(p) {
    if (!p.alive) return;
    p.alive = 0;
    p.lives--;
    p.atk = null;
    p.atkChain = 0; p.atkChainT = 0; p.atkQueue = 0;
    p.slam = 0;
    clearBuffs(p.buffs);
    p._auraType = null; p.shielding = false; p._recoilT = 0; p._atkPoseT = 0;
    p.aura.setVisible(false);
    const kox = p.body.x, koy = p.body.y;
    burst(this, kox, koy, p.char.color, 24);
    burst(this, kox, koy, 0xffffff, 10);
    this.cameras.main.shake(210, 0.0118);
    this.tweens.add({ targets: this.cameras.main, zoom: 1.08, duration: 100, yoyo: true });
    this.hitFreeze(84);
    this.flash(W / 2, H / 2, W, H, 0xffffff, 85);
    const kt = this.add.text(kox, koy - 28, 'RING OUT!', {
      fontFamily:'monospace', fontSize:'36px', fontStyle:'bold', color:'#ff2233'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: kt, y: koy - 85, alpha: 0, duration: 860, onComplete: () => kt.destroy() });
    p.body.body.enable = false;
    p.body.setPosition(-500, -500);
    p.visual.setVisible(false);
    p.overlay.setVisible(false);
    tone(this, 90, 'sawtooth', 0.22, 0.5);
    this.hudDirty = true;
    if (p.lives <= 0) {
      this.over = 1;
      const win = this.players[1 - p.idx];
      this.time.delayedCall(600, () => {
        if (this.sys.isActive()) this.scene.start('End', { winner: win.idx + 1, char: win.char });
      });
      return;
    }
    this.time.delayedCall(INVULN_MS, () => {
      if (this.sys.isActive()) this.respawnPlayer(p);
    });
  }

  respawnPlayer(p) {
    if (this.over) return;
    const s = SPAWNS[p.idx];
    p.alive = 1;
    p.jumps = 2;
    p.stamina = p.staminaMax;
    p.percent = 0;
    p.invuln = INVULN_MS;
    p.fatigue = 0;
    p.stun = 0;
    p.atk = null;
    p.atkChain = 0; p.atkChainT = 0; p.atkQueue = 0;
    p.slam = 0;
    p.lastHitTime = 0;
    clearBuffs(p.buffs);
    p._auraType = null; p.shielding = false; p.canAirDodge = true; p.canEdgeSnap = true; p.comboHits = 0; p.comboT = 0; p._recoilT = 0; p._atkPoseT = 0;
    p.aura.setVisible(false).setAngle(0);
    p.recovering = false;
    p._lastAlpha = -1; p._lastOvAlpha = -1; p._lastOvColor = -1;
    p.body.body.enable = true;
    p.body.body.reset(s.x, s.y);
    p.visual.setVisible(true).setAlpha(1).setAngle(0).setPosition(s.x, s.y);
    p.overlay.setVisible(true).setAlpha(0).setPosition(s.x, s.y);
    this.syncHead(p);
    this.hudDirty = true;
    burst(this, s.x, s.y, p.char.accent, 5);
    tone(this, 520, 'triangle', 0.08, 0.12);
  }

  syncHead(p) {
    p.visual.setPosition(p.body.x, p.body.y).setAngle(0);
    p.visual.setScale(p.face < 0 ? -1 : 1, 1);
    p.overlay.setPosition(p.body.x, p.body.y);
  }

  animatePlayer(p, b, now) {
    const sx = p.face < 0 ? -1 : 1;
    if (sx !== p._lastSx) { p.visual.setScale(sx, 1); p._lastSx = sx; }
    if (p.fatigue > 0) {
      p.visual.setAngle(Phaser.Math.Linear(p.visual.angle, 82 * sx, 0.18));
      p.visual.setPosition(p.body.x, p.body.y);
      p.overlay.setPosition(p.body.x, p.body.y);
      return;
    }
    if (p.recovering) {
      p.visual.setAngle(Phaser.Math.Linear(p.visual.angle, 0, 0.22));
      p.visual.setPosition(p.body.x, p.body.y);
      p.overlay.setPosition(p.body.x, p.body.y);
      return;
    }
    const vx = Math.abs(b.velocity.x);
    const bF = p.char.id === 'volt' ? 0.0048 : p.char.id === 'crush' ? 0.0020 : 0.0034;
    const bA = p.char.id === 'crush' ? 2.2 : 1.4;
    let yOff = 0, ang = 0;
    if (p._atkPoseT > 0 && p.stun <= 0) {
      // Active-frame attack pose: character commits to the swing (before hit connects)
      const af = Math.max(0, Math.min(1, p._atkPoseT / 52));
      ang = (p.char.id === 'crush' ? 9 : p.char.id === 'volt' ? 16 : 18) * af;
      yOff = p.char.id === 'pulse' ? -bA * 0.70 * af : p.char.id === 'crush' ? bA * 0.85 * af : 0;
    } else if (p._recoilT > 0 && p.stun <= 0 && p.fatigue <= 0) {
      // Post-hit follow-through lean — decays as _recoilT drops
      const rf = Math.max(0, Math.min(1, p._recoilT / 65));
      ang = (p.char.id === 'crush' ? 5 : p.char.id === 'volt' ? 11 : 8) * rf;
      const yShift = p.char.id === 'pulse' ? -bA * 0.45 * rf : p.char.id === 'crush' ? bA * 0.55 * rf : 0;
      yOff = Math.sin(now * bF) * bA * 0.4 + yShift;
    } else if (p.stun > 0) {
      // Stagger — intensity scales with accumulated damage percent
      const si = Math.min(2.2, 1 + p.percent / 190);
      yOff = Math.sin(now * 0.09) * 2 * si;
      ang  = Math.sin(now * 0.045) * 2.5 * si * p.face;
    } else if (vx > 20 && b.blocked.down) {
      yOff = Math.sin(now * bF * 4) * bA;
      ang  = Math.sin(now * bF * 4 + Math.PI / 2) * 2.5 * p.face;
    } else {
      yOff = Math.sin(now * bF) * bA;
    }
    p.visual.setPosition(p.body.x, p.body.y + yOff);
    p.visual.setAngle(sx < 0 ? -ang : ang);
    p.overlay.setPosition(p.body.x, p.body.y);
  }

  triggerMidPhase() {
    this.midPhase = true;
    const mp = this.mainPlat;
    if (mp) {
      mp.speed = 0.34; mp.range = 18; mp.phase = Math.PI * 0.5;
      this.movingPlats.push(mp);
    }
    const txt = this.add.text(W / 2, H / 2 - 24, 'STAGE SHIFT', {
      fontFamily: 'monospace', fontSize: '34px', fontStyle: 'bold', color: '#ff8a3d',
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: txt, alpha: 0, y: H / 2 - 64, duration: 1200, onComplete: () => txt.destroy() });
    this.cameras.main.shake(88, 0.0057);
    tone(this, 740, 'square', 0.09, 0.16);
  }

  triggerFinalPhase() {
    this.finalPhase = true;
    drawHudFrame(this.hudFrame, true);
    const txt = this.add.text(W/2, H/2, 'FINAL MINUTE', {
      fontFamily:'monospace', fontSize:'46px', fontStyle:'bold', color:'#ff4444'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets:txt, alpha:0, y:H/2-80, duration:2000, onComplete:()=>txt.destroy() });
    this.cameras.main.shake(132, 0.0078);
    tone(this, 880, 'square', 0.12, 0.28);
    this.time.delayedCall(300, ()=>tone(this, 660, 'square', 0.10, 0.28));
    const mp = this.mainPlat;
    if (mp) {
      let i = this.movingPlats.indexOf(mp); if (~i) this.movingPlats.splice(i, 1);
      i = this.platData.indexOf(mp); if (~i) this.platData.splice(i, 1);
      mp.hitbox.body.enable = 0; mp.visual.visible = 0; this.mainPlat = 0;
    }
    for (const d of FINAL_PLATS) addStagePlatform(this, d);
    this.plats.refresh();
  }

  endMatch() {
    if (this.over) return;
    this.over = 1;
    const [p1,p2] = this.players;
    const w = p1.lives>p2.lives?p1 : p2.lives>p1.lives?p2 :
              p1.stamina>p2.stamina?p1 : p2.stamina>p1.stamina?p2 :
              p1.percent<p2.percent?p1 : p2.percent<p1.percent?p2 : null;
    this.add.text(W/2, H/2, w?'TIME!':'DRAW!', {
      fontFamily:'monospace', fontSize:'62px', fontStyle:'bold', color:w?(w.idx?C.p2:C.p1):'#fff0aa'
    }).setOrigin(0.5).setDepth(20);
    tone(this, 660, 'square', 0.08, 0.5);
    this.time.delayedCall(700, ()=>w
      ? this.scene.start('End',{winner:w.idx+1,char:w.char})
      : this.scene.start('Menu'));
  }

  bloodImpact(x,y,l,h,dir=1){
    const n=l===2?(h?10:8):(h?7:6), s=l===2?(h?46:36):(h?32:22);
    emitRects(this, x, y, n, {
      ang: () => -Math.PI/2 + (Math.random() - .5) * Math.PI * .9 + dir * (0.28 + Math.random() * 0.22),
      col: i => i % 3 === 0 ? 0xff6b6b : i % 3 === 1 ? 0xff2020 : 0xff4747,
      depth: 18, w0: 3, w1: 6, h0: 3, h1: 6, d0: 14, d1: s, dy: () => Phaser.Math.Between(10, s), yb: 12, t0: 330, t1: 460,
    });
  }

  hitFreeze(ms) {
    if (!this.physics || !this.physics.world) return;
    ms = Math.max(0, ms | 0);
    const end = this.time.now + ms;
    this._fzToken = (this._fzToken || 0) + 1;
    if (!this.physics.world.isPaused) this.physics.pause();
    if (end > (this._fzEnd || 0)) this._fzEnd = end;
    const token = this._fzToken;
      // Already frozen — extend end if this freeze is longer, skip re-pause
    // Only the last scheduled callback actually resumes (prevents early resume from stacking)
    this.time.delayedCall(ms, () => {
      if (!this.sys.isActive() || !this.physics || !this.physics.world) return;
      if (this.time.now + 6 < (this._fzEnd || 0)) return;
      if (token !== this._fzToken && this.physics.world.isPaused) return;
      this._fzEnd = 0;
      if (this.physics.world.isPaused) this.physics.resume();
    });
  }

  spark(x, y, color, n) {
    emitRects(this, x, y, n, {
      ang: i => (Math.PI * 2 * i) / n + Math.random() * 0.6,
      col: () => color, w0: 2, w1: 5, h0: 2, h1: 2, d0: 10, d1: 30, t0: 60, t1: 140,
    });
  }

  startCountdown() {
    const txt = this.add.text(W / 2, H / 2 - 30, '', {
      fontFamily: 'monospace', fontSize: '90px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(20);
    const steps = [['3','#ff6040',330],['2','#ff9020',440],['1','#ffe060',550],['BRAWL!','#ffffff',880]];
    steps.forEach(([s,c,f],i)=>{
      this.time.delayedCall(i * 900, () => {
        txt.setText(s).setColor(c).setScale(1.8).setAlpha(1);
        this.tweens.add({ targets: txt, scaleX: 1, scaleY: 1, duration: 500, ease: 'Power2.easeOut' });
        tone(this, f, 'square', 0.12, i === 3 ? 0.28 : 0.14);
        if (i === steps.length - 1) {
          this.time.delayedCall(600, () => {
            this.tweens.add({ targets: txt, alpha: 0, duration: 280, onComplete: () => txt.destroy() });
            this.ready = true;
            this.players.forEach(p => { p.body.body.allowGravity = true; p.body.body.setVelocity(0, 0); });
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
    const p = this.pickup;
    if (!p.plat || !p.plat.hitbox || !p.orb || !p.orb.active) {
      this.stopPickupTweens(p);
      if (p.orb && p.orb.active) p.orb.destroy();
      this.pickup = null;
      this.scheduleNextPickup();
      return;
    }
    const nx = p.plat.hitbox.x + p.offX, ny = p.plat.hitbox.y - 22;
    const now = this.time.now, bob = Math.sin(now * p.floatSpd + p.seed) * p.floatAmp;
    const drift = p.jitterAmp ? Math.sin(now * p.jitterSpd + p.seed * 2.1) * p.jitterAmp : 0;
    const pulse = 1 + Math.sin(now * p.pulseSpd + p.seed * 1.4) * p.pulseAmp;
    const glowBeat = Math.sin(now * p.glowSpd + p.seed * 0.8);
    const ringBeat = Math.sin(now * p.ringSpd + p.seed + 1.2);
    p.orb.setPosition(nx + drift, ny + bob);
    p.x = nx; p.y = ny; p.vx = drift; p.vy = bob;
    if (p.body && p.body.active) p.body.setScale(pulse).setRotation(p.rotAmp ? Math.sin(now * p.rotSpd + p.seed) * p.rotAmp : 0);
    if (p.glow && p.glow.active) p.glow.setAlpha(p.glowBase + glowBeat * p.glowAmp).setScale(1.02 + glowBeat * 0.08);
    if (p.halo && p.halo.active) p.halo.setAlpha(p.haloBase + glowBeat * p.haloAmp).setScale(1.08 + glowBeat * 0.12);
    if (p.ring && p.ring.active) p.ring.setAlpha(p.ringBase + ringBeat * p.ringAmp).setScale(0.98 + ringBeat * 0.06);
    if ((p.life -= dt) <= 0) {
      this.stopPickupTweens(p);
      if (p.orb && p.orb.active) p.orb.destroy();
      this.pickup = null;
      this.scheduleNextPickup();
    }
  }

  spawnPickup() {
    const pl = this.platData[Phaser.Math.Between(0, this.platData.length - 1)];
    const offX = Phaser.Math.Between(-30, 30);
    const rnd = Math.random();
    const type = rnd<0.30?'recovery':rnd<0.50?'power':rnd<0.70?'speed':rnd<0.88?'regen':'guard';
    const cfg = PICKUP_CFG[type];
    const spawn = cfg.spawn || PICKUP_SPAWN, idle = cfg.idle || PICKUP_IDLE;
    const [floatAmp, floatSpd, pulseAmp, pulseSpd, glowBase, glowAmp, haloBase, haloAmp, ringBase, ringAmp, jitterAmp, jitterSpd, rotAmp, rotSpd, peak, popDur] = idle;
    const ox = pl.hitbox.x + offX, oy = pl.hitbox.y - 22;
    const orb = this.add.container(ox, oy).setDepth(6);
    const shell = this.add.container(0, 0).setScale(0.2).setAlpha(0);
    const halo = this.add.circle(0, 0, 24, cfg.col, 0.08);
    const glow = this.add.circle(0, 0, 18, cfg.col, 0.18);
    const ring = this.add.circle(0, 0, 22, cfg.col, 0).setStrokeStyle(2, cfg.col, 0.24);
    const body = this.add.container(0, 0);
    body.add(drawPickupIcon(this, type, cfg.col));
    shell.add([halo, glow, ring, body]); orb.add(shell);
    const pickup = {
      orb, shell, halo, glow, ring, body, type, x: ox, y: oy, vx: 0, vy: 0, plat: pl, offX, life: 5500,
      seed: Math.random() * Math.PI * 2, floatAmp, floatSpd, pulseAmp, pulseSpd, glowBase, glowAmp, haloBase, haloAmp,
      ringBase, ringAmp, ringSpd: pulseSpd * 0.8, jitterAmp, jitterSpd, rotAmp, rotSpd,
    };
    this.pickup = pickup;
    this.startPickupSpawnTween(pickup, peak, popDur);
    const pop = this.add.circle(ox, oy, 10, cfg.col, 0.18).setStrokeStyle(2, 0xffffff, 0.75).setDepth(7);
    fxGone(this, pop, { scaleX: spawn[2], scaleY: spawn[2], alpha: 0, duration: spawn[3] });
    this.pickupBits(ox, oy, cfg.col, spawn[0], 10, spawn[1], 180, 8);
  }

  checkPickup(p) {
    if (!this.pickup) return;
    const dx = p.body.x - this.pickup.x, dy = p.body.y - this.pickup.y;
    if (dx * dx + dy * dy > 24 * 24) return;
    const pk = this.pickup, { type, x, y, orb } = pk;
    const ox = x + pk.vx, oy = y + pk.vy;
    this.stopPickupTweens(pk);
    if (orb && orb.active) orb.setPosition(ox, oy);
    this.pickup = null;
    this.scheduleNextPickup();
    const cfg = PICKUP_CFG[type];
    const take = cfg.take || PICKUP_TAKE, snd = cfg.s;
    if (orb && orb.active)
      fxGone(this, orb, { scaleX: 1.14, scaleY: 1.14, alpha: 0, duration: 95, ease: 'Quad.easeOut' });
    this.pickupBits(ox, oy, cfg.col, take[0], 18, take[1], 250, 8);
    this.pickupFlash(ox, oy, cfg.col);
    showPickupText(this, ox, oy, cfg.txt, cfg.tc);
    tone(this, snd[0], snd[1], 0.07, snd[2]);
    if (cfg.shake) this.cameras.main.shake(70, cfg.shake);
    applyPickupToPlayer(p, cfg);
    this.hudDirty = true;
  }

  flash(x, y, w, h, c, dur) {
    const r = this.add.rectangle(x, y, w, h, c, 0.8);
    fxGone(this, r, { alpha: 0, scaleX: 1.3, scaleY: 1.3, duration: dur });
  }

  ring(x, y, r, endScale, c, dur) {
    const circ = this.add.circle(x, y, r, c, 0.15).setStrokeStyle(3, c);
    fxGone(this, circ, { scaleX: endScale, scaleY: endScale, alpha: 0, duration: dur });
  }

  pickupTween(cfg, fail) {
    return fxTween(this, cfg, fail);
  }

  stopPickupTweens(p) {
    if (!p) return;
    if (p.orb) this.tweens.killTweensOf(p.orb);
    if (p.shell) this.tweens.killTweensOf(p.shell);
    if (p.glow) this.tweens.killTweensOf(p.glow);
    if (p.halo) this.tweens.killTweensOf(p.halo);
    if (p.ring) this.tweens.killTweensOf(p.ring);
  }

  startPickupSpawnTween(p, peak, popDur) {
    const sh = p && p.shell;
    if (!sh || !sh.active) return;
    sh.setScale(0.2).setAlpha(0);
    this.pickupTween({
      targets: sh, scaleX: peak, scaleY: peak, alpha: 1, duration: popDur, ease: 'Back.Out',
      onComplete: () => {
        if (this.pickup !== p || !sh.active) return;
        this.pickupTween({ targets: sh, scaleX: 1, scaleY: 1, duration: 95, ease: 'Quad.easeOut' }, () => sh.active && sh.setScale(1));
      },
    }, () => sh.active && sh.setScale(1).setAlpha(1));
  }

  pickupBits(x, y, col, n, minDist, maxDist, dur, depth) {
    emitRects(this, x, y, n, {
      col: i => i % 3 ? col : 0xffffff, alpha: 0.95, depth, w0: 3, w1: 5, h0: 3, h1: 5, d0: minDist, d1: maxDist,
      t0: dur, t1: dur + 60, sx: 0.25, sy: 0.25, ease: 'Quad.easeOut', spin: [-80, 80],
    });
  }

  pickupFlash(x, y, col) {
    const tint = this.add.circle(x, y, 16, col, 0.26).setDepth(7);
    const core = this.add.rectangle(x, y, 28, 28, 0xffffff, 0.86).setAngle(45).setDepth(8);
    fxGone(this, tint, { scaleX: 1.9, scaleY: 1.9, alpha: 0, duration: 130 });
    fxGone(this, core, { scaleX: 1.45, scaleY: 1.45, alpha: 0, duration: 95 });
  }

  refreshHud() {
    const dots = n => '●'.repeat(n) + '○'.repeat(LIVES - n);
    const cool = p => p.spCd > 0 ? 'SP ' + Math.ceil(p.spCd / 1000) : 'SP OK';
    const p1 = this.players[0], p2 = this.players[1];
    drawHudFrame(this.hudFrame, this.finalPhase);
    drawHudBar(this.hudBar1, p1._hud.seg, 24); drawHudBar(this.hudBar2, p2._hud.seg, W - 122);
    drawBuffBadges(this.hudBuff1, p1.buffs, 188, 74, 1);
    drawBuffBadges(this.hudBuff2, p2.buffs, W - 188, 74, -1);
    setHudLabel(this.hudP1, 'P1  ' + p1.char.name + '  ' + dots(p1.lives));
    setHudLabel(this.hudP2, 'P2  ' + p2.char.name + '  ' + dots(p2.lives));
    setHudLabel(this.hudPct1, p1._hud.pct + '%', hudPctColor(p1._hud.pct, C.p1));
    setHudLabel(this.hudPct2, p2._hud.pct + '%', hudPctColor(p2._hud.pct, C.p2));
    setHudLabel(this.hudS1, cool(p1) + (p1.fatigue > 0 ? '  EXH' : ''));
    setHudLabel(this.hudS2, cool(p2) + (p2.fatigue > 0 ? '  EXH' : ''));
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
      const fig = buildFighter(this, W / 2, 344, ch, 1.45);
      fig.setDepth(5);
      const ttl = addLabel(this, W / 2, 168, ch.name + ' WINS', 52, col, 'center').setOrigin(0.5).setAlpha(0);
      const sub = addLabel(this, W / 2, 214, 'DOMINATES THE DUNES', 15, C.dim, 'center').setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: fig, y: 196, duration: 280, ease: 'Cubic.easeOut',
        onComplete: () => this.tweens.add({ targets: fig, angle: fig.scaleX < 0 ? -420 : 420, y: 292, duration: 460, ease: 'Cubic.easeIn',
          onComplete: () => this.tweens.add({ targets: fig, y: 336, scaleX: fig.scaleX * 1.08, scaleY: 1.34, angle: 0, duration: 120,
            onComplete: () => this.tweens.add({ targets: fig, y: 320, scaleX: fig.scaleX, scaleY: 1.45, duration: 210, ease: 'Bounce.easeOut',
              onComplete: () => this.tweens.add({ targets: fig, y: 314, duration: 240, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }) }) }) }) });
      this.time.delayedCall(840, () => {
        this.tweens.add({ targets: [ttl, sub], alpha: 1, duration: 220 });
        this.cameras.main.shake(150, 0.006);
      });
    } else {
      addLabel(this, W / 2, 220, 'P' + this.winner + ' WINS', 52, col, 'center').setOrigin(0.5);
    }
    addLabel(this, W / 2, 400, 'PRESS START  ·  RETURN TO SELECT', 14, C.dim, 'center').setOrigin(0.5);
    const win = this;
    [0, 100, 200, 350].forEach((delay, i) => {
      win.time.delayedCall(300 + delay, () => tone(win, [440, 554, 660, 880][i], 'square', 0.07, i === 3 ? 0.3 : 0.12));
    });
  }
  update() {
    if (anyOf(this, START_KEYS)) this.scene.start('Menu');
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
