# Character Select

## Goal

Add character identity before combat starts without inflating scope.

## Design Rule

Character select should exist, but it must stay minimal.

Do not build:

- animated menu trees
- profile panels
- stat pages
- complex transitions

Build:

- one pre-match screen
- three visible choices
- simple cursor movement
- simple confirm flow

## Screen Layout

The screen should show:

- title: `SELECT YOUR BRAWLER`
- three character cards or columns
- character name
- character color
- one short special line

## Input Flow

### Player 1

- move cursor with `A / D`
- confirm with `F`

### Player 2

- move cursor with `Left / Right`
- confirm with `K`

## Selection Order

- Player 1 picks first
- Player 2 picks second
- once both confirm, the match starts

## Important Rule

Both players are allowed to pick the same character.

Do not block duplicate picks.
That adds logic cost and gives little benefit in a jam setting.

## Why This Is Worth It

This screen adds:

- immediate character identity
- clear match setup
- low code cost
- better replay value

It should still remain a small wrapper around the actual combat loop.
