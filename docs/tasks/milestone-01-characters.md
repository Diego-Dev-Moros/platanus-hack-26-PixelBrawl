# Milestone 01: Character System State

## Purpose

This document now serves as a snapshot of the currently implemented roster baseline.
It is no longer a planning note for a future milestone.

## Current Roster

- `PULSE`: radial shockwave special
- `VOLT`: vertical uppercut special
- `CRUSH`: downward slam with landing burst

## Shared Gameplay Baseline

- same base movement speed
- same jump tuning
- same stock count
- same base attack structure
- same dash / air-dodge / shield framework
- character differentiation comes primarily from the special and visual identity

## Current Character Select Rules

- separate `CharacterSelectScene`
- both players move cursors independently
- each player must lock their pick
- match starts only after both players lock and confirm
- mirror picks are allowed

## Current Special Baseline

### Pulse

- cooldown: `2200 ms`
- fantasy: area control / pushback
- current implementation: radial hitbox centered on the fighter

### Volt

- cooldown: `2000 ms`
- fantasy: anti-air launcher
- current implementation: narrow vertical strike in front of the fighter

### Crush

- cooldown: `2400 ms`
- fantasy: downward body slam
- current implementation: forced descent followed by a landing burst hitbox

## Current Visual Intent

- `PULSE`: karateka
- `VOLT`: boxer
- `CRUSH`: sumo

See:

- [Current Roster](/abs/path/docs/design/characters/roster.md)
- [Character Visual Language](/abs/path/docs/design/characters/visual-language.md)
- [Base Combat](/abs/path/docs/design/combat/base-combat.md)
