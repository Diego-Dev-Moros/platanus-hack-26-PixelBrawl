# Character Visual Language

## Goal

Make characters easy to distinguish using only simple shapes.

Since there are no sprites or traditional animation, readability depends on:

- silhouette
- color
- facing direction
- special effect read

## Shared Visual Base

Each character should be built from:

- `1` main body
- `1` head
- `1` optional small detail

Example:

- body: `rectangle`
- head: `circle`
- detail: small `rectangle` or color split

## Readability Rules

- the body should be larger than the head
- the front of the character should read quickly
- the main colors should not be confused across fighters
- the special flash should be different from the basic attack flash
- respawn invulnerability should read through blinking alpha or a bright tint

## Proposed Silhouettes

### Pulse

- wide body
- round head
- feeling: stable and expansive

### Volt

- medium body
- square head
- feeling: compact and sharp

### Crush

- taller body
- smaller head
- feeling: heavy and descending

## Suggested Palette

### Pulse

- main: cyan
- secondary: white

### Volt

- main: yellow
- secondary: orange

### Crush

- main: magenta
- secondary: red

## Special Effects By Character

### Shockwave

- simple ring or expanding rectangle
- short lateral particles

### Uppercut

- vertical flash
- small upward trail

### Ground Slam

- ground burst or hard impact line
- small side particles on landing

## Technical Principle

All of these effects should come from:

- `rectangle`
- `circle`
- `graphics`
- minimal particles
- alpha
- scale
- tint

Nothing more is needed for the roster to feel distinct.
