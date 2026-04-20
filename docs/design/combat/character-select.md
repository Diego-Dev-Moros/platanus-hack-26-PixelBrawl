# Character Select Combat Read

## Overview
This document defines the combat-facing information currently exposed by the character select scene.

## Scope
This document owns:

- the combat identity that character select communicates to players
- the current limits on what combat data is shown before a match

This document does not own:

- scene routing in `docs/design/scenes/scene-flow.md`
- full roster identity in `docs/design/characters/roster.md`
- live combat rules in `docs/design/combat/base-combat.md`

## Current Implementation
- Character select shows three roster cards.
- Each card displays a fighter visual, fighter name, and one short fantasy line.
- The current combat-facing lines are:
  - `PULSE`: `Karateka / shockwave`
  - `VOLT`: `Boxer / uppercut`
  - `CRUSH`: `Sumo / ground slam`
- The scene does not show cooldown values, damage values, matchup tips, or detailed move lists.

## Design Intent
- Give both players enough combat identity to pick quickly.
- Keep pre-match information lightweight and readable for local play.
- Let the actual match teach the deeper interaction details.

## Rules / Constraints
- Character select should communicate role and special fantasy, not become a stat sheet.
- Combat information shown here must stay shorter and simpler than the roster or combat docs.
- If more information is added, it should improve role clarity first.

## Technical Notes
- The short fantasy line is sourced from the live character table in `game.js`.
- Mirror picks are allowed, so the scene must communicate identity clearly without assuming unique selection.

## Known Issues
- The current line format is readable but minimal.
- The select scene is lighter and less polished than the gameplay HUD, so combat identity relies on silhouette and color more than on typography.

## Safe Iteration Guidelines
- Keep this doc focused on what select communicates, not on full character design.
- If the select scene adds icons or more copy, update this file and cross-check `characters/roster.md` for duplication.
- Do not restate full combat rules here.
