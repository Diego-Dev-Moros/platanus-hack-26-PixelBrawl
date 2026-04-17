// Pixel Brawl - local 1v1 platform fighter

const W = 800, H = 600;
const GRAVITY = 980, SPEED = 220, JUMP = -420, LIVES = 3;
const ATK_CD = 280, DASH_CD = 900, FATIGUE_MS = 900, INVULN_MS = 1200;
const BASE_KB_X = 240, BASE_KB_Y = 155;
const DEATH_X = 80, DEATH_Y = 680;

const C = {
  bg: 0x08111f, grid: 0x1b3550, frame: 0x204e7b, plat: 0x25394f, edge: 0x5ccdf7,
  text: '#d7f3ff', dim: '#6a8ba5', hot: '#fff0aa', p1: '#8affd2', p2: '#ff93ba',
};

const CHARS = [
  { id: 'pulse', name: 'PULSE', color: 0x00e5ff, accent: 0xffffff, line: 'SHOCKWAVE / AREA PUSH', head: 0, sp: 2200, sd: 12 },
  { id: 'volt', name: 'VOLT', color: 0xffdd00, accent: 0xff7a00, line: 'UPPERCUT / ANTI-AIR', head: 1, sp: 2000, sd: 14 },
  { id: 'crush', name: 'CRUSH', color: 0xff3cac, accent: 0xff5a36, line: 'GROUND SLAM / LANDING BURST', head: 0, sp: 2400, sd: 15 },
];

const STAGE = [
  { x: 400, y: 470, w: 420, h: 28 },
  { x: 240, y: 352, w: 120, h: 20 },
  { x: 560, y: 352, w: 120, h: 20 },
  { x: 400, y: 270, w: 100, h: 18 },
];

const SPAWNS = [{ x: 320, y: 300 }, { x: 480, y: 300 }];

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

function setupShell() {
  const d = document, e = d.documentElement, b = d.body;
  e.style.margin = b.style.margin = '0';
  e.style.width = b.style.width = '100%';
  e.style.height = b.style.height = '100%';
  e.style.overflow = b.style.overflow = 'hidden';
  b.style.background = '#08111f';
  let root = d.getElementById('game-root');
  if (!root) {
    root = d.createElement('div');
    root.id = 'game-root';
    b.appendChild(root);
  }
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.width = '100vw';
  root.style.height = '100vh';
  root.style.zIndex = '2147483647';
  root.style.background = '#08111f';
  const hide = () => {
    const kids = [...b.children];
    for (const n of kids) if (n !== root) n.style.display = 'none';
  };
  hide();
  new MutationObserver(hide).observe(b, { childList: true });
}

function fit(scene) {
  const vw = scene.scale.width, vh = scene.scale.height;
  return { vw, vh, ox: (vw - W) * 0.5, oy: (vh - H) * 0.5 };
}

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
  scene.ctrl = { held: {}, pressed: {}, rawHeld: {}, rawPressed: {} };
  const onDown = e => {
    const raw = nk(e.key);
    if (!scene.ctrl.rawHeld[raw]) scene.ctrl.rawPressed[raw] = true;
    scene.ctrl.rawHeld[raw] = true;
    const code = KEY_MAP[raw];
    if (!code) return;
    if (!scene.ctrl.held[code]) scene.ctrl.pressed[code] = true;
    scene.ctrl.held[code] = true;
  };
  const onUp = e => {
    const raw = nk(e.key);
    scene.ctrl.rawHeld[raw] = false;
    const code = KEY_MAP[raw];
    if (code) scene.ctrl.held[code] = false;
  };
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onDown);
    window.removeEventListener('keyup', onUp);
  });
}

function flush(scene) {
  for (const k in scene.ctrl.pressed) scene.ctrl.pressed[k] = false;
  for (const k in scene.ctrl.rawPressed) scene.ctrl.rawPressed[k] = false;
}

function addLabel(scene, x, y, text, size, color, align) {
  return scene.add.text(x, y, text, {
    fontFamily: 'monospace', fontSize: size + 'px', fontStyle: 'bold', color, align: align || 'left',
  });
}

function uiPressed(scene, key) { return !!scene.ctrl.rawPressed[key]; }
function uiHeld(scene, key) { return !!scene.ctrl.rawHeld[key]; }
function anyPressed(scene, keys) { return keys.some(k => scene.ctrl.pressed[k]); }

