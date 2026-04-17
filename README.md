# Pixel Brawl

`Pixel Brawl` is a local 1v1 arcade platform fighter built for the Platanus arcade hackathon.
The target is a compact, readable Phaser 3 game that stays within strict jam constraints:

- Phaser 3 only
- max `50kb` after minification
- no external assets
- no images, spritesheets, or external audio
- no network calls
- everything generated in code

The design goal is simple: two players enter a compact arena, trade hits, build knockback through stamina loss, and try to push each other off the stage.

## Core Idea

The game takes inspiration from platform fighters, but strips the formula down to a small arcade loop:

- `2` local players
- `3` lives each
- ring-out by falling outside the arena
- instant respawn with brief invulnerability
- last player standing wins

### Differential Mechanic: Stamina

Instead of a traditional health bar, each player uses `stamina`.

- hits reduce `stamina`
- lower `stamina` increases knockback received
- reaching `0` triggers a short fatigue state
- pickups can restore stamina or improve stats

This keeps the combat readable while giving the game a mechanical identity beyond basic knockback.

## Visual Plan

All visuals are generated directly in code:

- players: rectangles and circles
- arena: dark background plus neon grid
- platforms: solid geometry
- attacks: temporary flashes, hitboxes, and simple particles
- UI: text, life markers, and stamina bars

This is intentional. It avoids asset weight and keeps iteration fast.

## Characters

There are `3` playable characters.

Shared across all characters:
- same movement
- same jump
- same base speed
- same core stats

Only the special move changes:
- `Shockwave`: short area push
- `Uppercut`: vertical launcher
- `Ground Slam`: downward impact on landing

## Planned Scene Structure

- `BootScene`
- `MenuScene`
- `GameScene`
- `EndScene`

## First Implementation Goal

The first milestone is intentionally narrow:

1. base Phaser structure
2. `GameScene`
3. platforms
4. two players
5. movement + gravity
6. platform collisions
7. death by falling
8. respawn

Combat comes after the movement loop is stable.

## Working Rules

Gameplay work should stay focused on:

- `game.js`
- `metadata.json`
- `cover.png`

Docs may also update:

- `CLAUDE.md`
- `README.md`

## Phaser Docs In This Repo

This repo includes two local reference files:

- [`docs/phaser-quick-start.md`](docs/phaser-quick-start.md)
- [`docs/phaser-api.md`](docs/phaser-api.md)

They are useful, but they serve different purposes.

### `docs/phaser-quick-start.md`

Use this file for fast idea lookup and example patterns.

What it is good for:
- scene flow examples
- tweens
- particles
- audio ideas
- graphics snippets
- seeing how Phaser concepts are typically used

Important caveat:
- this file mixes older Phaser material with newer Phaser 3 material
- some snippets use Phaser 2 style APIs such as `game.state.*`
- do not copy those snippets directly into this project without adapting them

For this repo, prefer Phaser 3 scene-based usage:

```js
class GameScene extends Phaser.Scene {
  preload() {}
  create() {}
  update() {}
}
```

And scene-scoped systems such as:

- `this.add`
- `this.physics`
- `this.sound`
- `this.tweens`
- `this.input`

### `docs/phaser-api.md`

Use this file as the exact API reference.

It is best when you already know what you want to do and need to confirm:

- method names
- parameters
- return values
- events
- object properties

Typical use cases:
- checking the signature of a loader method
- verifying tween events
- confirming particle emitter options
- reviewing scene, physics, and game object APIs

Short version:
- `quick-start` helps with direction
- `api` helps with precision

## Suggested Doc Workflow

When building features in this repo:

1. define the mechanic in plain terms
2. check `docs/phaser-quick-start.md` for a nearby example
3. verify the exact Phaser 3 method in `docs/phaser-api.md`
4. implement the smallest version first
5. keep checking file size and complexity

## Design Principles

- gameplay first
- avoid overengineering
- prefer shared helpers over deep abstractions
- keep data structures flat
- use Phaser built-ins where they save code
- generate visuals and audio cheaply
- add juice only after the game loop feels good

## Preferred Skills

Requested skills for future agent work:

- `frontend-design`
- `canvas-design`

`frontend-design` was requested twice in the original brief; it is listed once here intentionally.
