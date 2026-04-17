# Arena Implementation Notes

## Goal

Keep the arena implementation compact and stable inside `game.js`.

## Recommended Structure

The stage should be built from static rectangles.

Implementation should likely include:

- one array of platform definitions
- one static physics group
- one background draw function
- one out-of-bounds check

## Suggested Platform Data

Conceptual example:

```js
const STAGE = [
  { x: 400, y: 470, w: 420, h: 28 },
  { x: 250, y: 360, w: 120, h: 20 },
  { x: 550, y: 360, w: 120, h: 20 },
  { x: 400, y: 270, w: 100, h: 18 }
];
```

This is small, readable, and enough for a jam build.

## Collision Rule

All platforms should use:

- static physics bodies
- simple rectangular collision

Do not add:

- slopes
- moving platforms
- one-way edge-case behavior unless truly needed

## Out-Of-Bounds Check

The cheapest death system is a simple positional check each update:

```js
if (p.x < -80 || p.x > 880 || p.y > 680) killPlayer(p);
```

That is enough for the current game design.

## Background Rule

The background should be drawn once in scene setup, not rebuilt every frame.

The same applies to:

- grid lines
- static decorative shapes

## Scope Rule

Do not add extra arena features yet:

- no moving hazards
- no destructible platforms
- no stage shifting
- no alternate layouts

One clean stage is enough until the full match loop is proven.
