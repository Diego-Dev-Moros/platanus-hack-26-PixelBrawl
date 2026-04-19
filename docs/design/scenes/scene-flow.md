# Scene Flow

## Current Scene List

- `BootScene`
- `MenuScene`
- `CharacterSelectScene`
- `ControlsScene`
- `CreditsScene`
- `GameScene`
- `EndScene`

## Runtime Flow

`BootScene` -> `MenuScene` -> `CharacterSelectScene` -> `GameScene` -> `EndScene`

Auxiliary routes:

- `MenuScene` -> `ControlsScene`
- `MenuScene` -> `CreditsScene`
- `ControlsScene` -> `MenuScene`
- `CreditsScene` -> `MenuScene`
- `EndScene` -> `MenuScene`

## BootScene

Current role:

- minimal entry scene
- immediately transfers into `MenuScene`

Do not grow this scene unless boot-time setup becomes unavoidable.

## MenuScene

Current role:

- title/menu hub
- play / controls / credits / exit
- visual preview of the three fighters

Current quality:

- functional and readable
- still closer to an arcade prototype screen than a finished front-end
- contains some text encoding artifacts that should be cleaned

## CharacterSelectScene

Current role:

- separate roster select scene
- both players can move independently and lock in
- both players can still pick the same fighter

Current implementation state:

- three cards
- one line of character fantasy per fighter
- explicit lock status for P1 / P2
- starts match only after both are locked and `START` is pressed

## ControlsScene

Current role:

- static controls explanation
- explains movement, jump, attack, dash/special, and win condition

Current issue:

- useful but utilitarian
- typography and spacing do not yet match the more polished gameplay HUD

## CreditsScene

Current role:

- static credits
- returns to menu on start/confirm

Current issue:

- same as controls: functional, not yet premium

## GameScene

Current role:

- core gameplay scene
- background, platforms, HUD, players, pickups, music, timer, final phase, KO/respawn, winner resolution

Systems currently handled here:

- input polling
- movement and jumps
- stamina / fatigue / shielding
- percent accumulation and knockback
- attacks, dash, specials
- hit feedback and VFX
- pickups and buffs
- moving platforms
- final minute platform mutation
- timeout resolution

Risk note:

- this scene already concentrates most of the project complexity and byte weight

## EndScene

Current role:

- displays winner
- plays celebration animation
- delays winner text until after the celebration
- returns to menu on start

Current quality:

- materially better than the first version
- still compact and contest-safe
- not a full cinematic layer, but enough for an arcade contest build
