# Stamina System

## Current Model

The live game now uses two overlapping risk systems:

- `stamina` as a defensive / fatigue / shielding resource
- `percent` as the primary launch-risk escalator

Stamina is still important, but it is no longer the only knockback driver.

## Player State

Each player currently has:

- `stamina`
- `staminaMax`
- `fatigue`
- `lastHitTime`
- `shielding`

Related buffs:

- `regen`
- `guard`

## Live Behavior

- hits reduce stamina
- lower stamina increases knockback through a multiplier in `hitPlayer()`
- reaching `0` stamina triggers `fatigue`
- while fatigued, the player loses access to normal action flow
- stamina slowly recovers after time out of combat
- regen buff accelerates recovery
- shielding drains stamina continuously

## Current Tuning

- starting `staminaMax`: `100`
- `EXHAUST_RECOVER`: `35`
- `FATIGUE_MS`: `1000`
- shield drain is continuous while held
- recovery is passive and time-based, not pickup-only

## Design Intent

Stamina should currently read as:

- a short-term defensive endurance system
- the cost of shielding
- the condition for fatigue punish windows
- a secondary danger amplifier layered under percent

It should not replace percent in the current version.

## Current Risks

- the system is now more interesting, but also more visually dense
- if future changes make stamina too prominent in UI, it will compete with percent
- adding more stamina-specific mechanics would likely increase complexity faster than value

## Future Rule

If the game keeps the current percent/stamina hybrid:

- percent remains the main launch-risk indicator
- stamina remains the resource that governs fatigue, defense, and sustain
