# Phaser Quick Start

## Purpose
This file is the internal Phaser usage guide for `Pixel Brawl`. It documents the patterns the current game already uses. It is not a Phaser primer, and it should stay aligned with `game.js`.

## Scene Structure In This Project
The game registers scenes directly in the root config:

```js
scene: [BootScene, MenuScene, CharacterSelectScene, ControlsScene, CreditsScene, GameScene, EndScene]
```

Current scene responsibilities:

- `BootScene`: immediate handoff to `MenuScene`
- `MenuScene`: front-door navigation
- `CharacterSelectScene`: lock-in flow (`vs` two-player, `solo` with CPU auto-select)
- `ControlsScene`: input reference screen
- `CreditsScene`: credits screen
- `GameScene`: match runtime, HUD, combat, pickups, FX, audio loop, match resolution
- `EndScene`: winner presentation and return path

There is no asset-loading scene because the project uses procedural visuals and procedural audio. Most scenes only implement `create()` and `update()`.

## `create()` vs `update()`
Use `create()` for:

- binding input with `bindKeys(this)`
- creating all persistent display objects
- building physics bodies and colliders
- initializing per-scene state
- scheduling repeating systems such as music

Use `update()` for:

- reading frame input from `scene.ctrl`
- advancing gameplay state
- moving existing bodies and containers
- updating cached HUD elements only when dirty
- calling `flush(this)` exactly once at the end of the frame

Project rule: do not create ordinary gameplay UI, fighters, platforms, or decorative graphics inside `update()`. Runtime creation is reserved for short-lived FX such as flashes, hit bursts, countdown text, and pickup pop effects.

## Input Pattern
This project does not use Phaser keyboard bindings in gameplay code. Input is normalized manually so all runtime logic reads arcade cabinet codes.

Binding flow:

1. `bindKeys(scene)` installs `window` `keydown` and `keyup` listeners.
2. Raw key names are normalized through `mapKey()` and `KEY_MAP`.
3. Input is stored in `scene.ctrl`: `held[code]` is current held state, `pressed[code]` is the one-frame edge trigger, and `frame[]` tracks which codes were pressed this frame.
4. `flush(scene)` clears only the keys registered in `frame[]`.

Project usage:

- menus mostly use `anyOf(scene, SOME_KEY_GROUP)`
- character select reads specific `scene.ctrl.pressed.*` codes
- gameplay reads `scene.ctrl.held` for sustained actions such as movement and shield, and `scene.ctrl.pressed` for edge-triggered actions

Rules:

- gameplay logic must read cabinet codes such as `P1_L`, `P2_R`, `START1`
- do not use raw key names in gameplay code
- do not mix in `this.input.keyboard` shortcuts unless the project input layer is being intentionally replaced
- always call `flush(this)` before leaving `update()`

## Graphics, Text, and Containers
The project is primitive-driven. The main display building blocks are:

- `Graphics` for background layers, HUD chrome, stamina bars, buff badges, grid lines, and pickup icons
- `Text` for labels, timer, menus, countdown, pickup callouts, and end-of-match messaging
- `Container` for composite visuals such as fighters, pickups, and platform art

Current project patterns:

- wrap text creation in `addLabel()` for consistent monospace styling
- keep long-lived `Graphics` instances and redraw them with `clear()` only when cached state changes
- attach small cache fields such as `g._mask`, `g._seg`, `node._text`, and `node._color` to avoid redundant redraws and `setText()` calls
- use `Container` for visuals only; physics is handled separately

Example pattern:

```js
this.hudFrame = this.add.graphics().setDepth(10);
this.hudTimer = addLabel(this, W / 2, 16, '3:00', 20, C.text, 'center').setOrigin(0.5, 0);
drawHudFrame(this.hudFrame, this.finalPhase);
```

## Arcade Physics Pattern
Arcade Physics is used for:

- player movement and gravity
- platform collision
- world pause / resume during hit freeze

It is not used for attack hit detection. Combat hit checks are manual via `hitBox(...)`.

Current body setup pattern:

```js
const body = this.add.rectangle(x, y, 26, 40, 0x000000, 0);
this.physics.add.existing(body);
body.body.setCollideWorldBounds(false).setMaxVelocity(700, 1000);
this.physics.add.collider(body, this.plats);
```

Important details:

