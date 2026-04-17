# Main Arena

## Goal

Design one primary arena for `Pixel Brawl` that is:

- easy to read
- fast to implement
- cheap in code size
- good for local `1v1`
- compatible with edge kills
- compatible with the three current specials

This stage should be the first and possibly only arena needed for the jam version.

## Arena Philosophy

The arena should support:

- direct clashes at center stage
- platform movement above the center
- edge pressure and ring-out play
- enough verticality for `Uppercut` and `Ground Slam`
- enough side pressure for `Shockwave`

It should avoid:

- maze-like structure
- too many platforms
- long dead zones with no interaction
- awkward camera needs

## Recommended Stage Layout

Use one large main platform plus `3` smaller floating platforms.

### Platform Count

- `1` main floor
- `2` mid-height side platforms
- `1` small upper center platform

This gives enough variety without turning the match into platform clutter.

## Suggested Coordinates

Assuming the game uses an `800 x 600` playfield:

### Main Floor

- position: centered
- size: `420 x 28`
- approximate center: `(400, 470)`

### Left Platform

- size: `120 x 20`
- approximate center: `(250, 360)`

### Right Platform

- size: `120 x 20`
- approximate center: `(550, 360)`

### Top Platform

- size: `100 x 18`
- approximate center: `(400, 270)`

These values are starter values and should be nudged during gameplay testing.

## Spawn Points

Players should spawn above the main floor, not directly at the edges.

Recommended spawn positions:

- Player 1: `(320, 300)`
- Player 2: `(480, 300)`

Respawn points can reuse these or shift slightly outward if needed.

## Blast Zones / Death Bounds

The arena should kill by falling out of bounds.

Minimum required death zone:

- bottom kill line below the visible platforms

Recommended optional out-of-bounds checks:

- left death bound
- right death bound

Starter bounds:

- left: `< -80`
- right: `> 880`
- bottom: `> 680`

This creates enough off-stage space for knockback without dragging matches out too long.

## Why This Layout Works

### For Pulse

- strong near edges on the main floor
- useful around side platforms where opponents land close

### For Volt

- uppercut threat under side platforms and top platform
- clear anti-air role in center stage

### For Crush

- top platform and side platforms create natural slam routes
- descending pressure is easy to read and useful

## Match Flow Intent

The expected flow is:

1. players clash on the main floor
2. one player takes a side platform
3. the other contests upward
4. pressure pushes the fight toward an edge
5. a special or knockback sends someone off-stage

That is enough structure for an arcade fighter without needing multiple stage gimmicks.
