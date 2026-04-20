# Arena Implementation Notes

## Overview
This document records how the live stage is represented and updated in code.

## Scope
This document owns:

- platform runtime data model
- stage construction pattern
- moving-platform update model
- final-phase mutation implementation notes

This document does not own:

- stage coordinates and gameplay intent in `docs/design/arena/main-stage.md`
- arena art direction in `docs/design/arena/visual-direction.md`
- general Phaser patterns in `docs/phaser-quick-start.md`

## Current Implementation
- The arena uses invisible static hitboxes plus separate visual containers.
- Stage setup starts from shared platform config data.
- Runtime stage data stores:
  - hitbox
  - visual
  - base position
  - horizontal motion data
  - optional vertical motion data
  - cached geometry for edge-snap logic
- Moving platforms are tracked separately from the full platform list.
- Final phase mutates the existing platform set instead of loading a second arena.

## Design Intent
- Keep stage logic data-driven and compact.
- Separate collision and rendering so the platform art can change without rewriting the collision model.
- Reduce per-frame work by updating only moving platforms.

## Rules / Constraints
- Hitbox position and visual position must stay in sync.
- Static groups must be refreshed after creation or mutation.
- Final-phase mutation should remain a single coordinated transition, not a chain of unrelated edits.

## Technical Notes
- `addStagePlatform(...)`, `setStagePlatformPos(...)`, and `updatePlatforms(...)` are the core helpers.
- Platform visuals are built from containers, not tilemaps or external assets.
- Edge snap depends on cached `halfW` and `snapTop` values attached to platform runtime data.

## Known Issues
- Arena code is one of the larger non-combat systems in `game.js`.
- Final-phase mutation is compact but sensitive because it affects both geometry and motion.

## Safe Iteration Guidelines
- If platform behavior changes, retest collision, landing consistency, edge snap, and final phase together.
- Prefer better data reuse over new ad hoc platform branches.
- Keep gameplay ownership in `main-stage.md` and runtime representation details here.
