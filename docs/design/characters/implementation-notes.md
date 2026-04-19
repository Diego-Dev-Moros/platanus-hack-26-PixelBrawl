# Character Implementation Notes

## Current Implementation

Characters are still implemented through a compact definition table plus shared player state.

Current character data includes:

- `id`
- `name`
- `color`
- `accent`
- `line`
- special cooldown
- special damage

## Visual Implementation

Visuals are generated in `buildFighter()`.
Each fighter is a container of rectangles, not a sprite.

This means:

- silhouette changes are cheap compared to external art
- tiny detail is expensive in bytes and weak in readability
- every extra rectangle must justify itself

## Current Visual Intent In Code

- `PULSE`: gi-like body blocks, cleaner martial silhouette, cyan/white reads
- `VOLT`: glove-forward boxer silhouette, hot yellow/orange flash language
- `CRUSH`: broad torso, lower center of gravity, heavier sumo read

## Current Implementation Rule

Future work should not create separate runtime classes.
Character identity should continue to come from:

- one roster table
- one shared action model
- one per-special branch
- one per-character VFX identity layer
