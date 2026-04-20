# Input Binding Pattern

## Purpose
Bind raw keys once, map them into cabinet codes, and clear one-frame input after each update.

## Snippet
```js
function bindKeys(scene) {
  const ctrl = scene.ctrl = makeCtrl();
  const onDown = e => {
    const code = mapKey(e.key);
    if (!code) return;
    if (!ctrl.held[code]) {
      ctrl.pressed[code] = true;
      ctrl.frame.push(code);
    }
    ctrl.held[code] = true;
  };
  const onUp = e => {
    const code = mapKey(e.key);
    if (code) ctrl.held[code] = false;
  };
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onDown);
    window.removeEventListener('keyup', onUp);
  });
}

function flush(scene) {
  const { frame, pressed } = scene.ctrl;
  for (let i = 0; i < frame.length; i++) pressed[frame[i]] = false;
  frame.length = 0;
}
```

## Notes
- `held` is for sustained actions.
- `pressed` is for one-frame actions.
- Call `flush(this)` once at the end of `update()`.
