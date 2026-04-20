# Arena Visual Direction

## Overview
This document defines the live visual direction of the arena specifically, not the whole game.

## Scope
This document owns:

- stage backdrop theme
- arena layer order
- rules for keeping the arena behind gameplay

This document does not own:

- global art rules in `docs/design/visual/current-state.md`
- fighter-specific visual reads in `docs/design/characters/visual-language.md`
- platform layout in `docs/design/arena/main-stage.md`

## Current Implementation
- The current arena reads as a desert sunset with ruins and buried city/temple fragments.
- The live layered stack is:
  - sky color bands
  - sun disc
  - cloud layer
  - far skyline silhouettes
  - mid ruin layer
  - dune layers
  - drifting dust and wind streaks
- Platforms use simple ship-like containers with emissive accents rather than abstract flat blocks.

## Design Intent
- Give the match a distinct place without stealing focus from the fighters.
- Use depth and atmosphere to support motion, not to create visual noise.
- Make the arena feel intentional within contest-safe procedural constraints.

## Rules / Constraints
- Background layers must stay behind fighters, pickups, platform edges, and hit effects.
- Arena detail should improve mood, not compete with gameplay clarity.
- Platform silhouettes must remain readable against the backdrop.

## Technical Notes
- The arena background is fully procedural and built with `Graphics`, shapes, and lightweight animated particles.
- Parallax and ambient particles are updated continuously during gameplay.

## Known Issues
- The arena is materially stronger than an early graybox, but it is still more “good layered desert scene” than one singular iconic location.
- Scene-level visual consistency outside gameplay still lags behind the quality of the arena and HUD.

## Safe Iteration Guidelines
- If new detail weakens contrast behind fighters or pickups, remove it.
- Strengthen shape language before increasing particle count.
- Keep global rendering principles in the visual doc and arena-specific direction here.
