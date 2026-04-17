# Base Values

## Shared Match Values

- lives: `3`
- horizontal speed: `220`
- jump force: `420`
- world gravity: `980`
- basic attack cooldown: `280 ms`
- dash cooldown: `900 ms`
- base special cooldown: `2200 ms`
- respawn invulnerability: `1200 ms`

## Shared Stamina Values

- starting stamina max: `100`
- basic attack stamina damage: `8`
- dash hit stamina damage: `10`
- fatigue duration at zero stamina: `900 ms`

## Special Stamina Damage

- `Pulse / Shockwave`: `12`
- `Volt / Uppercut`: `14`
- `Crush / Ground Slam`: `15`

## Design Rule

These are starter values, not final values.

They should be tuned only after:

1. the arena exists
2. a full match can be played
3. the three specials are implemented

## Why Keep These Shared

Shared base values help:

- reduce code size
- reduce balancing chaos
- make the roster easier to learn
- make special identity matter more than stat identity
