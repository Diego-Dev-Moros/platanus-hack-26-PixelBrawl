# Visual Current State

## Overview
This document defines the live global visual direction of the project.

## Scope
This document owns:

- global rendering strategy
- project-wide readability rules
- silhouette, contrast, and primitive-language rules

This document does not own:

- per-character visual identity in `docs/design/characters/visual-language.md`
- arena-specific art direction in `docs/design/arena/visual-direction.md`
- HUD information hierarchy in `docs/design/ui/current-state.md`

## Current Implementation
- All live visuals are generated in code from rectangles, circles, `Graphics`, text, lightweight particles, and tweens.
- There are no external art assets in the current implementation.
- The live visual stack includes:
  - fighter silhouettes from rectangle builds
  - procedural background and platform art
  - pickup and buff iconography
  - combat flashes, sparks, rings, and impact splatter
  - procedural HUD chrome and bars

## Design Intent
- Prioritize gameplay readability over decorative detail.
- Make the project feel intentional and distinct within contest-safe constraints.
- Use strong silhouette, value contrast, and color separation before adding micro-detail.

## Rules / Constraints
- Visuals must remain procedural and byte-conscious.
- Fighter, pickup, platform-edge, and hit-feedback readability take priority over background richness.
- New detail must justify itself through readability or atmosphere, not novelty alone.
- Primitive-based art is a constraint, not a temporary placeholder.

## Technical Notes
- Most visual systems are built from shared helpers plus small per-system branches.
- The live project relies on containers for composite objects and `Graphics` for reusable drawn surfaces.
- Combat FX are short-lived primitives rather than emitter-heavy systems.

## Known Issues
- Visual consistency still varies by scene.
- Some systems became better by layering improvements on top of older work, which can blur the visual rule set.
- The project has a stronger identity than before, but some non-gameplay scenes still trail the gameplay presentation.

## Safe Iteration Guidelines
- Strengthen silhouette and contrast before adding more moving detail.
- If a visual improvement weakens gameplay parsing, reject it.
- Keep domain-specific visual rules in the character or arena docs and use this file only for project-wide rules.
