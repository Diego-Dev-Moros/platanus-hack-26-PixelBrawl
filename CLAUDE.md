# CLAUDE.md

Project: `Pixel Brawl`

Purpose: guide Claude/Codex for this repo with minimal token use.

## Mission

Build a local 1v1 arcade platform fighter in `game.js` with Phaser 3.
Core loop: move, jump, hit, knockback, ring-out, respawn, last player with lives wins.

## Hard Constraints

- Use Phaser 3 only.
- Keep final minified `game.js` under `50kb`.
- No external assets.
- No external URLs.
- No network calls.
- Generate everything in code: shapes, text, particles, simple audio.
- Prefer compact logic over abstraction-heavy code.

## Project Edit Rules

Default gameplay work should only touch:
- `game.js`
- `metadata.json`
- `cover.png`

Documentation-only tasks may also edit:
- `CLAUDE.md`
- `README.md`

Do not modify config, checker, or scaffold files unless the user explicitly asks.

## Game Definition

Name: `Pixel Brawl`

Genre:
- local versus arcade brawler
- platform fighter
- inspired by Smash-like knockback, but much simpler

Win condition:
- each player has `3` lives
- falling out of bounds loses `1` life
- auto respawn after death
- last player with lives remaining wins

## Core Mechanics

Movement:
- left / right
- jump
- optional double jump only if cheap in code and stable
- gravity
- platform collisions

Combat:
- basic short-range attack
- dash or lunge
- one special per character

Stamina system:
- use `stamina` instead of classic health
- hits reduce stamina
- lower stamina means higher knockback received
- at `0` stamina, player enters short fatigue state and becomes vulnerable
- keep implementation flat and lightweight

Pickups:
- restore stamina
- increase `staminaMax`
- increase attack power

## Characters

There are `3` playable characters.

Shared:
- same movement
- same base stats
- same jump
- same speed

Only difference:
- special move

Suggested specials:
- `Shockwave`: short area push
- `Uppercut`: vertical launcher
- `Ground Slam`: downward impact on landing

Visual identity:
- geometric bodies only
- distinct color per player / character

## Visual Direction

Arena:
- dark background
- neon grid drawn with `Graphics`
- solid floating platforms

Players:
- body with `rectangle`
- head with `circle` or small `rectangle`

Attacks:
- temporary hitbox
- brief flash rectangle / graphics
- simple particles only

UI:
- lives
- stamina bars
- minimal text

## Controls

Respect cabinet input mapping from `game.js`.
Never replace existing `CABINET_KEYS` entries.
For local testing, only append extra keys if needed.

Logical mapping target:
- P1: move, jump, attack, special/dash
- P2: move, jump, attack, special/dash

User-preferred local keyboard layout:
- P1: `A D W F G`
- P2: `ArrowLeft ArrowRight ArrowUp K L`

When implementing controls, map these through arcade codes, not raw keys in game logic.

## Preferred Architecture

Use simple scenes:
- `BootScene`
- `MenuScene`
- `GameScene`
- `EndScene`

Player data should stay compact. Each player object should carry only what the loop needs:
- position / body
- facing
- lives
- stamina
- staminaMax
- knockback
- cooldowns
- control mapping
- character id
- state flags

Prefer:
- shared helper functions
- data objects over deep class trees
- one scene with tight update logic

Avoid:
- unnecessary classes
- large config trees
- verbose effect systems
- overengineered entity frameworks

## Phaser Guidance

This repo includes:
- `docs/phaser-quick-start.md`
- `docs/phaser-api.md`

How to use them:
- `phaser-quick-start.md`: idea source and example bank
- `phaser-api.md`: exact API reference

Important:
- `phaser-quick-start.md` mixes old Phaser 2 snippets with Phaser 3 material
- for this project, prefer Phaser 3 scene-based patterns:
  - `preload()`
  - `create()`
  - `update()`
  - `this.add`
  - `this.physics`
  - `this.tweens`
  - `this.sound`

If an example uses `game.state` or other Phaser 2 style APIs, adapt it before using it.

## Implementation Priorities

Order of work:
1. stable movement and platforming
2. death zones and respawn
3. basic attacks and knockback
4. stamina scaling
5. specials
6. pickups
7. juice: particles, camera shake, small audio cues, UI polish

Always favor:
- readable compact code
- responsive gameplay
- cheap visuals
- deterministic interactions

## Output Style For Future Agents

When helping on this repo:
- explain technical choices briefly
- keep code compact
- work iteratively
- call out size or performance risks early
- avoid adding features that do not improve the core fight loop

## Preferred Skills

Use these skills when relevant:
- `frontend-design`
- `canvas-design`

Note:
- `frontend-design` was requested twice; keep it as a preferred skill, not duplicated in execution.
