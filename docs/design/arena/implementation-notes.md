# Arena Implementation Notes

## Overview
This document records how the live stage is represented and updated in code.

## Scope
This document owns:

- platform runtime data model
- stage construction pattern
- moving-platform update model
- staged transition implementation notes

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
- Stage transition state is phase-based (`0` normal, `1` pre-final split, `2` final phase).
- `triggerPreFinalSplit()` removes the old center platform and spawns two split halves with shared visual family and split metadata.
- `updatePlatforms(...)` handles split and non-split branches; split separation from `75s` to `60s` is smoothstep-interpolated.
- `triggerFinalPhase()` locks split progress, snapshots final positions, and escalates deterministic motion.

## Design Intent
- Keep stage logic data-driven and compact.
- Separate collision and rendering so the platform art can change without rewriting the collision model.
- Reduce per-frame work by updating only moving platforms.

## Rules / Constraints
- Hitbox position and visual position must stay in sync.
- Static groups must be refreshed after creation or mutation.
- Transition flow should remain coordinated (`normal -> preFinalSplit -> finalPhase`), not a chain of unrelated edits.

## Technical Notes
- `addStagePlatform(...)`, `setStagePlatformPos(...)`, and `updatePlatforms(...)` are the core helpers.
- `triggerPreFinalSplit()` and `triggerFinalPhase()` own stage-phase transitions.
- Platform visuals are built from containers, not tilemaps or external assets.
- Edge snap depends on cached `halfW` and `snapTop` values attached to platform runtime data.

## Known Issues
- Arena code is one of the larger non-combat systems in `game.js`.
- Stage transition flow is compact but sensitive because it affects timer checks, geometry, and motion together.

## Safe Iteration Guidelines
- If platform behavior changes, retest collision, landing consistency, edge snap, and final phase together.
- Prefer better data reuse over new ad hoc platform branches.
- Keep gameplay ownership in `main-stage.md` and runtime representation details here.
