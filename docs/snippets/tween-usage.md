# Tween Usage Pattern

## Purpose
Use small tweens for readable feedback and short-lived FX cleanup.

## Snippet
```js
function fxGone(scene, node, cfg) {
  return scene.tweens.add({
    ...cfg,
    targets: node,
    onComplete: () => node.destroy(),
  });
}

fxGone(this, flash, {
  alpha: 0,
  scaleX: 1.3,
  scaleY: 1.3,
  duration: 120,
});
```

## Notes
- Reuse one helper for "animate then destroy".
- Use `this.tweens.killTweensOf(target)` before reusing long-lived animated objects like pickups.
