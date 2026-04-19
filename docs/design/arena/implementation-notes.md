# Arena Implementation Notes

## Current Implementation

The arena is no longer purely static.

Current stage responsibilities include:

- background generation
- static platform hitboxes
- moving platform visual sync
- final phase mutation
- death bound checks

## Data Model

Platforms are stored as live entries containing:

- hitbox
- visual
- base position
- motion range
- phase offset
- optional vertical motion data

## Current Risk

Arena code is now one of the larger non-combat systems in `game.js`.
Future stage polish should prefer better art direction, not more mechanics.
