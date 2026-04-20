# Stamina System

## Overview
This document defines the live stamina model: stamina loss, fatigue, passive recovery, shield drain, and stamina-related buffs.

## Scope
This document owns:

- `stamina` and `staminaMax`
- fatigue entry and fatigue recovery
- passive recovery timing
- shield drain as a stamina cost
- regen and guard as stamina-adjacent buffs

This document does not own:

- the full hit-resolution path in `docs/design/combat/base-combat.md`
- general match flow in `docs/design/core/game-loop.md`
- pickup spawn behavior or UI layout

## Current Implementation
- Every player starts with `100` stamina and `100` stamina max.
- Hits reduce stamina.
- Lower stamina increases knockback taken through combat-side multipliers.
- Reaching `0` stamina triggers fatigue and cancels the target's active attack or slam state.
- Standard fatigue lasts `1000 ms`.
- Shielding drains stamina continuously while the shield is held.
- A shield break caused by drain uses a shorter fatigue burst than a full combat exhaustion case.
- Passive recovery resumes only when the player is not fatigued and is below max stamina.
- Normal passive recovery starts after `2000 ms` without being hit.
- Regen buff increases recovery rate and bypasses the normal out-of-combat delay.
- When fatigue ends, the player gets a `35` stamina recovery burst and a short recovery animation state.

## Design Intent
- Keep stamina as the short-term endurance and defense resource.
- Make shielding a real trade, not a free safety state.
- Let fatigue create brief punish windows without replacing percent as the main launch-risk read.

## Rules / Constraints
- Percent remains the main long-term launch-risk indicator.
- Stamina governs defense, sustain, and fatigue access.
- Stamina changes are gameplay-sensitive because they affect shielding, knockback, and tempo together.
- Guard and regen belong here only as stamina-facing modifiers, not as full pickup-system ownership.

## Technical Notes
- Stamina decay and recovery are updated in the player timer path each frame.
- Combat applies stamina loss in `hitPlayer()`.
- Fatigue exit side effects are centralized in `finishFatigue()`.
- HUD dirtiness is triggered when stamina segments, fatigue state, percent, cooldown text, or buff mask changes.

## Known Issues
- Stamina now carries real gameplay meaning, so UI competition with percent is a live readability risk.
- Shield drain, fatigue, recovery, guard, and regen all meet at runtime, which makes this system easy to regress with small changes.

## Safe Iteration Guidelines
- Retest shield break, full exhaustion, passive recovery, regen recovery, and post-fatigue pop together.
- Keep stamina changes separate from percent changes unless the combat model is being intentionally reworked.
- Do not add more stamina-specific sub-systems unless they clearly justify the added complexity.
