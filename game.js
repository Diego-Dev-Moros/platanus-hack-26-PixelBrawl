// Pixel Brawl - local 1v1 platform fighter

const W = 800, H = 600;
const GRAVITY = 980, SPEED = 220, JUMP = -420, LIVES = 3;
const ATK_CD = 280, DASH_CD = 900, FATIGUE_MS = 1000, INVULN_MS = 1200, EXHAUST_RECOVER = 35;
const BUFF_POWER_DUR = 10000, BUFF_SPEED_DUR = 10000, BUFF_REGEN_DUR = 8000, BUFF_GUARD_DUR = 9000;

const PICKUP_CFG = {
  recovery: { col: 0xff5f77, txt: 'STAMINA +35', tc: '#ff8094', f: 660, ft: 'triangle', fd: 0.18 },
  power:    { col: 0xff7a45, txt: 'POWER UP!',   tc: '#ff9f75', f: 880, ft: 'square',   fd: 0.12, bk: 'power', dur: BUFF_POWER_DUR },
  speed:    { col: 0xffd54a, txt: 'SPEED UP!',   tc: '#ffe37b', f: 660, ft: 'square',   fd: 0.10, bk: 'speed', dur: BUFF_SPEED_DUR },
  regen:    { col: 0x00d7c7, txt: 'REGEN UP!',   tc: '#00d7c7', f: 550, ft: 'triangle', fd: 0.14, bk: 'regen', dur: BUFF_REGEN_DUR },
  guard:    { col: 0x57c9ff, txt: 'SHIELD UP!',  tc: '#9ce5ff', f: 490, ft: 'square',   fd: 0.15, bk: 'guard', dur: BUFF_GUARD_DUR },
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
  const P = {
    // CHARACTER REDESIGN
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

function hitRect(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
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

function createDesertBackground(scene) {
  // BACKGROUND REDESIGN
  const sk = scene.add.graphics();
  [
    [0x44536a, 0, 180],[0x657087, 180, 82],[0xe3a363, 262, 72],
    [0xc2774b, 334, 82],[0x704839, 416, 88],[0x35253a, 504, 96],
  ].forEach(([col, y, h]) => { sk.fillStyle(col, 1); sk.fillRect(0, y, W, h); });
  sk.fillStyle(0xf3d1a0, 0.24); sk.fillCircle(152, 98, 96);
  sk.fillStyle(0xf3d1a0, 0.46); sk.fillCircle(152, 98, 62);
  sk.fillStyle(0xfff1cb, 0.9);  sk.fillCircle(152, 98, 24);
  scene.bgClouds = scene.add.container(0, 0);
  const cg = scene.add.graphics(); scene.bgClouds.add(cg);
  [0, W].forEach(ox => {
    [[92,110,190,34],[250,148,180,28],[540,112,220,30],[690,160,130,22]].forEach(([x,y,w,h]) => {
      cg.fillStyle(0xe7d7c0, 0.09); cg.fillRoundedRect(ox + x - w / 2, y, w, h, 14);
      cg.fillStyle(0x846f72, 0.08); cg.fillRoundedRect(ox + x - w / 2 + 24, y + 12, w * 0.66, h * 0.65, 12);
    });
  });
  scene.bgFar = scene.add.container(0, 0);
  const fg = scene.add.graphics(); scene.bgFar.add(fg);
  const drawSil = ox => {
    [[48,42,108],[96,26,86],[144,58,132],[246,44,96],[326,30,78],[384,70,148],[522,36,90],[594,54,128],[668,28,80],[736,64,154]].forEach(([bx,bw,bh]) => {
      fg.fillStyle(0x3f485e, 1); fg.fillRect(ox + bx - bw / 2, H - 252 - bh, bw, bh);
      fg.fillStyle(0x586277, 0.4); fg.fillRect(ox + bx - bw / 2 + 4, H - 252 - bh + 10, bw - 8, 10);
    });
  };
  drawSil(0); drawSil(W);
  scene.bgMid = scene.add.container(0, 0);
  const mg = scene.add.graphics(); scene.bgMid.add(mg);
  const ruins = ox => {
    mg.fillStyle(0x63504d, 1); mg.fillRect(ox + 104, 302, 114, 126);
    mg.fillStyle(0x413541, 1); mg.fillRect(ox + 132, 244, 34, 58);
    mg.fillStyle(0x3f3a44, 1); mg.fillRect(ox + 174, 264, 20, 38);
    mg.fillStyle(0x90766d, 0.45); mg.fillRect(ox + 118, 318, 84, 10);
    mg.fillStyle(0x4f3a31, 1); mg.fillRect(ox + 416, 324, 138, 92);
    mg.fillStyle(0x88614d, 0.4); mg.fillRect(ox + 430, 338, 92, 10);
    mg.fillStyle(0x453428, 1); mg.fillRect(ox + 588, 286, 26, 148);
    mg.fillStyle(0x453428, 1); mg.fillRect(ox + 646, 272, 26, 162);
    mg.fillStyle(0x6d5240, 1); mg.fillRect(ox + 584, 272, 92, 20);
    mg.fillStyle(0x36281f, 1); mg.fillRect(ox + 602, 356, 14, 78);
    mg.fillStyle(0x36281f, 1); mg.fillRect(ox + 642, 344, 14, 90);
    [[245,386,58,26],[288,396,72,30],[528,400,54,24],[676,402,70,28]].forEach(([x,y,w,h]) => {
      mg.fillStyle(0x8a6c4e, 1); mg.fillTriangle(ox + x, y, ox + x + w / 2, y - h, ox + x + w, y);
    });
    mg.fillStyle(0x544541, 1); mg.fillRect(ox + 318, 258, 164, 118);
    mg.fillStyle(0x312a34, 1); mg.fillRect(ox + 344, 230, 110, 28);
    mg.fillStyle(0x312a34, 1); mg.fillRect(ox + 332, 286, 18, 76);
    mg.fillStyle(0x312a34, 1); mg.fillRect(ox + 448, 286, 18, 76);
    mg.fillStyle(0x8d765f, 0.42); mg.fillRect(ox + 340, 300, 108, 10);
    mg.fillStyle(0xb99662, 0.82); mg.fillTriangle(ox + 302, 408, ox + 400, 346, ox + 498, 408);
  };
  ruins(0); ruins(W);
  const dune = (y, a, f, col, al) => {
    mg.fillStyle(col, al);
    [0, W].forEach(ox => {
      mg.beginPath(); mg.moveTo(ox - 20, y + a * Math.sin((ox - 20) * f));
      for (let x = ox - 14; x <= ox + W + 20; x += 6) mg.lineTo(x, y + a * Math.sin(x * f));
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
  for (let i = 0; i < 26; i++) {
    const r = scene.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(170, H - 56), Phaser.Math.Between(2, 4), Phaser.Math.Between(1, 3), 0xe7c08d, Phaser.Math.FloatBetween(0.12, 0.38));
    scene.bgParticles.add(r); scene.dustParticles.push({ r, spd: Phaser.Math.FloatBetween(14, 44), drift: Phaser.Math.FloatBetween(-4, 4) });
  }
  for (let i = 0; i < 12; i++) {
    const len = Phaser.Math.Between(28, 66);
    const r = scene.add.rectangle(Phaser.Math.Between(-W, W), Phaser.Math.Between(120, H - 84), len, 1, 0xf3d3a1, Phaser.Math.FloatBetween(0.08, 0.22));
    scene.bgParticles.add(r); scene.windStreaks.push({ r, spd: Phaser.Math.FloatBetween(78, 168), drift: Phaser.Math.FloatBetween(-8, 8) });
  }
}

function updateBackground(scene, delta) {
  if (!scene.bgFar) return;
  const s = delta / 1000;
  scene.bgClouds.x -= 8 * s; if (scene.bgClouds.x <= -W) scene.bgClouds.x += W;
  scene.bgFar.x -= 18 * s; if (scene.bgFar.x <= -W) scene.bgFar.x += W;
  scene.bgMid.x -= 42 * s; if (scene.bgMid.x <= -W) scene.bgMid.x += W;
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
  let sh = 0x4c1730, hi = 0xffd8de, base, light, accent;

  if (type === 'recovery') {
    sh = 0x8f2139; hi = 0xffd7de;
    base = [[-7,-5,5,4],[2,-5,5,4],[-6,-2,12,5],[-4,3,8,4],[-2,7,4,3]];
    light = [[-6,-4,2,1],[-5,-2,1,1]];
  } else if (type === 'power') {
    sh = 0xa33718; hi = 0xffd39e;
    base = [[-6,-5,8,3],[-7,-2,10,6],[2,0,4,4],[-3,4,6,4]];
    light = [[-5,-4,3,1],[-5,-1,1,1]];
  } else if (type === 'speed') {
    sh = 0x9d6712; hi = 0xfff0af;
    base = [[-7,2,6,3],[-2,-1,6,4],[3,-4,4,6],[7,-1,2,2]];
    light = [[-6,3,2,1],[-1,0,2,1]];
  } else if (type === 'regen') {
    sh = 0x0d6d72; hi = 0xbefcf7;
    base = [[-3,-7,6,4],[-6,-3,12,10]];
    light = [[-4,-6,2,2],[-4,-2,1,4]];
    accent = [[-4,1,8,3]];
  } else {
    sh = 0x1f6aa0; hi = 0xdaf8ff;
    base = [[-7,-6,14,4],[-6,-2,12,5],[-4,3,8,4],[-2,7,4,3]];
    light = [[-6,-5,3,1],[-5,-2,1,3]];
  }
  const shadow = off(base, 1, 1);
  c.add(scene.add.rectangle(0, 0, 24, 24, col, 0.18)); c.add(g);
  fill(0x07111a, [[-8,-10,16,20],[-10,-8,20,16]], 0.78);
  fill(col, [[-7,-9,14,2]], 0.12);
  fill(sh, shadow);
  fill(col, base);
  if (accent) fill(hi, accent);
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

function updatePlatforms(scene) {
  if (!scene.platData) return;
  const t = scene.time.now * 0.001, sp = scene.finalPhase ? 1.6 : 1;
  let moved = false;
  for (const p of scene.platData) {
    if (!p.speed || !p.hitbox) continue;
    const nx = p.baseX + Math.sin(t * p.speed * sp + p.phase) * p.range;
    const ny = p.baseY + (scene.finalPhase && p.vRange ? Math.sin(t * p.vSpeed + p.vPhase) * p.vRange : 0);
    p.hitbox.x = nx; p.hitbox.y = ny; p.visual.x = nx; p.visual.y = ny;
    moved = true;
  }
  if (moved) scene.plats.refresh();
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

// REDESIGN AUDIT
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.picks = data.picks || ['pulse', 'volt']; }

  create() {
    bindKeys(this);
    this.over = 0; this.matchTime = 180000; this.finalPhase = false;
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
    this.scheduleNextPickup();
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
    const PDEFS = [
      { x: 400, y: 470, w: 420, h: 28, type: 'main', speed: 0,   range: 0,  phase: 0 },
      { x: 240, y: 352, w: 120, h: 20, type: 'side', speed: 0.8, range: 44, phase: 0,        vRange: 18, vSpeed: 0.7, vPhase: 0 },
      { x: 560, y: 352, w: 120, h: 20, type: 'side', speed: 0.8, range: 44, phase: Math.PI,  vRange: 18, vSpeed: 0.7, vPhase: Math.PI },
      { x: 400, y: 270, w: 100, h: 18, type: 'top',  speed: 0.6, range: 28, phase: 0,        vRange: 14, vSpeed: 0.5, vPhase: 0 },
    ];
    for (const d of PDEFS) {
      const hitbox = this.add.rectangle(d.x, d.y, d.w, d.h, 0x000000, 0);
      this.plats.add(hitbox);
      const visual = buildPlatShip(this, d.w, d.h, d.type);
      visual.setPosition(d.x, d.y);
      this.platData.push({ hitbox, visual, baseX: d.x, baseY: d.y, speed: d.speed, range: d.range, phase: d.phase, vRange: d.vRange, vSpeed: d.vSpeed, vPhase: d.vPhase });
    }
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
      atkCd: 0, dashCd: 0, spCd: 0, dashT: 0, atk: null, slam: 0,
      lastHitTime: 0, buffs: { power: 0, speed: 0, regen: 0, guard: 0 }, _auraType: null, recovering: false,
      canAirDodge: true, canEdgeSnap: true, shielding: false, comboHits: 0, comboT: 0, _recoilT: 0, _atkPoseT: 0,
      _hud: { seg: 10, sp: -1, bk: 0, fat: false, pct: 0 }, _lastAlpha: -1, _lastOvAlpha: -1, _lastOvColor: -1, _lastSx: 0,
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
    if (this.hudDirty) { this.refreshHud(); this.hudDirty = false; }
    if (!this.over && this.ready) {
      this.matchTime -= dt;
      if (!this.finalPhase && this.matchTime <= 60000) this.triggerFinalPhase();
      if (this.matchTime <= 0) this.endMatch();
      const s = Math.max(0, Math.ceil(this.matchTime / 1000));
      this.hudTimer.setText(~~(s/60)+':'+String(s%60).padStart(2,'0')).setColor(this.finalPhase?'#ff4444':C.text);
    }
    flush(this);
  }

  tickPlayer(p, foe, dt) {
    if (!p.alive) return;
    const now = this.time.now;
    this.tickTimers(p, dt);
    const shldCode = p.idx ? 'P2_6' : 'P1_4';
    p.shielding = p.fatigue <= 0 && p.stun <= 0 && p.stamina > 0 && !!this.ctrl.held[shldCode];
    if (p.shielding) {
      p.stamina = Math.max(0, p.stamina - dt * 0.025);
      if (p.stamina <= 0) { p.fatigue = FATIGUE_MS * 0.6; p.shielding = false; }
    }
    if (this.ready && (p.body.x < -DEATH_X || p.body.x > W + DEATH_X || p.body.y > DEATH_Y)) { this.killPlayer(p); return; }
    this.movePlayer(p);
    this.handleActions(p);
    this.updateAttack(p, foe);
    this.checkSlam(p, foe);
    this.checkPickup(p);
    this.animatePlayer(p, now);
    const auraType = p.buffs.guard > 0 ? 'guard' : p.buffs.power > 0 ? 'power' : p.buffs.speed > 0 ? 'speed' : p.buffs.regen > 0 ? 'regen' : null;
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
    const lowStam = p.stamina > 0 && p.stamina < p.staminaMax * 0.35 && p.fatigue <= 0;
    const na = p.invuln > 0 && (Math.floor(now / 80) % 2) ? 0.3 :
               lowStam && (Math.floor(now / 600) % 2) ? 0.65 : 1;
    if (na !== p._lastAlpha) { p.visual.setAlpha(na); p._lastAlpha = na; }
    if (this.ready && p.canEdgeSnap && !p.body.body.blocked.down && p.body.body.velocity.y > 80)
      for (const pd of this.platData) {
        const ed = Math.abs(p.body.x - pd.hitbox.x) - pd.hitbox.width / 2;
        const yd = p.body.y - (pd.hitbox.y - 10);
        if (ed > 0 && ed < 24 && yd > 0 && yd < 50) {
          p.canEdgeSnap = false;
          p.body.body.velocity.x += (p.body.x < pd.hitbox.x ? 1 : -1) * 80;
          break;
        }
      }
    const no = p.shielding ? 0.45 : p.fatigue > 0 ? 0.5 : 0;
    const nc = p.shielding ? 0x4488ff : 0xff4400;
    if (no !== p._lastOvAlpha || nc !== p._lastOvColor) {
      p.overlay.setFillStyle(nc).setAlpha(no);
      p._lastOvAlpha = no; p._lastOvColor = nc;
    }
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
    if (p.buffs.guard > 0) p.buffs.guard = Math.max(0, p.buffs.guard - dt);
    if (p.atk) { p.atk.t -= dt; if (p.atk.t <= 0) p.atk = null; }
    if (p.comboT > 0) { p.comboT -= dt; if (p.comboT <= 0) p.comboHits = 0; }
    if (p._recoilT > 0) p._recoilT -= dt;
    if (p._atkPoseT > 0) p._atkPoseT -= dt;
    const wasExh = p.fatigue > 0;
    if (p.fatigue > 0) p.fatigue -= dt;
    if (wasExh && p.fatigue <= 0) {
      p.stamina = Math.min(p.staminaMax, p.stamina + EXHAUST_RECOVER);
      p.recovering = true;
      this.time.delayedCall(220, () => { p.recovering = false; });
      tone(this, 500, 'triangle', 0.06, 0.18);
    }
    if (p.fatigue <= 0 && p.stamina < p.staminaMax) {
      if (p.buffs.regen > 0)
        p.stamina = Math.min(p.staminaMax, p.stamina + dt * 0.022);
      else if (this.time.now - p.lastHitTime > 2000)
        p.stamina = Math.min(p.staminaMax, p.stamina + dt * 0.008);
    }
    const ns = Math.ceil(p.stamina / p.staminaMax * 10);
    const nsp = p.spCd > 0 ? Math.ceil(p.spCd / 1000) : -1;
    const nbk = (p.buffs.power > 0 ? 8 : 0) | (p.buffs.speed > 0 ? 4 : 0) | (p.buffs.regen > 0 ? 2 : 0) | (p.buffs.guard > 0 ? 1 : 0);
    const nf  = p.fatigue > 0;
    const np = Math.round(p.percent);
    if (ns !== p._hud.seg || nsp !== p._hud.sp || nbk !== p._hud.bk || nf !== p._hud.fat || np !== p._hud.pct) {
      p._hud.seg = ns; p._hud.sp = nsp; p._hud.bk = nbk; p._hud.fat = nf; p._hud.pct = np;
      this.hudDirty = true;
    }
  }

  movePlayer(p) {
    if (!this.ready) return;
    const b = p.body.body;
    const L = p.idx ? 'P2_L' : 'P1_L';
    const R = p.idx ? 'P2_R' : 'P1_R';
    const U = p.idx ? 'P2_U' : 'P1_U';
    if (b.blocked.down || b.touching.down) { p.jumps = 2; p.canAirDodge = true; p.canEdgeSnap = true; }
    if (p.stun > 0) return;
    if (p.dashT > 0) return;
    if (p.shielding) { b.setVelocityX(0); return; }
    const spd = SPEED * (p.buffs.speed > 0 ? 1.35 : 1) * (this.finalPhase ? 1.18 : 1);
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
    const atkCode = p.idx ? 'P1_5' : 'P2_4';
    const altCode = p.idx ? 'P1_6' : 'P2_5';
    const L = p.idx ? 'P2_L' : 'P1_L', R = p.idx ? 'P2_R' : 'P1_R';
    const moving = this.ctrl.held[L] || this.ctrl.held[R];
    if (p.stun > 0 || p.fatigue > 0 || p.shielding) return;
    if (this.ctrl.pressed[atkCode] && p.atkCd <= 0) this.basicAttack(p);
    if (this.ctrl.pressed[altCode]) {
      const onGround = p.body.body.blocked.down || p.body.body.touching.down;
      if (!onGround && p.canAirDodge && (this.ctrl.held[L] || this.ctrl.held[R]))
        this.doAirDodge(p);
      else if (moving && p.dashCd <= 0) this.doDash(p);
      else if (p.spCd <= 0) this.doSpecial(p);
      else if (p.dashCd <= 0) this.doDash(p);
    }
  }

  basicAttack(p) {
    const gr = p.body.body.blocked.down || p.body.body.touching.down;
    const id = p.char.id;
    // Per-character attack cooldown
    p.atkCd = id === 'pulse' ? 240 : id === 'volt' ? 252 : 330;
    if (id === 'pulse') {
      // Karateka: long thin kick, fast snap, moderate upward launch
      p.atk = gr
        ? { kind:'basic', t:78,  hit:0, w:48, h:22, ox:p.face*26, oy:-6,  dmg:7,  fx:0.90, fy:0.84 }
        : { kind:'basic', t:84,  hit:0, w:36, h:36, ox:p.face*22, oy:16,  dmg:9,  fx:0.82, fy:1.05 };
    } else if (id === 'volt') {
      // Boxer: compact fast jab, strong horizontal push, minimal vertical
      p.atk = gr
        ? { kind:'basic', t:72,  hit:0, w:34, h:24, ox:p.face*22, oy:-2,  dmg:8,  fx:1.06, fy:0.56 }
        : { kind:'basic', t:80,  hit:0, w:28, h:28, ox:p.face*18, oy:12,  dmg:7,  fx:0.78, fy:0.88 };
    } else {
      // Sumo: wide palm push, heavy startup, pure horizontal knockback
      p.atk = gr
        ? { kind:'basic', t:106, hit:0, w:50, h:32, ox:p.face*20, oy:2,   dmg:10, fx:1.20, fy:0.40 }
        : { kind:'basic', t:98,  hit:0, w:40, h:36, ox:p.face*16, oy:16,  dmg:8,  fx:0.92, fy:0.78 };
    }
    p._atkPoseT = p.atk.t;  // drive attack active-frame pose
    const fc = id==='volt' ? 0xffdd00 : id==='crush' ? 0xff8844 : p.char.accent;
    const fOx = id==='pulse' ? 28 : id==='volt' ? 20 : 18;
    const fOy = gr ? (id==='pulse' ? -6 : id==='volt' ? -2 : 2) : 14;
    this.flash(p.body.x + p.face*fOx, p.body.y + fOy, 30, 20, fc, 85);
    tone(this, p.idx?300:260, 'square', 0.07, 0.06);
  }

  doDash(p) {
    const b = p.body.body;
    const dir = p.face || (p.idx ? -1 : 1);
    const id = p.char.id;
    // Per-character dash cooldown
    p.dashCd = id === 'pulse' ? 780 : id === 'volt' ? 840 : 1000;
    p.dashT   = id === 'crush' ? 108 : 95;
    if (id === 'pulse') {
      // Flying kick: long forward reach, moderate launch, upward angle
      p.atk = { kind:'dash', t:95,  hit:0, w:36, h:28, ox:dir*24, oy:-8, dmg:9,  fx:0.88, fy:0.82 };
    } else if (id === 'volt') {
      // Cross punch: tight, high horizontal force, minimal vertical — ground pressure
      p.atk = { kind:'dash', t:90,  hit:0, w:28, h:32, ox:dir*18, oy:-2, dmg:11, fx:1.08, fy:0.40 };
    } else {
      // Charging body press: widest hitbox, highest damage, pure horizontal push
      p.atk = { kind:'dash', t:108, hit:0, w:48, h:40, ox:dir*12, oy:4,  dmg:13, fx:1.24, fy:0.30 };
    }
    p._atkPoseT = p.atk.t;  // drive attack active-frame pose
    b.setVelocityX(dir * (p.buffs.speed > 0 ? 600 : 500) * (this.finalPhase ? 1.15 : 1));
    this.flash(p.body.x, p.body.y, 44, 20, p.char.color, 110);
    tone(this, 90, 'sawtooth', 0.06, 0.14);
  }

  doAirDodge(p) {
    const L = p.idx ? 'P2_L' : 'P1_L';
    const dir = this.ctrl.held[L] ? -1 : 1;
    p.canAirDodge = false;
    p.invuln = Math.max(p.invuln, 160);
    p.dashCd = DASH_CD * 0.7;
    p.body.body.setVelocity(dir * 370, -60);
    this.flash(p.body.x, p.body.y, 34, 34, p.char.color, 130);
    tone(this, 480, 'triangle', 0.04, 0.10);
  }

  doSpecial(p) {
    p.spCd = p.char.sp;
    if (p.char.id === 'pulse') {
      p.atk = { kind: 'pulse', t: 110, hit: 0, w: 116, h: 116, ox: 0, oy: 0, dmg: p.char.sd, fx: 1.02, fy: 0.7 };
      p._atkPoseT = 110;
      this.ring(p.body.x, p.body.y, 16, 4, p.char.color, 140);
      this.spark(p.body.x, p.body.y, 0xffffff, 7);
      tone(this, 260, 'triangle', 0.06, 0.14);
    } else if (p.char.id === 'volt') {
      p.atk = { kind: 'volt', t: 110, hit: 0, w: 34, h: 68, ox: p.face * 16, oy: -40, dmg: p.char.sd, fx: 0.55, fy: 1.28 };
      p._atkPoseT = 110;
      this.flash(p.body.x + p.face * 10, p.body.y - 38, 24, 64, p.char.accent, 120);
      this.spark(p.body.x + p.face * 10, p.body.y - 24, 0xffdd00, 6);
      tone(this, 360, 'square', 0.06, 0.12);
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
    if (!a || a.hit || !p || !foe || !p.alive || !foe.alive || foe.invuln > 0) return;
    if (!p.body || !foe.body || !p.body.body || !foe.body.body) return;
    const box = { x: p.body.x + a.ox, y: p.body.y + a.oy, w: a.w, h: a.h };
    const target = { x: foe.body.x, y: foe.body.y, w: 26, h: 40 };
    if (!hitRect(box, target)) return;
    if (a.kind === 'basic' || a.kind === 'dash') {
      const d2 = (p.body.x - foe.body.x) ** 2 + (p.body.y - foe.body.y) ** 2;
      a._sweet = d2 < 900 ? 1.25 : d2 > 3364 ? 0.80 : 1.0;
    } else { a._sweet = 1.0; }
    a.hit = 1;
    this.hitPlayer(foe, p, a);
  }

  hitPlayer(t, p, a) {
    // DAMAGE PERCENT SYSTEM
    if (!t || !p || !a || !t.alive || !p.alive) return;
    if (!t.body || !p.body || !t.body.body || !p.body.body) return;
    const b = t.body.body;
    const kind = a.kind || 'basic';
    const ratio = t.stamina / t.staminaMax;
    const pct  = 1 + Math.pow(Math.min(KB_PERCENT_CAP, t.percent) / KB_PERCENT_DIV, 1.16) * KB_PERCENT_GAIN;
    const mul  = (1 + (1 - ratio) * 0.62) * pct;
    const pwr  = p.buffs.power > 0 ? 1.40 : 1;
    const rage  = p.stamina > 0 && p.stamina < p.staminaMax * 0.4 && p.fatigue <= 0
      ? 1 + (1 - p.stamina / p.staminaMax) * 0.30 : 1;
    const sweet = Number.isFinite(a._sweet) ? a._sweet : 1.0;
    const shld  = t.shielding ? 0.30 : t.buffs.guard > 0 ? 0.76 : 1;
    const dir  = p.body.x <= t.body.x ? 1 : -1;
    let vx = dir * BASE_KB_X * (a.fx || 1) * mul * pwr * sweet * rage * shld;
    let vy = -BASE_KB_Y * (a.fy || 0.75)  * mul * pwr * sweet * rage * shld;
    if (kind === 'dash') vy = -95 * mul * pwr * sweet * rage * shld;
    if (this.ctrl.held[t.idx ? 'P2_L' : 'P1_L']) vx -= 80;
    if (this.ctrl.held[t.idx ? 'P2_R' : 'P1_R']) vx += 80;
    if (this.ctrl.held[t.idx ? 'P2_U' : 'P1_U']) vy -= 35;
    t.lastHitTime = this.time.now;
    const pg = kind === 'basic' ? 0.98 : kind === 'dash' ? 1.10 : 1.22;
    t.percent = Math.min(999, t.percent + a.dmg * pg * sweet * (pwr > 1 ? 1.08 : 1));
    t.stamina = Math.max(0, t.stamina - a.dmg * pwr * sweet * rage * shld);
    if (t.stamina <= 0) { t.fatigue = FATIGUE_MS; t.atk = null; t.slam = 0; }
    t.comboHits++; t.comboT = 1800;
    if (t.comboHits === 3) { p.stamina = Math.min(p.staminaMax, p.stamina + 7); this.hudDirty = true; }
    else if (t.comboHits === 5) { this.flash(p.body.x, p.body.y, 52, 52, p.char.color, 200); tone(this, 660, 'square', 0.06, 0.10); }
    t.stun = (kind === 'basic' ? 110 : kind === 'dash' ? 130 : 150)
      * Math.max(0.60, 1 - (t.comboHits - 1) * 0.10);
    if (this.finalPhase) { vx *= 1.18; vy *= 1.18; }
    // VOLT bonus vs airborne targets
    if (p.char.id === 'volt' && !t.body.body.blocked.down && !t.body.body.touching.down) { vx *= 1.22; vy *= 1.22; }
    const impact = Math.max(0.65, mul * sweet * (kind === 'basic' ? 1 : kind === 'dash' ? 1.15 : 1.30));
    const heavy = impact > 1.95 || kind === 'crush' || kind === 'volt';
    const killish = heavy && (t.percent > 160 || Math.abs(vx) > 560 || Math.abs(vy) > 380);
    const baseBld = impact > 2.25 || kind === 'crush' ? 2 : impact > 1.45 || kind === 'dash' || sweet > 1.15 ? 1 : 0;
    const bloodLv = Math.min(2, baseBld + (t.percent > 130 && heavy && !t.shielding ? 1 : 0));
    if (t.shielding) { vx *= 0.88; vy *= 0.84; }
    b.setVelocity(vx, vy);
    p._recoilT = t.shielding ? 48 : killish ? 145 : heavy ? 95 : 58;
    p._atkPoseT = 0;  // hit connected — hand off to recoil pose
    if (t.shielding && p.body.body) p.body.body.velocity.x -= dir * (kind === 'dash' ? 92 : 58);
    if (heavy) this.spark(t.body.x, t.body.y, 0xff3300, killish ? 8 : 5);
    if (heavy || sweet > 1.1) this.spark(t.body.x, t.body.y - 8, p.char.accent, killish ? 9 : 6);
    else this.spark(t.body.x, t.body.y - 8, p.char.accent, 3);
    if (bloodLv && !t.shielding) this.bloodImpact(t.body.x, t.body.y - 8, bloodLv, killish, dir);
    if (heavy && !t.shielding && t.percent > 100) this.flash(t.body.x, t.body.y - 10, 40, 60, 0xff1a1a, t.percent > 160 ? 80 : 55);
    this.flash(t.body.x, t.body.y - 6, killish ? 56 : heavy ? 42 : 24, killish ? 34 : 24, p.char.accent, killish ? 135 : 90);
    if (!t.shielding) {
      if (p.char.id === 'pulse') {
        this.flash(t.body.x - dir * 10, t.body.y - 10, killish ? 56 : 42, 5, 0xffffff, 100);
        this.flash(t.body.x + dir * 8, t.body.y - 2, killish ? 46 : 34, 4, 0x8befff, 92);
      } else if (p.char.id === 'volt') {
        this.flash(t.body.x + dir * 6, t.body.y - 8, killish ? 34 : 24, killish ? 34 : 26, 0xffdd00, 95);
        this.spark(t.body.x + dir * 8, t.body.y - 10, 0xff8a00, killish ? 7 : 4);
      } else if (heavy) {
        this.spark(t.body.x, t.body.y + 14, 0xd3a16d, killish ? 8 : 5);
        this.ring(t.body.x, t.body.y + 16, 10, killish ? 3.8 : 2.8, 0xc59a63, 150);
      }
    }
    // Progressive shake — scales with impact score, dampened by shield
    const shkMul = t.shielding ? 0.3 : 1;
    const medium = kind === 'dash' || (kind === 'basic' && sweet > 1.1);
    const shkAmt = (killish ? 0.0100
      : heavy ? Math.min(0.0090, 0.0062 + impact * 0.0010)
      : medium ? Math.min(0.0054, 0.0031 + impact * 0.0008)
      : Math.min(0.0022, 0.00115 + impact * 0.0005)) * shkMul;
    const shkDur = killish ? 96
      : heavy ? Math.min(88, 62 + impact * 9)
      : medium ? Math.min(68, 42 + impact * 10)
      : Math.min(31, 22 + impact * 8);
    this.cameras.main.shake(shkDur, shkAmt);
    // Hit freeze — every hit type gets a freeze, strength-scaled, anti-stacking handled by hitFreeze()
    this.hitFreeze(killish ? 58 : heavy ? 52 : kind === 'dash' ? 39 : 20);
    // Distinct sound per hit type + blocked VFX
    if (t.shielding) {
      this.flash(t.body.x, t.body.y - 8, 58, 58, 0xdff7ff, 110);
      this.flash(t.body.x, t.body.y - 8, 42, 42, 0x4ebcff, 90);
      this.ring(t.body.x, t.body.y - 6, 12, 3.8, 0xaee6ff, 150);
      this.spark(t.body.x, t.body.y - 8, 0xcfefff, 2);
      tone(this, 408, 'triangle', 0.045, 0.08);
      this.time.delayedCall(18, () => { if (this.sys.isActive()) tone(this, 286, 'triangle', 0.03, 0.06); });
    } else if (killish) {
      tone(this, 88, 'sawtooth', 0.13, 0.16);
      this.time.delayedCall(32, () => { if (this.sys.isActive()) tone(this, 196, 'square', 0.07, 0.10); });
    } else if (kind === 'crush' || kind === 'volt') {
      tone(this, 128, 'square', 0.10, 0.13);
      this.time.delayedCall(22, () => { if (this.sys.isActive()) tone(this, 256, 'triangle', 0.05, 0.08); });
    } else if (kind === 'dash') {
      tone(this, 182, 'sawtooth', 0.09, 0.10);
    } else {
      tone(this, sweet > 1.1 ? 320 : 276, 'square', 0.07, 0.07);
    }
  }

  killPlayer(p) {
    if (!p.alive) return;
    p.alive = 0;
    p.lives--;
    p.atk = null;
    p.slam = 0;
    p.buffs.power = p.buffs.speed = p.buffs.regen = p.buffs.guard = 0;
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
    this.time.delayedCall(46, () => { if (this.sys.isActive()) tone(this, 46, 'sawtooth', 0.16, 0.55); });
    this.time.delayedCall(88, () => { if (this.sys.isActive()) tone(this, 70, 'triangle', 0.08, 0.28); });
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
    p.slam = 0;
    p.lastHitTime = 0;
    p.buffs.power = p.buffs.speed = p.buffs.regen = p.buffs.guard = 0;
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
    tone(this, 400, 'triangle', 0.07, 0.08);
    this.time.delayedCall(80,  () => tone(this, 520, 'triangle', 0.07, 0.08));
    this.time.delayedCall(160, () => tone(this, 660, 'triangle', 0.07, 0.12));
  }

  syncHead(p) {
    p.visual.setPosition(p.body.x, p.body.y).setAngle(0);
    p.visual.setScale(p.face < 0 ? -1 : 1, 1);
    p.overlay.setPosition(p.body.x, p.body.y);
  }

  animatePlayer(p, now) {
    const b = p.body.body;
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

  triggerFinalPhase() {
    this.finalPhase = true;
    const txt = this.add.text(W/2, H/2, 'FINAL MINUTE', {
      fontFamily:'monospace', fontSize:'46px', fontStyle:'bold', color:'#ff4444'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets:txt, alpha:0, y:H/2-80, duration:2000, onComplete:()=>txt.destroy() });
    this.cameras.main.shake(132, 0.0078);
    tone(this, 880, 'square', 0.12, 0.28);
    this.time.delayedCall(300, ()=>tone(this, 660, 'square', 0.10, 0.28));
    const mp = this.platData[0];
    mp.hitbox.setPosition(-2000, -2000); mp.visual.setVisible(false);
    [[280,0],[520,Math.PI]].forEach(([bx,ph])=>{
      const h = this.add.rectangle(bx, 470, 180, 28, 0x000000, 0);
      this.plats.add(h);
      const v = buildPlatShip(this, 180, 28, 'side'); v.setPosition(bx, 470);
      this.platData.push({ hitbox:h, visual:v, baseX:bx, baseY:470, speed:1.2, range:90, phase:ph, vRange:16, vSpeed:0.8, vPhase:ph });
    });
    this.plats.refresh();
  }

  endMatch() {
    if (this.over) return;
    this.over = 1;
    const [p1,p2] = this.players;
    // REGRESSION FIXES
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
    for(let i=0;i<n;i++){
      const bias=dir*(0.28+Math.random()*0.22);
      const a=-Math.PI/2+(Math.random()-.5)*Math.PI*.9+bias;
      const col=i%3===0?0xff6b6b:i%3===1?0xff2020:0xff4747;
      const r=this.add.rectangle(x,y,Phaser.Math.Between(3,6),Phaser.Math.Between(3,6),col).setDepth(18);
      this.tweens.add({targets:r,
        x:x+Math.cos(a)*Phaser.Math.Between(14,s),
        y:y+Math.sin(a)*Phaser.Math.Between(10,s)+12,
        alpha:0,duration:330+Math.random()*130,onComplete:()=>r.destroy()});
    }
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
    const rnd = Math.random();
    const type = rnd<0.30?'recovery':rnd<0.50?'power':rnd<0.70?'speed':rnd<0.88?'regen':'guard';
    const cfg = PICKUP_CFG[type];
    const ox = pl.hitbox.x + offX, oy = pl.hitbox.y - 22;
    const orb = this.add.container(ox, oy);
    orb.add(drawPickupIcon(this, type, cfg.col));
    this.tweens.add({ targets: orb, scaleX: 1.06, scaleY: 1.06, alpha: 0.88, duration: 520, yoyo: true, repeat: -1 });
    this.pickup = { orb, type, x: ox, y: oy, plat: pl, offX, life: 5500 };
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
    const cfg = PICKUP_CFG[type];
    burst(this, x, y, cfg.col, 5);
    showPickupText(this, x, y, cfg.txt, cfg.tc);
    tone(this, cfg.f, cfg.ft, 0.07, cfg.fd);
    if (cfg.bk) { p.buffs[cfg.bk] = cfg.dur; }
    else { p.stamina = Math.min(p.staminaMax, p.stamina + 35); p.lastHitTime = 0; }
    this.hudDirty = true;
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
    const cool = p => p.spCd > 0 ? 'SP ' + Math.ceil(p.spCd / 1000) : 'SP OK';
    const bufStr = p => { const b=[]; if(p.buffs.power>0)b.push('POW'); if(p.buffs.speed>0)b.push('SPD'); if(p.buffs.regen>0)b.push('REG'); if(p.buffs.guard>0)b.push('GRD'); return b.join(' '); };
    const p1 = this.players[0], p2 = this.players[1];
    const frame = this.hudFrame;
    frame.clear();
    frame.fillStyle(0x07121c, 0.60);
    frame.fillRoundedRect(14, 10, 236, 72, 12);
    frame.fillRoundedRect(W - 250, 10, 236, 72, 12);
    frame.fillRoundedRect(W / 2 - 74, 10, 148, 34, 10);
    frame.lineStyle(1, 0x295374, 0.72);
    frame.strokeRoundedRect(14, 10, 236, 72, 12);
    frame.strokeRoundedRect(W - 250, 10, 236, 72, 12);
    frame.strokeRoundedRect(W / 2 - 74, 10, 148, 34, 10);
    frame.fillStyle(0x0d2131, 0.68);
    frame.fillRoundedRect(22, 53, 104, 10, 5);
    frame.fillRoundedRect(W - 126, 53, 104, 10, 5);
    const dB = (g, p, x) => {
      g.clear();
      const c = p._hud.seg >= 7 ? 0x3de8ff : p._hud.seg >= 4 ? 0xffcf45 : 0xff5261;
      for (let i = 0; i < 10; i++) {
        g.fillStyle(i < p._hud.seg ? c : 0x1a2a3a, i < p._hud.seg ? 1 : .35);
        g.fillRect(x + i * 9, 54, 7, 8);
      }
    };
    dB(this.hudBar1, p1, 24); dB(this.hudBar2, p2, W - 121);
    this.hudP1.setText('P1 ' + p1.char.name + '  ' + dots(p1.lives));
    this.hudP2.setText('P2 ' + p2.char.name + '  ' + dots(p2.lives));
    this.hudPct1.setText(p1._hud.pct + '%').setColor(p1._hud.pct >= 150 ? '#ff6d78' : p1._hud.pct >= 80 ? '#ffd25a' : C.p1);
    this.hudPct2.setText(p2._hud.pct + '%').setColor(p2._hud.pct >= 150 ? '#ff6d78' : p2._hud.pct >= 80 ? '#ffd25a' : C.p2);
    this.hudS1.setText(cool(p1) + (p1.fatigue > 0 ? '  EXH' : '') + (bufStr(p1) ? '  ' + bufStr(p1) : ''));
    this.hudS2.setText(cool(p2) + (p2.fatigue > 0 ? '  EXH' : '') + (bufStr(p2) ? '  ' + bufStr(p2) : ''));
  }

  refreshHud() {
    const dots = n => '●'.repeat(n) + '○'.repeat(LIVES - n);
    const cool = p => p.spCd > 0 ? 'SP ' + Math.ceil(p.spCd / 1000) : 'SP OK';
    const p1 = this.players[0], p2 = this.players[1];
    const frame = this.hudFrame;
    frame.clear();
    frame.fillStyle(0x07121c, 0.56);
    frame.fillRoundedRect(14, 10, 224, 76, 10);
    frame.fillRoundedRect(W - 238, 10, 224, 76, 10);
    frame.fillStyle(0x081722, 0.72);
    frame.fillRoundedRect(W / 2 - 78, 10, 156, 36, 10);
    frame.lineStyle(1, 0x295374, 0.70);
    frame.strokeRoundedRect(14, 10, 224, 76, 10);
    frame.strokeRoundedRect(W - 238, 10, 224, 76, 10);
    frame.strokeRoundedRect(W / 2 - 78, 10, 156, 36, 10);
    frame.lineStyle(2, 0x143245, 0.85);
    frame.lineBetween(22, 60, 230, 60);
    frame.lineBetween(W - 230, 60, W - 22, 60);
    frame.fillStyle(this.finalPhase ? 0x742a2a : 0x11293b, 0.90);
    frame.fillRoundedRect(W / 2 - 34, 53, 68, 22, 8);
    frame.lineStyle(1, this.finalPhase ? 0xff6f6f : 0x5bc6f0, 0.90);
    frame.strokeRoundedRect(W / 2 - 34, 53, 68, 22, 8);
    const dB = (g, p, x) => {
      g.clear();
      const c = p._hud.seg >= 7 ? 0x32e3ff : p._hud.seg >= 4 ? 0xffcf45 : 0xff5668;
      for (let i = 0; i < 10; i++) {
        g.fillStyle(i < p._hud.seg ? c : 0x1a2a3a, i < p._hud.seg ? 1 : .25);
        g.fillRect(x + i * 10, 63, 8, 6);
      }
    };
    const drawBuffs = (g, p, x, y, dir) => {
      g.clear();
      const buffs = [
        p.buffs.power > 0 ? ['power', PICKUP_CFG.power.col] : null,
        p.buffs.speed > 0 ? ['speed', PICKUP_CFG.speed.col] : null,
        p.buffs.regen > 0 ? ['regen', PICKUP_CFG.regen.col] : null,
        p.buffs.guard > 0 ? ['guard', PICKUP_CFG.guard.col] : null,
      ].filter(Boolean);
      buffs.forEach((it, i) => {
        const bx = x + dir * i * 16, by = y, col = it[1];
        g.fillStyle(0x10202c, 0.95); g.fillRoundedRect(bx - 6, by - 6, 12, 12, 3);
        g.lineStyle(1, col, 0.95); g.strokeRoundedRect(bx - 6, by - 6, 12, 12, 3);
        g.fillStyle(col, 1);
        if (it[0] === 'power') { g.fillRect(bx - 2, by - 1, 5, 3); g.fillRect(bx, by - 4, 3, 3); }
        else if (it[0] === 'speed') { g.fillRect(bx - 3, by, 6, 2); g.fillRect(bx - 1, by - 4, 3, 4); }
        else if (it[0] === 'regen') { g.fillRect(bx - 2, by - 4, 4, 7); g.fillRect(bx - 1, by - 6, 2, 2); }
        else { g.fillRect(bx - 3, by - 4, 6, 2); g.fillRect(bx - 4, by - 2, 8, 4); g.fillRect(bx - 2, by + 2, 4, 2); }
      });
    };
    dB(this.hudBar1, p1, 24); dB(this.hudBar2, p2, W - 122);
    drawBuffs(this.hudBuff1, p1, 188, 74, 1);
    drawBuffs(this.hudBuff2, p2, W - 188, 74, -1);
    this.hudP1.setText('P1  ' + p1.char.name + '  ' + dots(p1.lives));
    this.hudP2.setText('P2  ' + p2.char.name + '  ' + dots(p2.lives));
    this.hudPct1.setText(p1._hud.pct + '%').setColor(p1._hud.pct >= 150 ? '#ff6d78' : p1._hud.pct >= 80 ? '#ffd25a' : C.p1);
    this.hudPct2.setText(p2._hud.pct + '%').setColor(p2._hud.pct >= 150 ? '#ff6d78' : p2._hud.pct >= 80 ? '#ffd25a' : C.p2);
    this.hudS1.setText(cool(p1) + (p1.fatigue > 0 ? '  EXH' : ''));
    this.hudS2.setText(cool(p2) + (p2.fatigue > 0 ? '  EXH' : ''));
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
      // VICTORY CELEBRATION REDESIGN
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
