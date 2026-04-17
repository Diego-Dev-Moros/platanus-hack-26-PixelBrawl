# Stamina System

## Goal

Replace a traditional damage percent or health system with a simpler stamina-based knockback model.

## Core Rule

Each player has:

- `stamina`
- `staminaMax`

Hits reduce stamina.
Lower stamina means the player receives more knockback.

## Starter Values

- starting `staminaMax`: `100`
- basic attack stamina damage: `8`
- dash hit stamina damage: `10`
- special stamina damage: `12-15`

## Special Damage Values

- `Pulse`: `12`
- `Volt`: `14`
- `Crush`: `15`

## Fatigue Rule

When stamina reaches `0`:

- the player enters fatigue for `900 ms`
- the player cannot use dash
- the player cannot use special
- the player remains vulnerable

This creates a punish window without adding a heavy status system.

## Design Intent

The stamina system should:

- make repeated hits matter
- increase ring-out danger over time
- create comeback tension
- stay simple enough for one-file implementation

## Implementation Principle

Keep it lightweight.

Avoid:

- layered buffs
- multiple resource bars
- complex recovery math

Prefer:

- one scalar value
- one fatigue timer
- one knockback multiplier derived from stamina ratio

## Pickups

Pickups are optional and should only be added after the core combat works.

If added, allowed effects are:

- restore stamina
- increase `staminaMax`
- increase attack power

Keep pickup logic minimal.
