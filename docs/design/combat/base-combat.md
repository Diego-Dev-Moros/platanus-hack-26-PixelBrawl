# Base Combat

## Overview
This document defines the live combat interaction model: attacks, defensive interaction, hit resolution, knockback, and hit feedback.

## Scope
This document owns:

- shared attack and defense actions
- hit detection and hit resolution
- knockback rules
- shield, block, combo, and directional influence behavior
- combat feedback rules

This document does not own:

- stamina and fatigue as resource systems in `docs/design/stamina/stamina-system.md`
- roster identity in `docs/design/characters/overview.md`
- stage geometry in `docs/design/arena/main-stage.md`

## Current Implementation

### Shared Actions
- Every fighter has a basic attack, dash attack, air dodge, shield, and one special.
- Basic attacks use grounded and aerial variants and create temporary attack objects.
- Basic and dash hits use distance-based sweetspot logic.
- Alt input resolves by priority: moving air dodge in air, then moving dash, then special, then dash fallback if special is unavailable.
- Dash attacks create temporary dash state and attack state together.
- Air dodge grants brief invulnerability, consumes air-dodge availability, and applies a shortened dash cooldown gate.
- Shield is held-input defense only. It is unavailable during stun or fatigue and drains stamina continuously.

### Specials
- `PULSE`: radial shockwave-style push tool.
- `VOLT`: vertical uppercut / launcher.
- `CRUSH`: forced downward slam into landing burst.

Detailed identity and per-character behavior belong in the character docs.

### Hit Resolution
- Combat hit checks are manual and use active attack objects plus `hitBox(...)`, not Arcade overlap callbacks.
- On hit, the target gains percent and loses stamina.
- Knockback is derived from base force, percent growth, target stamina ratio, sweetspot, attacker power buff, low-stamina attacker bonus, target guard state, and final-phase multiplier.
- Targets can influence launch direction by holding left, right, or up at hit time.
- Blocked hits use the same hit path with shield-specific dampening and feedback changes.
- Combo state is tracked on the target for `1800 ms`.
- At `3` combo hits, the attacker regains `7` stamina.
- At `5` combo hits, the attacker gets an extra flash / tone reward.
- Stun duration scales down as combo count rises.

### Block / Shield Interaction
- Blocked hits use the target's active shield state.
- Blocked hits reduce outgoing knockback sharply and suppress blood effects.
- Blocked hits create lighter shake and shield-specific flash / ring / audio treatment.
- Guard buff applies even when the target is not actively shielding, but it is weaker than a true block.

## Design Intent
- Keep combat compact but layered.
- Make blocked hits feel absorbed, normal hits feel sharp, and heavy hits feel like payoffs.
- Preserve quick local-fighter readability over deep frame-data complexity.

## Rules / Constraints
- Combat timing and interaction priority must not change silently.
- Manual hit detection is intentional and should stay separate from stage collision.
- Shield, combo, and knockback all share the same hit path; changes here affect multiple systems at once.
- Character identity should come from specials, hit feel, and silhouette, not from splitting the shared action model into separate per-character subsystems.

## Technical Notes
- Shared attack creation flows through normalized attack objects.
- `hitPlayer()` is the main combat resolution path and the densest combat function in the file.
- Combat feedback reuses shared primitive FX helpers instead of Phaser particle emitters.
- Final phase and some character-specific cases apply extra launch scaling after the base hit calculation.

## Known Issues
- `hitPlayer()` is still a dense integration point for combat, stamina, buffs, feedback, and HUD dirtiness.
- Combat polish adds code weight quickly because every branch also affects feedback.
- Block, guard, and stamina interactions are correct but easy to misread if docs drift.

## Safe Iteration Guidelines
- Treat `hitPlayer()`, alt-action priority, and shield behavior as regression-sensitive.
- If a combat rule changes, retest basic hits, dash hits, specials, blocked hits, combo rewards, and final-phase launches together.
- Keep per-character fantasy out of this file unless it changes a shared combat rule.
