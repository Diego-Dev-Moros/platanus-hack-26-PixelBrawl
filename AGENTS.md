# AI Agent Instructions for Pixel Brawl

You are helping build `Pixel Brawl`, a compact local multiplayer platform fighter for the Platanus arcade challenge.

Follow these instructions strictly.

## Goal

Build a fun, readable, compact Phaser 3 game in `game.js`.

The game is:
- local `1v1`
- arcade-first
- platform fighter inspired by Smash-like ring-outs
- simplified for size, speed, and clarity

Core loop:
- move
- jump
- collide with platforms
- attack
- build knockback through stamina loss
- knock the opponent off the stage
- respawn until lives are exhausted

## Files To Edit

For gameplay tasks, only edit:
- `game.js`
- `metadata.json`
- `cover.png`

Only edit other files if the user explicitly asks.

## Hard Restrictions

1. Game code must stay at or under `50kb` after minification
2. Vanilla JavaScript only
3. No `import` or `require`
4. No external URLs
5. No network calls
6. No external assets
7. Game runs in a sandboxed iframe with no internet access

## Asset Policy

Do not use:
- external images
- spritesheets
- audio files
- web-loaded fonts

Use only code-generated content:
- rectangles
- circles
- graphics
- text
- simple particles
- generated tones / procedural audio

## Game Definition

Name: `Pixel Brawl`

Match rules:
- `2` players
- `3` lives each
- falling out of bounds loses a life
- automatic respawn
- short respawn invulnerability
- last player with lives remaining wins

## Core Mechanics

### Movement

Required:
- left / right
- jump
- gravity
- platform collision

Optional:
- double jump, only if cheap and stable

### Combat

Required:
- short-range basic attack
- dash or lunge
- clear knockback response

Planned:
- one unique special per character

### Stamina System

This game does not rely on a traditional health bar.

Each player has:
- `stamina`
- `staminaMax`
- knockback scaling based on remaining stamina

Rules:
- hits reduce stamina
- lower stamina means higher knockback received
- at `0` stamina, player enters a short fatigue state
- fatigue should be simple, readable, and cheap to implement

### Pickups

If implemented, keep them lightweight.

Allowed effects:
- restore stamina
- increase `staminaMax`
- increase attack strength

## Characters

There are `3` playable characters.

Shared across all characters:
- same movement
- same base stats
- same jump
- same speed

Only difference:
- special move

Suggested specials:
1. `Shockwave`: radial push
2. `Uppercut`: vertical launcher
3. `Ground Slam`: downward attack with landing burst

## Visual Direction

Everything must be generated in code.

### Arena

- dark background
- neon grid drawn with `Graphics`
- simple floating platforms

### Players

- body: `rectangle`
- head: `circle` or small `rectangle`
- different colors per player / character

### Attacks

- temporary hitboxes
- short flash effects
- simple particles

### UI

- lives
- stamina bars
- minimal readable text

## Architecture Guidance

Prefer a small scene structure:
- `BootScene`
- `MenuScene`
- `GameScene`
- `EndScene`

Prefer:
- one compact source file
- shared helper functions
- flat data structures
- minimal state
- minimal duplication

Avoid:
- deep class hierarchies
- large config objects unless they save code
- overengineered entity systems
- unnecessary abstractions

## Phaser Guidance

Available docs:
- `docs/phaser-quick-start.md`
- `docs/phaser-api.md`

Use them correctly:
- `phaser-quick-start.md` is for examples and fast inspiration
- `phaser-api.md` is for exact method and property lookup

Important:
- `phaser-quick-start.md` mixes old Phaser 2 snippets with Phaser 3 material
- prefer Phaser 3 scene-based patterns for this repo
- if a snippet uses `game.state`, adapt it before use

Preferred Phaser 3 patterns:
- `preload()`
- `create()`
- `update()`
- `this.add`
- `this.physics`
- `this.tweens`
- `this.sound`
- `this.input`

## Controls

Use arcade codes in gameplay logic:
- `P1_U`, `P1_D`, `P1_L`, `P1_R`
- `P1_1` to `P1_6`
- `P2_U`, `P2_D`, `P2_L`, `P2_R`
- `P2_1` to `P2_6`
- `START1`, `START2`

Never use raw keyboard keys directly in core game logic.

Do not replace existing mappings inside `CABINET_KEYS`.
If local test keys are needed, append them only.

Preferred mapping concept:
- Player 1: move, jump, attack, dash/special
- Player 2: move, jump, attack, dash/special

## Storage

Use `window.platanusArcadeStorage` if persistence is needed.

```js
const result = await window.platanusArcadeStorage.get('my-key');
await window.platanusArcadeStorage.set('my-key', { score: 100 });
await window.platanusArcadeStorage.remove('my-key');
```

Storage is optional. Do not add persistence unless it improves the game enough to justify the bytes.

## Development Priorities

Build in this order:

1. stable movement
2. gravity and platform collisions
3. fall death and respawn
4. life tracking and win condition
5. basic attack hitboxes
6. knockback
7. stamina scaling
8. character specials
9. pickups
10. polish: particles, tiny sounds, camera shake, UI cleanup

## Size And Performance Strategy

Always optimize for:
- small code
- responsive controls
- clear feedback
- low visual overhead

Useful habits:
- reuse logic aggressively
- keep objects lightweight
- avoid large arrays or data blobs
- generate visuals procedurally
- only add effects that improve readability or feel

## Validation

Validate regularly with:

```bash
npm run check-restrictions
```

This checks:
- final size after minification
- forbidden imports
- forbidden URLs
- network usage
- safety warnings

Do not run `npm run dev` unless the user explicitly asks. The user handles manual testing.

## Response Style

When working on this repo:
- prioritize implementation over theory
- explain technical decisions briefly
- keep suggestions pragmatic
- call out file-size risks early
- avoid unnecessary features
- prefer iterative improvements over big rewrites

## First Milestone

If the user asks where to start, begin with:

1. base Phaser setup
2. `GameScene`
3. platforms
4. two players
5. movement + gravity
6. collision handling
7. death by falling
8. respawn

Combat should come after the movement loop feels good.