function hitRect(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
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

function arcadeBg(scene, title, kicker) {
  const { vw, vh } = fit(scene);
  scene.add.rectangle(vw * 0.5, vh * 0.5, vw, vh, C.bg);
  const g = scene.add.graphics();
  g.lineStyle(1, C.grid, 0.38);
  for (let x = 0; x <= vw; x += 40) g.lineBetween(x, 0, x, vh);
  for (let y = 0; y <= vh; y += 40) g.lineBetween(0, y, vw, y);
  g.lineStyle(2, C.frame, 0.8).strokeRect(24, 24, vw - 48, vh - 48);
  g.lineStyle(2, 0x18354f, 0.8).strokeRect(40, 40, vw - 80, vh - 80);
  addLabel(scene, vw * 0.5, 54, title, 34, C.text, 'center').setOrigin(0.5);
  if (kicker) addLabel(scene, vw * 0.5, 94, kicker, 13, C.dim, 'center').setOrigin(0.5);
}

function drawFighter(scene, x, y, ch, scale) {
  scene.add.rectangle(x, y + 12 * scale, 44 * scale, 72 * scale, ch.color);
  if (ch.head) scene.add.rectangle(x, y - 42 * scale, 28 * scale, 24 * scale, ch.accent);
  else scene.add.circle(x, y - 42 * scale, 14 * scale, ch.accent);
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
    this.opts = ['PLAY', 'CONTROLS', 'CREDITS', 'EXIT'];
    const { vw } = fit(this);
    arcadeBg(this, 'PIXEL BRAWL', 'RETRO ARCADE PLATFORM FIGHTER');
    drawFighter(this, vw * 0.5 - 72, 188, CHARS[0], 1);
    drawFighter(this, vw * 0.5, 178, CHARS[1], 1.08);
    drawFighter(this, vw * 0.5 + 72, 188, CHARS[2], 1);
    this.items = this.opts.map((t, i) => addLabel(this, vw * 0.5, 306 + i * 50, t, 24, C.dim, 'center').setOrigin(0.5));
    this.note = addLabel(this, vw * 0.5, fit(this).vh - 80, '', 12, '#ff93ba', 'center').setOrigin(0.5);
    addLabel(this, vw * 0.5, fit(this).vh - 46, 'W/S OR ARROWS TO MOVE  -  ENTER TO SELECT', 12, C.dim, 'center').setOrigin(0.5);
    this.refresh();
  }
  update() {
    if (anyPressed(this, ['P1_U', 'P2_U']) || uiPressed(this, 'w')) this.sel = (this.sel + this.opts.length - 1) % this.opts.length;
    if (anyPressed(this, ['P1_D', 'P2_D']) || uiPressed(this, 's')) this.sel = (this.sel + 1) % this.opts.length;
    if (anyPressed(this, ['START1', 'START2', 'P1_1', 'P1_4', 'P2_1', 'P2_4']) || uiPressed(this, 'enter')) this.pick();
    this.refresh();
    flush(this);
  }
  pick() {
    tone(this, 400, 'square', 0.05, 0.07);
    const opt = this.opts[this.sel];
    if (opt === 'PLAY') this.scene.start('Select');
    else if (opt === 'CONTROLS') this.scene.start('Controls');
    else if (opt === 'CREDITS') this.scene.start('Credits');
    else {
      this.note.setText('EXIT NOT AVAILABLE HERE');
      try { window.close(); } catch (_) {}
    }
  }
  refresh() {
    for (let i = 0; i < this.items.length; i++) {
      const on = i === this.sel;
      this.items[i].setText((on ? '> ' : '  ') + this.opts[i] + (on ? ' <' : ''))
        .setColor(on ? C.hot : C.dim).setScale(on ? 1.08 : 1);
    }
  }
}

class ControlsScene extends Phaser.Scene {
  constructor() { super('Controls'); }
  create() {
    bindKeys(this);
    const { vw, vh } = fit(this);
    arcadeBg(this, 'CONTROLS', '');
    addLabel(this, vw * 0.5 - 210, 178, 'PLAYER 1', 22, C.p1).setOrigin(0.5);
    addLabel(this, vw * 0.5 - 210, 220, 'A / D = MOVE', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 - 210, 250, 'W     = JUMP', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 - 210, 280, 'F     = ATTACK', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 - 210, 310, 'G     = DASH / SPECIAL', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 + 210, 178, 'PLAYER 2', 22, C.p2).setOrigin(0.5);
    addLabel(this, vw * 0.5 + 210, 220, 'LEFT / RIGHT = MOVE', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 + 210, 250, 'UP           = JUMP', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 + 210, 280, 'K            = ATTACK', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5 + 210, 310, 'L            = DASH / SPECIAL', 16, C.text).setOrigin(0.5);
    addLabel(this, vw * 0.5, vh * 0.68, 'WIN BY KNOCKING YOUR RIVAL OFF THE STAGE.', 14, C.dim, 'center').setOrigin(0.5);
    addLabel(this, vw * 0.5, vh - 46, 'PRESS ENTER TO RETURN', 13, C.hot, 'center').setOrigin(0.5);
  }
  update() {
    if (anyPressed(this, ['START1', 'START2', 'P1_1', 'P2_1']) || uiPressed(this, 'enter')) this.scene.start('Menu');
    flush(this);
  }
}

