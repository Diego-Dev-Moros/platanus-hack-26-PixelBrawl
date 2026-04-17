# Base Combat

## Goal

Define the smallest combat model that still feels like a platform fighter.

## Shared Combat Kit

All characters have:

- one basic attack
- one dash
- one special

The basic attack and dash are shared.
Only the special changes by character.

## Basic Attack

### Purpose

Fast, short-range pressure tool.

### Recommended Values

- cooldown: `280 ms`
- horizontal range: `38-44 px`
- hitbox height: `26-30 px`
- stamina damage: `8`

### Design Role

- close-range neutral tool
- edge pressure starter
- low-commit poke

## Dash

### Purpose

Quick reposition or burst entry tool.

### Recommended Values

- cooldown: `900 ms`
- travel distance: `70-90 px`
- hitbox: body-sized or slightly larger if it deals contact damage
- dash hit stamina damage: `10`

### Design Role

- approach
- burst reposition
- quick punish

## Specials

### Role In The Match

Specials should feel important, but not rare.

They should:

- create clear combat identity
- reward timing
- matter in edge play and platform control
- remain readable

### Cooldown Rule

- shared target range: `2000-2400 ms`
- each character can vary slightly

## Knockback Philosophy

Knockback should be:

- readable
- strong enough to create ring-out tension
- amplified by low stamina

Do not make knockback so large that every clean hit kills.

## Recovery And Risk

Every strong option needs some exposure:

- basic attack: short commitment
- dash: moderate commitment
- special: highest commitment

This keeps neutral meaningful without building a heavy combat engine.
