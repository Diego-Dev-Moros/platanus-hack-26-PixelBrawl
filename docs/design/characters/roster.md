# Current Roster

## Overview
This document records the live high-level behavior and fantasy of each fighter.

## Scope
This document owns:

- per-character role summary
- per-character special summary
- per-character combat read at a high level

This document does not own:

- shared roster rules in `docs/design/characters/overview.md`
- visual construction rules in `docs/design/characters/visual-language.md`
- low-level code structure in `docs/design/characters/implementation-notes.md`

## Current Implementation

### PULSE
- role: balanced close-range controller
- fantasy: disciplined martial strikes into radial shockwave pressure
- special behavior: radial push hitbox centered on the fighter
- live special cooldown: `2200 ms`
- live special damage baseline: `12`

### VOLT
- role: anti-air launcher
- fantasy: glove-first pressure and uppercut punishes
- special behavior: narrow vertical strike in front of the fighter
- live special cooldown: `2000 ms`
- live special damage baseline: `14`

### CRUSH
- role: heavy slam threat
- fantasy: body-weight impact into landing burst pressure
- special behavior: forced downward slam followed by landing burst hitbox
- live special cooldown: `2400 ms`
- live special damage baseline: `15`

## Design Intent
- Make each fighter readable in one glance and one sentence.
- Use specials as the main gameplay differentiator.
- Keep the roster compact enough that each fighter has a clear lane.

## Rules / Constraints
- Do not document unimplemented balance plans here.
- Keep role descriptions short and player-facing.
- If a fighter changes in code, update the high-level read here before rewriting broader overview copy elsewhere.

## Technical Notes
- Role summaries should match the live `CHARS.line` and special behavior, not legacy prototypes.
- Detailed hitbox and knockback behavior belongs in combat or implementation notes, not here.

## Known Issues
- The roster is readable, but front-end presentation still gives less context than the gameplay scene itself.
- Character identity is stronger than before, but still constrained by a shared movement baseline and primitive-only art.

## Safe Iteration Guidelines
- When changing a special, update the fantasy line, live behavior summary, and cooldown/damage entry together.
- Keep this file descriptive, not speculative.
- If multiple docs need the same per-character fact, this file should be the primary summary reference.
