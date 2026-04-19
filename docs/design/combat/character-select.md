# Character Select

## Current State

Character select is a dedicated scene, not folded into the menu.

Current behavior:

- three roster cards
- player-independent cursor movement
- player-independent lock-in
- match starts only after both players lock and confirm

## Displayed Information

Each card currently shows:

- fighter visual
- character name
- one short fantasy line
- lock / focus status

## Roster Identity

Current identity exposed to players:

- `PULSE`: karateka / shockwave
- `VOLT`: boxer / uppercut
- `CRUSH`: sumo / ground slam

## Input Flow

- P1 moves with left/right and locks with the mapped attack button
- P2 moves with left/right and locks with the mapped attack button
- `START` begins the match once both are locked

## Current Quality Assessment

- structurally correct
- communicates roster and lock state well enough
- still visually lighter than the gameplay HUD
- should eventually share stronger typography and spacing rules with the rest of the front-end
