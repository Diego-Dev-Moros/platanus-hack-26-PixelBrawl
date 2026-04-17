# Milestone 01: Character Design

## Goal

Lock the roster and special definitions before building deeper combat polish.

## Deliverables

- `3` defined characters
- one clear role per character
- one special per character
- fixed starter values for cooldown, area, and stamina damage
- minimal character select rules

## Locked Decisions

### Character Select

- yes, there is character select
- it must stay minimal
- one single screen before the match
- both players may select the same character
- no pick locking

### Input Flow

- `P1`: move with `A / D`, confirm with `F`
- `P2`: move with `Left / Right`, confirm with `K`

### Roster

- `Pulse`: `Shockwave`
- `Volt`: `Uppercut`
- `Crush`: `Ground Slam`

### Shared Design Rule

- same base movement
- same jump
- same lives
- same basic attack
- same dash
- only the special changes

## Locked Special Values

### Pulse

- cooldown: `2200 ms`
- radius: `60 px`
- force: `1.0`
- stamina damage: `12`

### Volt

- cooldown: `2000 ms`
- width: `34 px`
- height: `68 px`
- vertical force: `1.2`
- horizontal force: `0.55`
- stamina damage: `14`

### Crush

- cooldown: `2400 ms`
- impact radius: `65 px`
- force: `1.15`
- stamina damage: `15`
- accelerated fall during activation

## Pending

- final visual layout of the select screen
- exact special recovery feel
- final arena-dependent tuning

## Next Step

Move to:

1. `arena`
2. `core match flow`
3. `base combat`

Do not keep expanding the roster before a playable match exists.
