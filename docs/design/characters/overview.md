# Character Overview

## Overview
This document defines the live roster model and the shared rules for how character differentiation works in `Pixel Brawl`.

## Scope
This document owns:

- the current roster size
- the shared character baseline
- the high-level rule for where character differentiation comes from

This document does not own:

- full combat rules in `docs/design/combat/base-combat.md`
- per-character visual reads in `docs/design/characters/visual-language.md`
- character implementation structure in `docs/design/characters/implementation-notes.md`

## Current Implementation
- The live roster has `3` fighters: `PULSE`, `VOLT`, and `CRUSH`.
- All fighters share base movement speed, jump behavior, stock count, stamina baseline, shield model, and the same top-level action model.
- Differentiation currently comes from:
  - one special per fighter
  - silhouette and color language
  - hit-feel emphasis and VFX treatment
  - one short fantasy line used in front-end presentation

## Design Intent
- Keep the roster compact and readable.
- Preserve a shared baseline so local matches are easy to parse.
- Make each fighter feel distinct without paying the byte cost of fully separate character subsystems.

## Rules / Constraints
- New character complexity is more expensive than improving the clarity of the current three fighters.
- Shared movement and action structure should remain shared unless the design cost is justified across the whole game.
- Roster docs should describe live behavior only, not speculative balance notes.

## Technical Notes
- Character identity is split across the `CHARS` table, `MOVESET`, `buildFighter()`, and character-specific VFX branches.
- The game currently supports mirror picks.

## Known Issues
- Character identity is clear enough in play, but the current implementation still depends on FX and color more than on deep animation variety.
- Some older docs still restate the same roster facts in multiple places.

## Safe Iteration Guidelines
- Update this file when the shared roster model changes, not when only one fighter's details change.
- Keep per-character specifics in `roster.md`, `visual-language.md`, and `implementation-notes.md`.
- Treat any change to the shared character baseline as a cross-domain change affecting combat, UI, and scene presentation.
