# Main Arena

## Overview
This document defines the live playable stage: layout, motion, final-phase mutation, and the gameplay space it creates.

## Scope
This document owns:

- the current platform layout
- current platform motion
- final-phase stage mutation
- gameplay space created by the live arena

This document does not own:

- low-level platform data model in `docs/design/arena/implementation-notes.md`
- arena-only art direction in `docs/design/arena/visual-direction.md`
- global match flow in `docs/design/core/game-loop.md`

## Current Implementation
- The live stage starts with `1` main platform, `2` side platforms, and `1` top platform.
- Base positions:
  - main: `(400, 470)` size `420 x 28`
  - left: `(240, 352)` size `120 x 20`
  - right: `(560, 352)` size `120 x 20`
  - top: `(400, 270)` size `100 x 18`
- Side and top platforms move during the round.
- Normal motion is horizontal oscillation.
- Side and top platforms also use vertical oscillation data during the final phase.
- Final phase removes the original main platform from active play.
- Final phase adds two lower moving side platforms at `(280, 470)` and `(520, 470)` with size `180 x 28`.

## Design Intent
- Keep the stage readable on one screen.
- Support platform-fighter resets, vertical contests, and edge pressure.
- Use the final minute to increase chaos without needing a second stage.

## Rules / Constraints
- The stage must preserve left/right fairness.
- Platform count and motion should stay readable against the background.
- Final-phase mutation is already a meaningful gimmick; more arena mechanics would raise complexity quickly.

## Technical Notes
- The live layout is defined from shared platform config data in `game.js`.
- Moving platforms are updated from stored base positions and phase/range values.
- Edge snap relies on cached platform geometry, not ad hoc spatial checks.

## Known Issues
- Arena behavior is stable, but final phase touches both geometry and movement pacing.
- Stage fiction is stronger than before, but platform art and world fiction are still less cohesive than the HUD/gameplay layer.

## Safe Iteration Guidelines
- If layout changes, retest landings, edge pressure, top-platform access, and final-phase readability together.
- Keep the arena readable before making it more expressive.
- Put data-model changes in the implementation notes doc, not here.
