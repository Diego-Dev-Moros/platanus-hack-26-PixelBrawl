// Pixel Brawl - local 1v1 platform fighter

const W = 800, H = 600;
const GRAVITY = 980, SPEED = 220, JUMP = -420, LIVES = 3;
const ATK_CD = 280, DASH_CD = 900, FATIGUE_MS = 900, INVULN_MS = 1200;
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

function hitRect(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
}

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Menu'); }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    bindKeys(this);
    this.step = 0;
    this.sel = [0, 1];
    this.lock = [0, 0];
    this.cards = [];
    this.add.rectangle(W / 2, H / 2, W, H, C.bg);
    const g = this.add.graphics().lineStyle(1, C.grid, 0.45);
    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
    g.lineStyle(2, C.frame, 0.8).strokeRect(26, 26, W - 52, H - 52);
    addLabel(this, W / 2, 54, 'SELECT YOUR BRAWLER', 28, C.text, 'center').setOrigin(0.5);
    this.sub = addLabel(this, W / 2, 92, '', 13, C.dim, 'center').setOrigin(0.5);
    this.tip = addLabel(this, W / 2, 548, 'MATCH: ATTACK 1 / DASH 2 / SPECIAL 3', 12, C.dim, 'center').setOrigin(0.5);
    for (let i = 0; i < 3; i++) {
      const ch = CHARS[i], x = 160 + i * 240, y = 300;
      const box = this.add.rectangle(x, y, 180, 250, 0x0d1d31).setStrokeStyle(2, 0x2c4f6d);
      const body = this.add.rectangle(x, y + 12, 44, 72, ch.color);
      const head = ch.head ? this.add.rectangle(x, y - 42, 28, 24, ch.accent) : this.add.circle(x, y - 42, 14, ch.accent);
      const name = addLabel(this, x, y - 110, ch.name, 18, '#ffffff', 'center').setOrigin(0.5);
      const line = addLabel(this, x, y + 90, ch.line, 12, C.dim, 'center').setOrigin(0.5);
      const mark = addLabel(this, x, y + 116, '', 12, '#ffffff', 'center').setOrigin(0.5);
      this.cards.push({ box, body, head, name, line, mark });
    }
    this.refresh();
  }

  update() {
    if (this.step === 0) {
      if (this.ctrl.pressed.P1_L) this.sel[0] = (this.sel[0] + 2) % 3;
      if (this.ctrl.pressed.P1_R) this.sel[0] = (this.sel[0] + 1) % 3;
      if (this.ctrl.pressed.P1_1 || this.ctrl.pressed.P1_4) { this.lock[0] = 1; this.step = 1; tone(this, 480, 'square', 0.06, 0.08); }
    } else {
      if (this.ctrl.pressed.P2_L) this.sel[1] = (this.sel[1] + 2) % 3;
      if (this.ctrl.pressed.P2_R) this.sel[1] = (this.sel[1] + 1) % 3;
      if (this.ctrl.pressed.P2_1 || this.ctrl.pressed.P2_4) {
        this.lock[1] = 1; tone(this, 620, 'square', 0.06, 0.08);
        this.scene.start('Game', { picks: [CHARS[this.sel[0]].id, CHARS[this.sel[1]].id] });
        return;
      }
    }
    this.refresh();
    flush(this);
  }

  refresh() {
    this.sub.setText(this.step ? 'P2: LEFT/RIGHT + R or F' : 'P1: A/D + U or J');
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];
      let stroke = 0x2c4f6d, fill = 0x0d1d31, mark = '';
      if (!this.lock[0] && this.sel[0] === i) { stroke = 0x8affd2; fill = 0x133126; mark = 'P1'; }
      if (!this.lock[1] && this.sel[1] === i) { stroke = 0xff93ba; fill = 0x311322; mark = mark ? mark + ' / P2' : 'P2'; }
      if (this.lock[0] && this.sel[0] === i) mark = 'P1 LOCKED';
      if (this.lock[1] && this.sel[1] === i) mark = this.lock[0] && this.sel[0] === i ? 'P1 LOCKED / P2 LOCKED' : 'P2 LOCKED';
      c.box.setFillStyle(fill).setStrokeStyle(2, stroke);
      c.mark.setText(mark);
    }
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.picks = data.picks || ['pulse', 'volt']; }

  create() {
    bindKeys(this);
    this.over = 0;
    this.drawStage();
    this.makeStage();
    this.makeHud();
    this.players = [this.makePlayer(0, this.picks[0]), this.makePlayer(1, this.picks[1])];
    this.refreshHud();
  }

  drawStage() {
    this.add.rectangle(W / 2, H / 2, W, H, C.bg);
    const g = this.add.graphics().lineStyle(1, C.grid, 0.38);
    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
    g.lineStyle(2, C.frame, 0.7).strokeRect(26, 26, W - 52, H - 52);
    g.lineStyle(2, 0x70253b, 0.5).lineBetween(0, 592, W, 592);
  }

  makeStage() {
    this.plats = this.physics.add.staticGroup();
    for (const p of STAGE) {
      const r = this.add.rectangle(p.x, p.y, p.w, p.h, C.plat).setStrokeStyle(2, C.edge);
      this.plats.add(r);
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
    if (p.body.x < -DEATH_X || p.body.x > W + DEATH_X || p.body.y > DEATH_Y) { this.killPlayer(p); return; }
    this.movePlayer(p);
    this.handleActions(p);
    this.updateAttack(p, foe);
    this.checkSlam(p, foe);
    this.syncHead(p);
    if (p.invuln > 0) {
      const a = (Math.floor(p.invuln / 80) % 2) ? 0.35 : 1;
      p.body.alpha = a; p.head.alpha = a;
      p.shield.setVisible(true).setAlpha(0.2 + a * 0.35);
    } else {
      p.body.alpha = 1; p.head.alpha = 1;
      p.shield.setVisible(false);
    }
  }

  tickTimers(p, dt) {
    if (p.invuln > 0) p.invuln -= dt;
    if (p.fatigue > 0) p.fatigue -= dt;
    if (p.stun > 0) p.stun -= dt;
    if (p.atkCd > 0) p.atkCd -= dt;
    if (p.dashCd > 0) p.dashCd -= dt;
    if (p.spCd > 0) p.spCd -= dt;
    if (p.dashT > 0) p.dashT -= dt;
    if (p.atk) {
      p.atk.t -= dt;
      if (p.atk.t <= 0) p.atk = null;
    }
  }

  movePlayer(p) {
    const b = p.body.body;
    const L = p.idx ? 'P2_L' : 'P1_L';
    const R = p.idx ? 'P2_R' : 'P1_R';
    const U = p.idx ? 'P2_U' : 'P1_U';
    if (b.blocked.down || b.touching.down) p.jumps = 2;
    if (p.stun > 0) return;
    if (p.dashT > 0) return;
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
    const A = p.idx ? 'P2_1' : 'P1_1';
    const D = p.idx ? 'P2_2' : 'P1_2';
    const S = p.idx ? 'P2_3' : 'P1_3';
    if (p.stun > 0) return;
    if (this.ctrl.pressed[A] && p.atkCd <= 0) this.basicAttack(p);
    if (this.ctrl.pressed[D] && p.dashCd <= 0 && p.fatigue <= 0) this.doDash(p);
    if (this.ctrl.pressed[S] && p.spCd <= 0 && p.fatigue <= 0) this.doSpecial(p);
  }

  basicAttack(p) {
    p.atkCd = ATK_CD;
    p.atk = { kind: 'basic', t: 85, hit: 0, w: 40, h: 26, ox: p.face * 30, oy: -4, dmg: 8, fx: 0.95, fy: 0.72 };
    this.flash(p.body.x + p.face * 22, p.body.y - 4, 32, 16, p.char.accent, 85);
    tone(this, p.idx ? 240 : 210, 'square', 0.035, 0.05);
  }

  doDash(p) {
    const b = p.body.body;
    const dir = p.face || (p.idx ? -1 : 1);
    p.dashCd = DASH_CD;
    p.dashT = 95;
    p.atk = { kind: 'dash', t: 95, hit: 0, w: 32, h: 34, ox: dir * 18, oy: 0, dmg: 10, fx: 0.9, fy: 0.5 };
    b.setVelocityX(dir * 500);
    this.flash(p.body.x, p.body.y, 44, 20, p.char.color, 110);
    tone(this, 150, 'sawtooth', 0.045, 0.08);
  }

  doSpecial(p) {
    p.spCd = p.char.sp;
    if (p.char.id === 'pulse') {
      p.atk = { kind: 'pulse', t: 110, hit: 0, w: 116, h: 116, ox: 0, oy: 0, dmg: p.char.sd, fx: 1.02, fy: 0.7 };
      this.ring(p.body.x, p.body.y, 16, 64, p.char.color, 140);
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
      p.atk = { kind: 'crush', t: 90, hit: 0, w: 124, h: 50, ox: 0, oy: 6, dmg: p.char.sd, fx: 1.08, fy: 0.78 };
      this.flash(p.body.x, p.body.y + 10, 72, 18, p.char.accent, 120);
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
    const dir = p.body.x <= t.body.x ? 1 : -1;
    let vx = dir * BASE_KB_X * (a.fx || 1) * mul;
    let vy = -BASE_KB_Y * (a.fy || 0.75) * mul;
    if (a.kind === 'dash') vy = -95 * mul;
    t.stamina = Math.max(0, t.stamina - a.dmg);
    if (t.stamina <= 0) t.fatigue = Math.max(t.fatigue, FATIGUE_MS);
    t.stun = a.kind === 'basic' ? 110 : a.kind === 'dash' ? 130 : 150;
    b.setVelocity(vx, vy);
    this.flash(t.body.x, t.body.y - 6, 30, 30, p.char.accent, 100);
    tone(this, 180, 'square', 0.05, 0.08);
  }

  killPlayer(p) {
    if (!p.alive) return;
    p.alive = 0;
    p.lives--;
    p.atk = null;
    p.slam = 0;
    p.body.body.enable = false;
    p.body.setVisible(false).setPosition(-500, -500);
    p.head.setVisible(false).setPosition(-500, -500);
    tone(this, 110, 'sawtooth', 0.18, 0.35);
    this.refreshHud();
    if (p.lives <= 0) {
      this.over = 1;
      const win = this.players[1 - p.idx];
      this.time.delayedCall(500, () => this.scene.start('End', { winner: win.idx + 1 }));
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
    p.body.body.enable = true;
    p.body.body.reset(s.x, s.y);
    p.body.setVisible(true).setAlpha(1);
    p.head.setVisible(true).setAlpha(1);
    p.shield.setVisible(true).setAlpha(0.5);
    this.syncHead(p);
    tone(this, 520, 'triangle', 0.08, 0.16);
  }

  syncHead(p) {
    p.head.x = p.body.x;
    p.head.y = p.body.y - 30;
    p.shield.x = p.body.x;
    p.shield.y = p.body.y - 10;
  }

  flash(x, y, w, h, c, dur) {
    const r = this.add.rectangle(x, y, w, h, c, 0.8);
    this.tweens.add({ targets: r, alpha: 0, scaleX: 1.3, scaleY: 1.3, duration: dur, onComplete: () => r.destroy() });
  }

  ring(x, y, a, b, c, dur) {
    const ring = this.add.circle(x, y, a, c, 0.2).setStrokeStyle(3, c);
    this.tweens.add({ targets: ring, radius: b, alpha: 0, duration: dur, onComplete: () => ring.destroy() });
  }

  refreshHud() {
    const dots = n => '●'.repeat(n) + '○'.repeat(LIVES - n);
    const bar = p => {
      const n = Math.max(0, Math.ceil((p.stamina / p.staminaMax) * 10));
      return '█'.repeat(n) + '·'.repeat(10 - n);
    };
    const cool = p => (p.spCd > 0 ? ' SP ' + Math.ceil(p.spCd / 1000) : ' SP READY');
    const p1 = this.players[0], p2 = this.players[1];
    this.hudP1.setText('P1 ' + p1.char.name + ' ' + dots(p1.lives));
    this.hudP2.setText(dots(p2.lives) + ' ' + p2.char.name + ' P2');
    this.hudS1.setText('STM ' + bar(p1) + (p1.fatigue > 0 ? ' FATIGUE' : '') + cool(p1));
    this.hudS2.setText((p2.fatigue > 0 ? 'FATIGUE ' : '') + bar(p2) + ' STM' + cool(p2));
  }
}

class EndScene extends Phaser.Scene {
  constructor() { super('End'); }
  init(data) { this.winner = data.winner || 1; }
  create() {
    bindKeys(this);
    this.add.rectangle(W / 2, H / 2, W, H, 0x050b16);
    addLabel(this, W / 2, 210, 'P' + this.winner + ' WINS', 54, this.winner === 1 ? C.p1 : C.p2, 'center').setOrigin(0.5);
    addLabel(this, W / 2, 298, 'PRESS START', 18, C.text, 'center').setOrigin(0.5);
    addLabel(this, W / 2, 326, 'TO RETURN TO SELECT', 14, C.dim, 'center').setOrigin(0.5);
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
  scene: [BootScene, MenuScene, GameScene, EndScene],
};

new Phaser.Game(config);
