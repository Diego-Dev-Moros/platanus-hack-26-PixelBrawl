# Core Game Loop

## Overview
This document defines the live match structure of `Pixel Brawl`: how a match starts, escalates, resolves, and returns control to the front-end flow.

## Scope
This document owns:

- match start, live round flow, and match end
- countdown, timer, final phase, and win resolution
- stock-based pacing and automatic respawn as match rules

This document does not own:

- attack and hit rules in `docs/design/combat/base-combat.md`
- stamina and fatigue behavior in `docs/design/stamina/stamina-system.md`
- stage layout in `docs/design/arena/main-stage.md`
- scene transitions in `docs/design/scenes/scene-flow.md`

## Current Implementation
- Matches begin after character select and a `3`, `2`, `1`, `BRAWL!` countdown.
- `GameScene` does not fully start player control until the countdown clears and gravity is enabled.
- Each player starts with `3` lives and respawns automatically after ring-out until their lives are exhausted.
- The live round includes movement, combat, pickups, moving platforms, stamina/percent pressure, and HUD updates.
- Match time starts at `180000 ms`.
- At `120000 ms`, a stage-shift beat starts and center-platform motion activates.
- At `75000 ms`, pre-final split begins and the center platform separates into two halves.
- Final phase triggers at `60000 ms`; split is locked in and motion/pacing multipliers escalate.
- A match ends when one player reaches `0` lives or when the timer expires.
- Timeout resolves by lives, then stamina, then lower percent. If all three are tied, the game returns to the menu as a draw.

## Design Intent
- Keep rounds short, readable, and decisive.
- Let the last `75s` feel increasingly dangerous without switching to a second arena.
- Maintain an arcade rhythm: quick start, active mid-match, strong finish, fast reset into the next round.

## Rules / Constraints
- Countdown, timer, final phase, and timeout resolution are match-wide systems and must remain deterministic.
- Stock play is the primary win condition; timeout is the fallback, not the main path.
- Final phase must increase pressure without changing the core controls or combat model.
- Match flow changes should not silently alter HUD timing, respawn timing, or stage mutation timing.

## Technical Notes
- The live loop is concentrated in `GameScene.update()`.
- The `ready` gate prevents normal gravity/control until countdown completion.
- `updateMatchTimer()` owns timer decay, final-phase trigger, and timeout handoff.
- KO/respawn timing is handled with delayed callbacks inside `GameScene`.

## Known Issues
- Stage pacing now spans multiple timer beats (`120s`, `75s`, `60s`), so timer and stage regression risk are coupled.
- KO / respawn flow resets many player fields together, so omissions are easy to introduce.
- The match loop is stable, but it is sensitive because most runtime systems meet in `GameScene`.

## Safe Iteration Guidelines
- Treat countdown, final phase, timeout logic, and respawn timing as regression-sensitive.
- If match structure changes, retest countdown start, final-phase trigger, timeout winner logic, and draw fallback together.
- Keep high-level match rules here and move subsystem details back to their owning docs instead of duplicating them.
