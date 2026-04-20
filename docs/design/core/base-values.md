# Base Values

## Overview
This document records the live shared numeric baselines that multiple systems depend on.

## Scope
This document owns:

- shared match constants
- shared movement baselines
- shared global timing baselines
- shared knockback curve references

This document does not own:

- per-character move specs or per-hitbox values
- buff-specific durations beyond listing their live baseline
- UI, stage, or audio tuning

## Current Implementation

### Match Baselines
- lives: `3`
- gravity: `980`
- base move speed: `220`
- jump velocity: `-420`
- death bounds: `x < -80`, `x > 880`, `y > 680`

### Shared Timing Baselines
- respawn invulnerability: `1200 ms`
- shared dash cooldown constant: `900 ms`
- fatigue duration baseline: `1000 ms`
- fatigue recovery burst: `35 stamina`
- pickup spawn window: `7000-10000 ms`

### Shared Knockback References
- base horizontal knockback: `240`
- base vertical knockback: `155`
- percent cap reference: `190`
- percent divisor reference: `172`
- percent gain reference: `0.46`

### Live Buff Durations
- power: `10000 ms`
- speed: `10000 ms`
- regen: `8000 ms`
- guard: `9000 ms`

## Design Intent
- Keep the most reused numeric baselines in one place.
- Separate shared constants from move-specific tuning so iteration stays readable.
- Preserve a compact arcade scale instead of letting hidden values drift between systems.

## Rules / Constraints
- Only values reused across domains belong here.
- Per-character specials, attack cooldowns, and detailed move specs belong in character or combat docs.
- When a shared value changes in code, this document should be updated before dependent docs are rewritten around it.

## Technical Notes
- Most live constants are declared near the top of `game.js`.
- Shared movement and match values feed multiple systems at once: combat feel, arena behavior, HUD pacing, and match resolution.
- The knockback curve references are used by combat logic but are global, not move-specific.

## Known Issues
- The current code keeps most values centralized, but some older docs still imply outdated abstractions.
- Shared baselines are easy to document incorrectly if a value has moved into `MOVESET` or another per-character table.

## Safe Iteration Guidelines
- Change this document only for truly shared values.
- If a value only affects one move or one fighter, keep it out of this file.
- Retest all dependent systems when editing knockback, timing, or movement baselines.
