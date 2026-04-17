# Arena Visual Direction

## Goal

Give the stage a clear identity using code-generated visuals only.

## Visual Theme

The arena should feel like:

- dark
- clean
- neon
- arcade
- readable first, stylish second

## Background

Use a dark background with a subtle neon grid.

Suggested approach:

- very dark blue, charcoal, or near-black base
- thin grid lines with low alpha
- no heavy gradients needed unless they are cheap

The background should never compete with player readability.

## Platforms

Platforms should be:

- solid, bright enough to read immediately
- slightly glowing or accented if cheap
- clearly separated from the background

Suggested visual treatment:

- flat bright fill
- thin outline
- optional accent stripe

## Color Direction

Recommended stage palette:

- background: deep navy or dark gray
- grid: cyan-blue with low alpha
- platform fill: muted steel or dark slate
- platform outline: cyan or white accent

This lets character colors stay dominant.

## Death Zone Communication

The arena does not need visible walls, but the bottom danger area should be readable.

Cheap options:

- a dim red line near the bottom boundary
- subtle red glow below the arena
- particles only when someone dies

Do not clutter the stage with permanent hazard decoration.

## Technical Rule

All stage visuals should come from:

- `graphics`
- `rectangle`
- `lineStyle`
- low-cost alpha overlays

No image assets should be required.
