# UI Current State

## Overview
This document defines the live HUD and front-end UI state of `Pixel Brawl`.

## Scope
This document owns:

- gameplay HUD content and hierarchy
- front-end screen information layout
- readability and information-priority rules

This document does not own:

- scene routing in `docs/design/scenes/scene-flow.md`
- combat FX in `docs/design/combat/base-combat.md`
- global art direction in `docs/design/visual/current-state.md`

## Current Implementation

### Gameplay HUD
- mirrored left/right player panels
- large percent values
- stock/life display
- centered timer
- segmented stamina bars
- special cooldown state
- fatigue indicator (`EXH`)
- active buff icons

Current gameplay information priority:
1. percent
2. lives
3. timer
4. stamina
5. special cooldown / fatigue
6. buffs

### Front-End UI
- menu with play / controls / credits / exit
- character select with fighter card, name, fantasy line, and lock status
- controls screen
- credits screen
- winner/end screen

## Design Intent
- Keep the gameplay HUD immediately readable during fast exchanges.
- Give front-end scenes enough clarity to support local play without adding unnecessary verbosity.
- Prefer strong hierarchy over decorative density.

## Rules / Constraints
- Do not remove critical gameplay information from the HUD.
- Gameplay UI must prioritize live match decisions over flavor text.
- Front-end screens should communicate state quickly for two players sharing one display.
- UI polish should not come at the cost of gameplay readability.

## Technical Notes
- The gameplay HUD uses cached redraw behavior for timer text, stamina segments, and buff badges.
- Static HUD chrome is separated from the dynamic HUD update path.
- Character select and menu screens use the same shared input abstraction as gameplay scenes.

## Known Issues
- Some non-gameplay labels still contain encoding artifacts.
- Front-end scenes are less visually disciplined than the gameplay HUD.
- Typography and spacing are not yet fully unified across all screens.

## Safe Iteration Guidelines
- If new UI is added, decide whether it is gameplay-critical before giving it persistent HUD space.
- Retest percent, timer, stamina, cooldown, fatigue, and buff visibility together after HUD changes.
- Keep combat-impact FX out of this doc unless they directly change informational readability.
