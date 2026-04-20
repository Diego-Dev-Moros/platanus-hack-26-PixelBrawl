# Phaser API

This file is the Phaser-side reference for the APIs developers actually touch in `Pixel Brawl`. It is intentionally narrow and runtime-focused.

## Scenes

### What Is Used
- `class SomeScene extends Phaser.Scene`
- `constructor() { super('Key'); }`
- `init(data)`
- `create()`
- `update(time, delta)`
- `this.scene.start('OtherScene', data)`
- `this.events.once('shutdown', cb)`
- `this.sys.isActive()`

### How It Is Used Here
- Every screen is a scene.
- Scene lifecycle owns input binding, display-object creation, timed setup, and cleanup.
- Shutdown hooks are used to remove window listeners and stop repeating scene-owned work.
- Scene transitions are explicit and happen through `this.scene.start(...)`.

### Pattern
```js
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.picks = data.picks || ['pulse', 'volt']; }
  create() {
    bindKeys(this);
    this.startCountdown();
  }
  update(_, dt) {
    if (!this.ready) { flush(this); return; }
    this.updateMatchTimer(dt);
    flush(this);
  }
}
```

## Physics

### What Is Used
- `this.physics.add.existing(gameObject)`
- `this.physics.add.staticGroup()`
- `this.physics.add.collider(a, b)`
- `group.add(gameObject)`
- `group.refresh()`
- `this.physics.pause()`
- `this.physics.resume()`
- `this.physics.world.isPaused`
- Arcade body methods:
  - `setCollideWorldBounds(false)`
  - `setMaxVelocity(x, y)`
  - `reset(x, y)`
  - `setVelocity(x, y)`
  - `setVelocityX(x)`
  - `setVelocityY(y)`
- Arcade body fields:
  - `allowGravity`
  - `enable`
  - `velocity`
  - `blocked`
  - `touching`

### How It Is Used Here
- Players use invisible Arcade bodies for movement and collision.
- Platforms use a static group plus manual refresh after creation or mutation.
- Hit freeze pauses the physics world directly.
- Combat hit detection is not physics overlap based; it is manual and uses attack objects plus `hitBox(...)`.

### Pattern
```js
const body = this.add.rectangle(x, y, 26, 40, 0x000000, 0);
this.physics.add.existing(body);
body.body.setCollideWorldBounds(false).setMaxVelocity(700, 1000);
this.physics.add.collider(body, this.plats);
```

```js
this.plats = this.physics.add.staticGroup();
const hitbox = this.add.rectangle(px, py, w, h, 0x000000, 0);
this.plats.add(hitbox);
this.plats.refresh();
```

## Input

### What Is Used
- Phaser scene lifecycle as the host for the input layer
- `this.events.once('shutdown', cleanup)`

### How It Is Used Here
- Gameplay does not use Phaser keyboard helpers in the core loop.
- The project binds raw keyboard events once and maps them into cabinet codes.
- Scenes own setup and cleanup of that input layer through lifecycle hooks.
- One-frame `pressed` state is cleared with `flush(this)` at the end of `update()`.

### Pattern
```js
function bindKeys(scene) {
  const ctrl = scene.ctrl = makeCtrl();
  const onDown = e => {
    const code = mapKey(e.key);
    if (!code) return;
    if (!ctrl.held[code]) {
      ctrl.pressed[code] = true;
      ctrl.frame.push(code);
    }
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
  const { frame, pressed } = scene.ctrl;
  for (let i = 0; i < frame.length; i++) pressed[frame[i]] = false;
  frame.length = 0;
}
```

## Graphics

### What Is Used
- `this.add.graphics()`
- `clear()`
- `lineStyle(...)`
- `fillStyle(...)`
- `strokeRect(...)`
- `fillRect(...)`
- `fillRoundedRect(...)`
- `strokeRoundedRect(...)`
- `lineBetween(...)`
- `fillTriangle(...)`
- `fillCircle(...)`
- `fillEllipse(...)`
- `beginPath()`, `moveTo()`, `lineTo()`, `closePath()`, `fillPath()`
- `this.add.rectangle(...)`
- `this.add.circle(...)`
- `this.add.container(...)`

