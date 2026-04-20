# HUD Update Pattern

## Purpose
Mark HUD state dirty only when tracked values change, then redraw only the pieces that actually changed.

## Snippet
```js
function updateHudState(scene, p) {
  const hud = p._hud;
  const ns = Math.ceil(p.stamina / p.staminaMax * 10);
  const nsp = p.spCd > 0 ? Math.ceil(p.spCd / 1000) : -1;
  const nbk = buffMask(p.buffs);
  const nf = p.fatigue > 0;
  const np = Math.round(p.percent);

  if (ns !== hud.seg || nsp !== hud.sp || nbk !== hud.bk || nf !== hud.fat || np !== hud.pct) {
    hud.seg = ns; hud.sp = nsp; hud.bk = nbk; hud.fat = nf; hud.pct = np;
    scene.hudDirty = true;
  }
}

function setHudLabel(node, text, color) {
  if (node._text !== text) { node.setText(text); node._text = text; }
  if (color && node._color !== color) { node.setColor(color); node._color = color; }
}
```

## Notes
- Cache the last drawn state on the player and the UI nodes.
- Redraw bars, badges, and labels only when the cached values change.