- the physics body is an invisible rectangle
- the visual is a separate `Container`
- the visual must be kept in sync manually in animation helpers
- player state reads from `body.body`, especially `velocity`, `blocked`, `touching`, and `enable`

## Static Groups and Platform Setup
Platforms are built as invisible Arcade bodies plus separate visual containers.

Current pattern:

- `this.plats = this.physics.add.staticGroup()`
- `addStagePlatform(this, spec)` creates the hitbox and visual together
- `this.platData` stores all platform runtime data
- `this.movingPlats` stores only moving platforms
- `this.plats.refresh()` is required after creating or moving static bodies

Important rule: if platform position changes, update both the hitbox and the visual with `setStagePlatformPos(...)`, then refresh the static group.

## Combat and Hit Detection
Combat is intentionally not based on Arcade overlap objects. The game uses temporary attack data objects and manual hitbox checks so combat timing stays independent from platform collision setup.

Project pattern:

- `makeAttack(...)` returns a normalized attack object
- each player stores the active attack in `p.atk`
- `updateAttack(...)`, `checkSlam(...)`, and `hitPlayer(...)` handle combat resolution
- hit pause uses `physics.world.pause()` and delayed resume instead of changing the core loop structure

Do not move combat to physics overlap callbacks unless the whole combat model is being redesigned. Current gameplay depends on combat and movement staying loosely coupled.

## Tweens and Delayed Calls
Tweens and timed callbacks are used heavily for:

- countdowns
- ring-out text
- final-phase banners
- pickup pop-in / pop-out
- short-lived hit FX
- end-screen presentation

Current patterns:

- use `this.tweens.add({...})` for visual interpolation
- use `this.time.delayedCall(ms, cb)` for staged sound and flow control
- use `this.time.addEvent({... loop: true ...})` for repeating music
- when a delayed callback may run after scene shutdown, guard it with `this.sys.isActive()`
- use `this.tweens.killTweensOf(target)` before destroying or reusing animated nodes that may still have active tweens

Shared helpers already exist:

- `fxTween(...)`
- `fxGone(...)`
- `emitRects(...)`

Reuse them before adding one-off tween helpers.

## Procedural Visual and Audio Patterns
Visuals:

- backgrounds are drawn with `Graphics`
- fighters are assembled from rectangles in `buildFighter(...)`
- pickups are assembled from `Graphics` inside `Container`s
- FX are short-lived primitives destroyed on tween completion

Audio:

- one-shot sounds use the Web Audio context exposed via `scene.sound.context`
- `tone(...)` plays a single oscillator burst
- `startMusic(...)` schedules a repeating `time.addEvent(...)` and sequences notes through `playNote(...)`
- the input layer resumes suspended audio context on first keydown

Do not add asset-based sound loading or `this.sound.add('key')` patterns unless the project constraints change.

## Common Project Patterns To Follow
- Prefer helper functions over repeated inline display or tween setup.
- Keep state on plain objects attached to the scene or player records.
- Cache anything the HUD or FX system can cheaply skip.
- Separate invisible gameplay bodies from rendered visuals.
- Use `scene.events.once('shutdown', ...)` for listener and repeating-event cleanup.
- Keep scene startup lightweight and procedural; there is no external asset pipeline to rely on.
- When adding match-state transitions, keep the mutation in one place and mark HUD dirty instead of forcing immediate full redraws in multiple call sites.

## Common Mistakes To Avoid
- Forgetting to call `flush(this)` at the end of `update()`.
- Reading raw keys instead of cabinet codes.
- Creating persistent `Text`, `Graphics`, or `Container` objects every frame.
- Moving only a platform visual or only a platform hitbox.
- Using Arcade overlap for combat just because Phaser supports it; this game does not structure combat that way.
- Redrawing full HUD chrome when only timer text, stamina segments, or buff badges changed.
- Leaving delayed callbacks unguarded when they can outlive the active scene.
- Adding `preload()` asset code, external files, or sprite-based workflows that violate the procedural-only constraint.

## Safe Extension Checklist
When changing Phaser-side code in this project, verify:

- scene transitions still start the correct next scene
- `scene.ctrl` semantics are unchanged
- `flush(this)` still runs once per frame
- static platform bodies still refresh after stage mutation
- hit freeze still resumes physics correctly
- HUD caches still update when match state changes
- temporary tweens and delayed calls do not leak across scene shutdown
