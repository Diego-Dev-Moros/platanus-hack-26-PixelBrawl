# Core Game Loop

## Goal

Define the smallest complete match loop for `Pixel Brawl`.

## Match Structure

The full loop is:

1. character select
2. match start
3. movement and platform fighting
4. players trade attacks and specials
5. falling out of bounds removes one life
6. player respawns with short invulnerability
7. first player to lose all `3` lives loses
8. end screen
9. restart or return to select

## Core Win Condition

- each player starts with `3` lives
- if a player falls outside the arena, they lose `1` life
- the match ends when one player reaches `0` lives
- the remaining player wins

## Required Systems

- character select
- player spawning
- movement
- jump
- platforms
- basic attack
- dash
- special
- stamina
- death zone
- respawn
- win state

## Design Priorities

The loop should prioritize:

- fast readability
- responsive movement
- short round length
- clear edge pressure
- low technical complexity

## What Should Feel Good First

Before tuning advanced combat, these must already feel solid:

- move left and right
- jump and land
- fight around platforms
- get knocked away
- fall, die, and respawn cleanly

## Match Timing Philosophy

This is a jam-scale local game, so rounds should be:

- quick to understand
- quick to restart
- intense without being messy

That means:

- short cooldowns on basic interaction
- longer cooldowns on specials
- clear death states
- fast reset between rounds
