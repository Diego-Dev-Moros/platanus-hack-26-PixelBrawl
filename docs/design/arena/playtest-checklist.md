# Arena Playtest Checklist

## Goal

Verify that the current live stage supports the implemented match systems without hurting readability.

## Core Questions

1. Does the opening layout create useful neutral and edge pressure?
2. Do the moving side and top platforms create routing options without causing accidental deaths?
3. Does the final-minute split create a meaningful pace shift?
4. Are pickups still readable and reachable on moving platforms?
5. Is the ruined-desert background readable during heavy combat?

## Specific Checks

### Movement

- jumps between current platform heights feel natural
- players do not snag on moving-platform edges
- edge-snap / recovery behavior feels stable

### Combat

- `PULSE` can control space without covering everything
- `VOLT` can threaten anti-air routes around the top platform
- `CRUSH` gets meaningful slam opportunities from platform height
- shield, percent, and ring-out interactions remain readable in final phase

### Match Pace

- the first two minutes do not feel too static
- final minute creates higher tension without chaos
- ring-outs and respawns stay fair after the main-platform split

### Readability

- players remain readable over dunes, ruins, and FX
- platform tops and edges are obvious at a glance
- pickup silhouettes are still clear during motion
- HUD remains readable while action stays centered

## Tuning Order

If the arena feels wrong, tune in this order:

1. platform motion ranges and heights
2. final-phase split behavior
3. blast-zone pressure
4. pickup visibility on platforms
5. visual polish