### How It Is Used Here
- Background layers, HUD chrome, stamina bars, buff badges, and pickup icons are procedural.
- Shapes are also used directly for bodies, overlays, aura, flashes, and pickup shells.
- Containers group multi-part visuals like fighters, pickups, and platforms.
- Long-lived `Graphics` instances are cached and redrawn only when state changes.

### Pattern
```js
const g = this.add.graphics().setDepth(10);
g.fillStyle(0x07121c, 0.56);
g.fillRoundedRect(14, 10, 224, 76, 10);
g.lineStyle(1, 0x295374, 0.70);
g.strokeRoundedRect(14, 10, 224, 76, 10);
```

```js
const fighter = this.add.container(x, y);
fighter.add(this.add.rectangle(0, 0, 16, 20, color));
fighter.add(this.add.rectangle(0, -12, 12, 10, accent));
```

## Text

### What Is Used
- `this.add.text(x, y, text, style)`
- `setOrigin(...)`
- `setDepth(...)`
- `setAlpha(...)`
- `setScale(...)`
- `setColor(...)`
- `setText(...)`
- `setFontSize(...)`

### How It Is Used Here
- Text is used for menus, timer, HUD labels, countdowns, pickup callouts, ring-out text, and the end screen.
- Long-lived labels are updated through cached helper logic so `setText()` and `setColor()` only run when values actually change.
- Styling is kept simple and procedural: monospace, bold, high contrast.

### Pattern
```js
const label = this.add.text(x, y, text, {
  fontFamily: 'monospace',
  fontSize: '20px',
  fontStyle: 'bold',
  color: '#d7f3ff',
}).setOrigin(0.5);
```

```js
function setHudLabel(node, text, color) {
  if (node._text !== text) { node.setText(text); node._text = text; }
  if (color && node._color !== color) { node.setColor(color); node._color = color; }
}
```

## Tweens

### What Is Used
- `this.tweens.add(config)`
- `this.tweens.killTweensOf(target)`
- Common config fields used here:
  - `targets`
  - `x`, `y`, `alpha`, `angle`, `scaleX`, `scaleY`, `zoom`
  - `duration`
  - `ease`
  - `yoyo`
  - `repeat`
  - `onComplete`

### How It Is Used Here
- Tweens drive countdown pulses, pickup pop-in/out, ring-out text, final-minute banners, end-screen animation, and short-lived FX cleanup.
- Reusable helpers wrap the common "tween and destroy" flow.
- Active tweens are explicitly killed before reusing or removing some objects, especially pickups.

### Pattern
```js
this.tweens.add({
  targets: txt,
  alpha: 0,
  y: H / 2 - 80,
  duration: 2000,
  onComplete: () => txt.destroy(),
});
```

```js
function fxGone(scene, node, cfg) {
  return scene.tweens.add({
    ...cfg,
    targets: node,
    onComplete: () => node.destroy(),
  });
}
```

## Timing

### What Is Used
- `this.time.now`
- `this.time.delayedCall(ms, cb)`
- `this.time.addEvent({ delay, loop, callback })`
- timed event removal via `.remove()`

### How It Is Used Here
- Timing drives the match timer, countdown, KO/respawn flow, final-minute staging, hit-freeze resume, and repeating procedural music.
- Delayed callbacks that can outlive the current scene are guarded with `this.sys.isActive()`.
- The music loop is a repeating timed event, not an audio asset.

### Pattern
```js
this.time.delayedCall(600, () => {
  if (this.sys.isActive()) this.scene.start('End', { winner: 1 });
});
```

```js
scene._musicEvent = scene.time.addEvent({
  delay: 231,
  loop: true,
  callback: () => {
    const ctx = scene.sound && scene.sound.context;
    if (!ctx || ctx.state !== 'running') return;
    // playNote(...)
  },
});
```
