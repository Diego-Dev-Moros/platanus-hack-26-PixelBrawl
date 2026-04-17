# Character Design Overview

## Goal

Define `3` playable characters for `Pixel Brawl` under these rules:

- same base movement
- same base stats
- same jump
- same speed
- same base body size
- only the special attack changes

The goal is not to replicate `Smash Bros` characters, but to use their **archetypes** as reference:

- area push fighter
- vertical launcher fighter
- descending impact fighter

This keeps the game simple, readable, and cheap in file size.

## Design Constraints

- everything must be represented with simple geometry
- no complex animation
- no spritesheets
- no heavy VFX
- no deeply different per-character logic
- the special should reuse the same hitbox and knockback systems

## Shared Base

All characters share:

- similar base width and height
- same horizontal acceleration
- same max speed
- same jump
- same gravity
- same number of lives
- same starting stamina
- same starting max stamina
- same basic attack
- same base dash or lunge

## Real Differentiation

Each character is differentiated by:

- color
- geometric silhouette
- special
- combat feel

They are not differentiated by:

- complex combos
- skill trees
- heavy stat separation
- exclusive systems

## Implementation Principle

The ideal implementation is:

- one data structure per character
- one `id`
- one main color
- one or two secondary colors
- one head/detail type
- one special type or special function

Conceptual example:

```js
{
  id: 'shock',
  name: 'Pulse',
  color: 0x00e5ff,
  accent: 0xffffff,
  special: 'shockwave'
}
```

## Feel Target

The three characters should feel different even with shared stats.

That difference should come from:

- when each special is best used
- what zone of space each character controls
- how each character forces mistakes

## Expected Roster Coverage

The final roster should cover:

1. horizontal pressure and clearing space
2. vertical punishment
3. aerial and falling threat

That is enough variety for a jam-scale `1v1` game.
