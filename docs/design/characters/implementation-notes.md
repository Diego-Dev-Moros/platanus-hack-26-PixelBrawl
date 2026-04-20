# Character Implementation Notes

## Overview
This document records how character identity is currently implemented in code.

## Scope
This document owns:

- roster data structure
- per-character move/value tables
- fighter visual construction model
- implementation constraints for adding or changing a fighter

This document does not own:

- shared roster design rules in `docs/design/characters/overview.md`
- per-character player-facing summaries in `docs/design/characters/roster.md`
- shared combat interaction rules in `docs/design/combat/base-combat.md`

## Current Implementation
- Characters are implemented through compact definition tables plus shared player state.
- `CHARS` owns fighter-facing identity data such as `id`, `name`, `color`, `accent`, short fantasy line, special cooldown, and special damage baseline.
- `MOVESET` owns per-character combat specs for basic attacks, dash attacks, and specials.
- Shared player runtime state is created once in `makePlayer()`.
- Character visuals are generated in `buildFighter()` as rectangle containers, not sprites.

## Design Intent
- Keep character code flat, compact, and easy to audit.
- Preserve one shared player model with narrow per-character branches.
- Concentrate differentiation in data tables and special handling instead of separate runtime classes.

## Rules / Constraints
- Do not split fighters into separate scene objects or custom classes.
- Prefer one roster table, one moveset table, and one shared action pipeline.
- Character-specific logic should justify itself through clear gameplay or readability value.

## Technical Notes
- `CHARS`, `MOVESET`, `buildFighter()`, and special-case FX branches are the main character identity surfaces.
- `PULSE` and `VOLT` use direct special attack objects; `CRUSH` uses a slam state that converts into a landing burst.
- The current implementation is size-sensitive, so repeated one-off move objects should be avoided.

## Known Issues
- Character identity is compact and maintainable, but it also means small mistakes in shared logic can affect all fighters at once.
- Some older docs described “shared attack structure” too loosely and hid the live per-character move values.

## Safe Iteration Guidelines
- If a fighter changes, update `CHARS`, `MOVESET`, and any relevant fighter visual or FX branch together.
- Keep code structure shared unless the new behavior cannot fit the current tables.
- Treat the current one-table / one-shared-model approach as a core maintenance constraint.
