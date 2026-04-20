# Attack Creation Pattern

## Purpose
Normalize temporary attack objects so basics, dashes, and specials all flow through the same hit path.

## Snippet
```js
function makeAttack(kind, spec, dir, dmg) {
  return {
    kind,
    t: spec[0],
    hit: 0,
    w: spec[1],
    h: spec[2],
    ox: dir * spec[3],
    oy: spec[4],
    dmg: dmg ?? spec[5],
    fx: spec[6],
    fy: spec[7],
  };
}

function setAttack(p, kind, spec, dir, dmg) {
  p.atk = makeAttack(kind, spec, dir, dmg);
  p._atkPoseT = p.atk.t;
}
```

## Notes
- `spec` comes from the shared move tables.
- The active attack is stored on the player and consumed by the shared hit check/update path.
