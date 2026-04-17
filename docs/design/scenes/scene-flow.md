# Scene Flow

## Goal

Define a minimal scene structure that supports the full game loop without overengineering.

## Scene List

- `BootScene`
- `MenuScene`
- `GameScene`
- `EndScene`

## BootScene

Purpose:

- initialize shared game state
- register scene transitions
- move quickly into menu or select

This scene should stay tiny.

## MenuScene

Purpose:

- act as title screen and character select wrapper
- show `SELECT YOUR BRAWLER`
- handle P1 and P2 choice flow

This can be the same place where character selection happens.

## GameScene

Purpose:

- create the arena
- spawn both players
- run movement
- run combat
- handle deaths, respawns, stamina, and win checks

This is the main scene and should contain most gameplay code.

## EndScene

Purpose:

- show winner
- offer restart
- return to menu / select

Keep this scene minimal and fast.

## Recommended Flow

`BootScene` -> `MenuScene` -> `GameScene` -> `EndScene`

Then:

- restart match
- or return to select

## Scope Rule

Do not add extra scenes unless they clearly reduce complexity.

For this project, more scenes usually means more overhead for little gain.