class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }
  create() {
    bindKeys(this);
    const { vw, vh } = fit(this), cx = vw * 0.5, cy = vh * 0.5;
    arcadeBg(this, 'CREDITS', '');
    addLabel(this, cx, cy - 90, 'PLATANUS HACK 26', 20, C.text, 'center').setOrigin(0.5);
    addLabel(this, cx, cy - 52, 'ARCADE CHALLENGE', 20, C.text, 'center').setOrigin(0.5);
    addLabel(this, cx, cy + 8, 'DEVELOPED BY', 12, C.dim, 'center').setOrigin(0.5);
    addLabel(this, cx, cy + 52, 'ALEJANDRO BIARRIETA', 20, C.hot, 'center').setOrigin(0.5);
    addLabel(this, cx, cy + 88, 'DIEGO MOROS', 20, C.hot, 'center').setOrigin(0.5);
    addLabel(this, cx, vh - 46, 'PRESS ENTER TO RETURN', 13, C.dim, 'center').setOrigin(0.5);
  }
  update() {
    if (anyPressed(this, ['START1', 'START2', 'P1_1', 'P2_1']) || uiPressed(this, 'enter')) this.scene.start('Menu');
    flush(this);
  }
}

class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('Select'); }
  create() {
    bindKeys(this);
    this.sel = [0, 1];
    this.lock = [0, 0];
    this.cards = [];
    const { vw, vh } = fit(this), base = vw * 0.5 - 240;
    arcadeBg(this, 'SELECT YOUR BRAWLER', '');
    for (let i = 0; i < 3; i++) {
      const ch = CHARS[i], x = base + i * 240, y = 288;
      const box = this.add.rectangle(x, y, 180, 246, 0x0d1d31).setStrokeStyle(2, 0x2c4f6d);
      drawFighter(this, x, y, ch, 1);
      addLabel(this, x, y - 108, ch.name, 18, '#ffffff', 'center').setOrigin(0.5);
      addLabel(this, x, y + 88, ch.line, 12, C.dim, 'center').setOrigin(0.5);
      const mark = addLabel(this, x, y + 116, '', 12, '#ffffff', 'center').setOrigin(0.5);
      this.cards.push({ box, mark });
    }
    this.status = addLabel(this, vw * 0.5, vh - 74, '', 14, C.hot, 'center').setOrigin(0.5);
    addLabel(this, vw * 0.5, vh - 46, 'P1: A/D + F TO LOCK    P2: LEFT/RIGHT + K TO LOCK', 12, C.dim, 'center').setOrigin(0.5);
    this.refresh();
  }
  update() {
    if (!this.lock[0]) {
      if (this.ctrl.pressed.P1_L) this.sel[0] = (this.sel[0] + 2) % 3;
      if (this.ctrl.pressed.P1_R) this.sel[0] = (this.sel[0] + 1) % 3;
      if (uiPressed(this, 'f')) { this.lock[0] = 1; tone(this, 480, 'square', 0.06, 0.08); }
    }
    if (!this.lock[1]) {
      if (this.ctrl.pressed.P2_L) this.sel[1] = (this.sel[1] + 2) % 3;
      if (this.ctrl.pressed.P2_R) this.sel[1] = (this.sel[1] + 1) % 3;
      if (uiPressed(this, 'k')) { this.lock[1] = 1; tone(this, 620, 'square', 0.06, 0.08); }
    }
    if (this.lock[0] && this.lock[1] && (this.ctrl.pressed.START1 || uiPressed(this, 'enter') || uiPressed(this, 'space'))) {
      this.scene.start('Game', { picks: [CHARS[this.sel[0]].id, CHARS[this.sel[1]].id] });
      return;
    }
    this.refresh();
    flush(this);
  }
  refresh() {
    for (let i = 0; i < this.cards.length; i++) {
      let stroke = 0x2c4f6d, fill = 0x0d1d31, mark = '';
      if (this.sel[0] === i && !this.lock[0]) { stroke = 0x8affd2; fill = 0x133126; mark = 'P1'; }
      if (this.sel[1] === i && !this.lock[1]) { stroke = 0xff93ba; fill = 0x311322; mark = mark ? mark + ' / P2' : 'P2'; }
      if (this.sel[0] === i && this.lock[0]) mark = 'P1 LOCKED';
      if (this.sel[1] === i && this.lock[1]) mark = mark ? mark + ' / P2 LOCKED' : 'P2 LOCKED';
      this.cards[i].box.setFillStyle(fill).setStrokeStyle(2, stroke);
      this.cards[i].mark.setText(mark);
    }
    this.status.setText(this.lock[0] && this.lock[1] ? 'PRESS ENTER TO START' : 'WAITING FOR BOTH PLAYERS');
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.picks = data.picks || ['pulse', 'volt']; }

  create() {
    bindKeys(this);
    this.view = fit(this);
    this.over = 0;
    this.drawStage();
    this.makeStage();
    this.makeHud();
    this.players = [this.makePlayer(0, this.picks[0]), this.makePlayer(1, this.picks[1])];
    this.refreshHud();
  }

  wp(x, y) { return { x: this.view.ox + x, y: this.view.oy + y }; }

  drawStage() {
    const { vw, vh, ox, oy } = this.view;
    this.add.rectangle(vw * 0.5, vh * 0.5, vw, vh, C.bg);
    const g = this.add.graphics().lineStyle(1, C.grid, 0.38);
    for (let x = 0; x <= vw; x += 40) g.lineBetween(x, 0, x, vh);
    for (let y = 0; y <= vh; y += 40) g.lineBetween(0, y, vw, y);
    g.lineStyle(2, C.frame, 0.7).strokeRect(26, 26, vw - 52, vh - 52);
    g.lineStyle(2, 0x70253b, 0.5).lineBetween(ox, oy + 592, ox + W, oy + 592);
  }

  makeStage() {
    this.plats = this.physics.add.staticGroup();
    for (const p of STAGE) {
      const q = this.wp(p.x, p.y);
      const r = this.add.rectangle(q.x, q.y, p.w, p.h, C.plat).setStrokeStyle(2, C.edge);
      this.plats.add(r);
    }
    this.plats.refresh();
  }

  makeHud() {
    const { vw } = this.view;
    addLabel(this, vw * 0.5, 10, 'PIXEL BRAWL', 14, '#5ca7d0', 'center').setOrigin(0.5, 0);
    this.hudP1 = addLabel(this, 14, 12, '', 14, C.p1);
    this.hudS1 = addLabel(this, 14, 34, '', 12, C.dim);
    this.hudP2 = addLabel(this, vw - 14, 12, '', 14, C.p2).setOrigin(1, 0);
    this.hudS2 = addLabel(this, vw - 14, 34, '', 12, C.dim).setOrigin(1, 0);
  }

  makePlayer(idx, id) {
    const ch = CHARS.find(c => c.id === id) || CHARS[0], s = this.wp(SPAWNS[idx].x, SPAWNS[idx].y);
    const body = this.add.rectangle(s.x, s.y, 26, 40, ch.color);
    this.physics.add.existing(body);
    body.body.setCollideWorldBounds(false).setMaxVelocity(700, 1000);
    const head = ch.head ? this.add.rectangle(s.x, s.y - 30, 18, 16, ch.accent) : this.add.circle(s.x, s.y - 30, 9, ch.accent);
    this.physics.add.collider(body, this.plats);
    const shield = this.add.circle(s.x, s.y - 10, 26, ch.accent, 0).setStrokeStyle(2, ch.accent, 0).setVisible(false);
    return {
      idx, char: ch, body, head, lives: LIVES, alive: 1, face: idx ? -1 : 1, jumps: 2,
      stamina: 100, staminaMax: 100, invuln: 0, fatigue: 0, stun: 0,
      atkCd: 0, dashCd: 0, spCd: 0, dashT: 0, atk: null, slam: 0, shield,
    };
  }

  update(_, dt) {
    if (this.over) {
      if (this.ctrl.pressed.START1 || this.ctrl.pressed.START2 || uiPressed(this, 'enter')) this.scene.start('Menu');
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
    if (p.body.x < this.view.ox - DEATH_X || p.body.x > this.view.ox + W + DEATH_X || p.body.y > this.view.oy + DEATH_Y) { this.killPlayer(p); return; }
    this.movePlayer(p);
    this.handleActions(p);
    this.updateAttack(p, foe);
    this.checkSlam(p, foe);
    this.syncHead(p);
    if (p.invuln > 0) {
      const a = (Math.floor(p.invuln / 80) % 2) ? 0.35 : 1;
      p.body.alpha = a; p.head.alpha = a; p.shield.setVisible(true).setAlpha(0.2 + a * 0.35);
    } else {
      p.body.alpha = 1; p.head.alpha = 1; p.shield.setVisible(false);
    }
    p.body.setFillStyle(p.fatigue > 0 && Math.floor(p.fatigue / 110) % 2 ? 0xff4400 : p.char.color);
  }

  tickTimers(p, dt) {
    if (p.invuln > 0) p.invuln -= dt;
    if (p.fatigue > 0) p.fatigue -= dt;
    if (p.stun > 0) p.stun -= dt;
    if (p.atkCd > 0) p.atkCd -= dt;
    if (p.dashCd > 0) p.dashCd -= dt;
    if (p.spCd > 0) p.spCd -= dt;
    if (p.dashT > 0) p.dashT -= dt;
    if (p.atk) { p.atk.t -= dt; if (p.atk.t <= 0) p.atk = null; }
  }

  movePlayer(p) {
    const b = p.body.body, L = p.idx ? 'P2_L' : 'P1_L', R = p.idx ? 'P2_R' : 'P1_R', U = p.idx ? 'P2_U' : 'P1_U';
    if (b.blocked.down || b.touching.down) p.jumps = 2;
    if (p.stun > 0 || p.dashT > 0) return;
    let vx = 0;
    if (this.ctrl.held[L]) { vx = -SPEED; p.face = -1; }
    if (this.ctrl.held[R]) { vx = SPEED; p.face = 1; }
    b.setVelocityX(vx);
    if (this.ctrl.pressed[U] && p.jumps > 0) {
      b.setVelocityY(JUMP);
      p.jumps--;
      tone(this, p.idx ? 390 : 330, 'square', 0.05, 0.07);
    }
  }

  handleActions(p) {
    const atk = p.idx ? anyPressed(this, ['P2_1', 'P2_4']) || uiPressed(this, 'k') : anyPressed(this, ['P1_1', 'P1_4']) || uiPressed(this, 'f');
    const alt = p.idx ? anyPressed(this, ['P2_2', 'P2_5']) || uiPressed(this, 'l') : anyPressed(this, ['P1_2', 'P1_5']) || uiPressed(this, 'g');
    const L = p.idx ? 'P2_L' : 'P1_L', R = p.idx ? 'P2_R' : 'P1_R';
    const moving = this.ctrl.held[L] || this.ctrl.held[R] || uiHeld(this, p.idx ? 'arrowleft' : 'a') || uiHeld(this, p.idx ? 'arrowright' : 'd');
    if (p.stun > 0) return;
    if (atk && p.atkCd <= 0) this.basicAttack(p);
    if (alt && p.fatigue <= 0) {
      if (moving && p.dashCd <= 0) this.doDash(p);
      else if (p.spCd <= 0) this.doSpecial(p);
      else if (p.dashCd <= 0) this.doDash(p);
    }
  }

  basicAttack(p) {
    p.atkCd = ATK_CD;
    p.atk = { kind: 'basic', t: 85, hit: 0, w: 40, h: 26, ox: p.face * 30, oy: -4, dmg: 8, fx: 0.95, fy: 0.72 };
    this.flash(p.body.x + p.face * 22, p.body.y - 4, 32, 16, p.char.accent, 85);
    tone(this, p.idx ? 240 : 210, 'square', 0.035, 0.05);
  }

  doDash(p) {
    const b = p.body.body, dir = p.face || (p.idx ? -1 : 1);
    p.dashCd = DASH_CD; p.dashT = 95;
    p.atk = { kind: 'dash', t: 95, hit: 0, w: 32, h: 34, ox: dir * 18, oy: 0, dmg: 10, fx: 0.9, fy: 0.5 };
    b.setVelocityX(dir * 500);
    this.flash(p.body.x, p.body.y, 44, 20, p.char.color, 110);
    tone(this, 150, 'sawtooth', 0.045, 0.08);
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
    const ratio = t.stamina / t.staminaMax, mul = 1 + (1 - ratio) * 0.8, dir = p.body.x <= t.body.x ? 1 : -1;
    let vx = dir * BASE_KB_X * (a.fx || 1) * mul, vy = -BASE_KB_Y * (a.fy || 0.75) * mul;
    if (a.kind === 'dash') vy = -95 * mul;
    t.stamina = Math.max(0, t.stamina - a.dmg);
    if (t.stamina <= 0) t.fatigue = Math.max(t.fatigue, FATIGUE_MS);
    t.stun = a.kind === 'basic' ? 110 : a.kind === 'dash' ? 130 : 150;
    b.setVelocity(vx, vy);
    this.flash(t.body.x, t.body.y - 6, 30, 30, p.char.accent, 100);
    if (a.kind !== 'basic') this.cameras.main.shake(60, 0.006);
    tone(this, 180, 'square', 0.05, 0.08);
  }

  killPlayer(p) {
    if (!p.alive) return;
    p.alive = 0; p.lives--; p.atk = null; p.slam = 0;
    burst(this, p.body.x, p.body.y, p.char.color, 10);
    this.cameras.main.shake(230, 0.015);
    p.body.body.enable = false;
    p.body.setVisible(false).setPosition(-500, -500);
    p.head.setVisible(false).setPosition(-500, -500);
    tone(this, 110, 'sawtooth', 0.18, 0.35);
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
    const s = this.wp(SPAWNS[p.idx].x, SPAWNS[p.idx].y);
    p.alive = 1; p.jumps = 2; p.stamina = p.staminaMax; p.invuln = INVULN_MS; p.fatigue = 0; p.stun = 0; p.atk = null; p.slam = 0;
    p.body.body.enable = true; p.body.body.reset(s.x, s.y);
    p.body.setVisible(true).setAlpha(1); p.head.setVisible(true).setAlpha(1); p.shield.setVisible(true).setAlpha(0.5);
    this.syncHead(p);
    burst(this, s.x, s.y, p.char.accent, 6);
    tone(this, 520, 'triangle', 0.08, 0.16);
  }

  syncHead(p) {
    p.head.x = p.body.x; p.head.y = p.body.y - 30; p.shield.x = p.body.x; p.shield.y = p.body.y - 10;
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
    const cool = p => (p.spCd > 0 ? ' SP ' + Math.ceil(p.spCd / 1000) : ' SP READY');
    const { vw } = this.view;
    const p1 = this.players[0], p2 = this.players[1];
    this.hudP1.setText('P1 ' + p1.char.name + ' ' + dots(p1.lives));
    this.hudP2.setText(dots(p2.lives) + ' ' + p2.char.name + ' P2').setPosition(vw - 14, 12);
    this.hudS2.setPosition(vw - 14, 34);
    this.hudS1.setText('STM ' + bar(p1) + (p1.fatigue > 0 ? ' FATIGUE' : '') + cool(p1));
    this.hudS2.setText((p2.fatigue > 0 ? 'FATIGUE ' : '') + bar(p2) + ' STM' + cool(p2));
  }
}

