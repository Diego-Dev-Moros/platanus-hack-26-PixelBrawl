# Character Visual Language

## Overview
This document defines the live visual-read rules for the three fighters: silhouette, costume cue, color usage, and per-character VFX language.

## Scope
This document owns:

- fighter silhouette priorities
- per-character visual read rules
- per-character VFX identity at a high level

This document does not own:

- global art direction in `docs/design/visual/current-state.md`
- arena-specific art direction in `docs/design/arena/visual-direction.md`
- combat rule ownership in `docs/design/combat/base-combat.md`

## Current Implementation
- Fighters are drawn at small scale and move quickly, so readability depends on silhouette first.
- Current visual priority order is:
  1. silhouette
  2. value contrast
  3. costume cue
  4. VFX support
  5. micro-detail

### PULSE
- karateka read
- cleaner torso and trim cues
- white / cyan strike accents

### VOLT
- boxer read
- gloves and guarded upper body must read first
- yellow / orange punch accents

### CRUSH
- sumo read
- heavy torso and lower center of gravity
- dust / impact emphasis and heavier lower-body read

## Design Intent
- Make each fighter identifiable while moving, not only while standing still.
- Let VFX reinforce identity rather than replace silhouette.
- Preserve a compact arcade read under size and asset constraints.

## Rules / Constraints
- Extra rectangles only belong if they improve silhouette or contrast.
- Color alone is not enough; each fighter still needs a readable body shape.
- Character VFX language should support the fighter read without overwhelming combat clarity.

## Technical Notes
- Fighter visuals are generated in `buildFighter()` from rectangles inside containers.
- The current code uses per-character accent colors plus shared combat FX helpers.

## Known Issues
- The fighters are materially stronger than the original block versions, but they still lean on color and FX more than on pose variety.
- Tiny detail has a poor byte-to-readability ratio in this project.

## Safe Iteration Guidelines
- Improve silhouette before adding decorative detail.
- If a visual change weakens in-motion readability, cut it even if it looks better in a still image.
- Keep global visual rules in the visual doc and per-fighter reads here.
