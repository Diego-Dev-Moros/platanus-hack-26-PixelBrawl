# Scene Flow

## Overview
This document defines the current scene list, the routes between scenes, and the responsibility of each scene.

## Scope
This document owns:

- scene order
- scene transition routes
- per-scene runtime responsibility

This document does not own:

- match rules in `docs/design/core/game-loop.md`
- UI composition in `docs/design/ui/current-state.md`
- Phaser API details in `docs/phaser-quick-start.md`

## Current Implementation

### Scene List
- `BootScene`
- `MenuScene`
- `CharacterSelectScene`
- `ControlsScene`
- `CreditsScene`
- `GameScene`
- `EndScene`

### Runtime Routes
- `BootScene` -> `MenuScene`
- `MenuScene` -> `CharacterSelectScene`
- `MenuScene` -> `ControlsScene`
- `MenuScene` -> `CreditsScene`
- `CharacterSelectScene` -> `GameScene`
- `ControlsScene` -> `MenuScene`
- `CreditsScene` -> `MenuScene`
- `GameScene` -> `EndScene`
- `GameScene` -> `MenuScene` on draw / post-match return path
- `EndScene` -> `MenuScene`

### Scene Responsibilities
- `BootScene`: minimal entry scene, immediately starts the menu.
- `MenuScene`: title hub for play, controls, credits, and exit placeholder.
- `CharacterSelectScene`: two-player lock-in scene with independent cursor movement and mirror-pick support.
- `ControlsScene`: static control explanation and return path.
- `CreditsScene`: static credits and return path.
- `GameScene`: live gameplay, HUD, stage, pickups, music, timer, final phase, KO/respawn, and winner resolution.
- `EndScene`: winner presentation, celebration, and return to the menu.

## Design Intent
- Keep front-end flow simple and fast for local play.
- Make the game enter matches quickly and return to menu cleanly after resolution.
- Keep scene responsibilities narrow enough to stay maintainable even though `GameScene` is large.

## Rules / Constraints
- Scene flow should stay explicit and easy to trace.
- `BootScene` should remain minimal unless startup complexity truly increases.
- Front-end scenes should not absorb gameplay ownership that belongs in `GameScene`.
- Character select owns lock-in flow, not combat rules.

## Technical Notes
- Every live scene binds the shared input layer and flushes one-frame input state in `update()`.
- `CharacterSelectScene` starts `GameScene` only after both players are locked and confirm with start.
- `GameScene` can return to `MenuScene` either through draw resolution or post-match start input.

## Known Issues
- Front-end scenes are functional but still less visually cohesive than the gameplay HUD.
- Text encoding artifacts remain in some non-gameplay labels.
- `GameScene` carries most project complexity, so scene-boundary drift is a maintenance risk.

## Safe Iteration Guidelines
- If a scene gains new responsibility, check whether it actually belongs to a domain doc instead.
- Retest confirm/back inputs across the whole route whenever scene transitions change.
- Keep combat, arena, and HUD behavior owned by their domain docs even when they live inside `GameScene`.
