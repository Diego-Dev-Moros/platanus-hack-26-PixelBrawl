# Character Implementation Notes

## Goal

Design the character system so it fits cleanly into `game.js` without overengineering.

## Strategy

Do not create separate runtime classes per character.

Use:

- one shared player base
- one small definition table
- one function per special or one switch by special type

## Recommended Model

Each character only needs:

- `id`
- `name`
- `color`
- `accent`
- `special`

Optional:

- `shape`
- `headShape`

Example:

```js
const CHARS = {
  pulse: { name: 'Pulse', color: 0x00e5ff, accent: 0xffffff, special: 'shockwave' },
  volt: { name: 'Volt', color: 0xffdd00, accent: 0xff7a00, special: 'uppercut' },
  crush: { name: 'Crush', color: 0xff3cac, accent: 0xff5a36, special: 'groundSlam' }
};
```

## Special System

Do not build three separate subsystems.

Prefer:

- one shared input path
- one shared cooldown concept
- one per-type resolution branch

Conceptual example:

```js
function useSpecial(p) {
  if (p.cd > 0) return;
  if (p.char.special === 'shockwave') doShockwave(p);
  else if (p.char.special === 'uppercut') doUppercut(p);
  else doGroundSlam(p);
}
```

## Desired Reuse

All three specials should reuse:

- temporary hitbox creation
- target check against the rival
- knockback application
- stamina reduction
- visual flash
- cooldown handling

## What Not To Do

- do not create a `Pulse`, `Volt`, and `Crush` class
- do not split runtime characters into importable files
- do not add skill hierarchies
- do not create detailed data that will never be used

## What To Do

- prototype ideas in `tmp/workbench/characters/`
- document decisions in this folder
- move only the final validated version into `game.js`

## Recommended Order

1. implement the shared player base
2. implement the basic attack
3. implement `Shockwave`
4. duplicate the structure for `Uppercut`
5. duplicate the structure for `Ground Slam`
6. tune cooldowns and force

## File Size Risks

The main risks are:

- duplicated logic across specials
- too many per-character states
- too many distinct visual effects
- complex balancing before gameplay is validated

## Final Rule

Characters should feel different because of space control, not code complexity.