class EndScene extends Phaser.Scene {
  constructor() { super('End'); }
  init(data) { this.winner = data.winner || 1; this.char = data.char || null; }
  create() {
    bindKeys(this);
    const { vw, vh } = fit(this);
    arcadeBg(this, 'MATCH OVER', '');
    const col = this.winner === 1 ? C.p1 : C.p2;
    if (this.char) {
      drawFighter(this, vw * 0.5, vh * 0.5 + 10, this.char, 1.1);
      addLabel(this, vw * 0.5, vh * 0.5 - 122, 'P' + this.winner + ' WINS', 52, col, 'center').setOrigin(0.5);
      addLabel(this, vw * 0.5, vh * 0.5 - 72, this.char.name, 22, C.hot, 'center').setOrigin(0.5);
    } else addLabel(this, vw * 0.5, vh * 0.5 - 20, 'P' + this.winner + ' WINS', 52, col, 'center').setOrigin(0.5);
    addLabel(this, vw * 0.5, vh - 46, 'PRESS START TO RETURN TO MENU', 14, C.dim, 'center').setOrigin(0.5);
  }
  update() {
    if (this.ctrl.pressed.START1 || this.ctrl.pressed.START2 || uiPressed(this, 'enter')) this.scene.start('Menu');
    flush(this);
  }
}

setupShell();

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-root',
  backgroundColor: '#08111f',
  physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, ControlsScene, CreditsScene, CharacterSelectScene, GameScene, EndScene],
};

new Phaser.Game(config);
