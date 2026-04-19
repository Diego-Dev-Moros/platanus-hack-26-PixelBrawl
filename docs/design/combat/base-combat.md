# Base Combat

## Current Combat Structure

All fighters currently share:

- movement
- jump logic
- basic attack slot
- dash slot
- air dodge
- shield
- stamina / percent interaction

Per-fighter differentiation comes from:

- special move
- VFX identity
- hit feel emphasis
- silhouette and attack fantasy

## Shared Actions

### Basic Attack

Current role:

- fastest grounded or aerial pressure tool
- low commitment
- low percent gain
- short reach

Current behavior:

- grounded and aerial variants exist
- sweetspot logic is applied by distance

### Dash

Current role:

- burst approach
- contact-based punish tool
- higher commitment than jab

Current behavior:

- sets temporary dash state
- can create contact damage
- has moderate percent gain

### Air Dodge

Current role:

- short defensive reposition in air
- brief invulnerability

### Shield

Current role:

- absorbs pressure at stamina cost
- reduces knockback and dramatically changes hit feedback

Blocked hits currently:

- do less knockback
- create smaller shake
- produce no blood
- trigger shield-specific flash/ripple/audio

## Specials

### PULSE

- radial push / shockwave
- close-range control
- white/cyan strike identity

### VOLT

- vertical uppercut
- anti-air and launch identity
- yellow/orange punch flash identity

### CRUSH

- downward slam into landing burst
- platform pressure and heavy impact identity
- dust / ground hit identity

## Knockback Model

Current knockback is derived from:

- base knockback values
- hitbox force multipliers
- stamina ratio
- percent growth curve
- buffs
- rage-like low-stamina attacker modifier
- final phase bonus

This is no longer a minimal combat model. It is now a compact but layered combat model.

## Hit Feel

Current combat feedback uses:

- flash
- spark
- ring
- blood
- camera shake
- hit freeze with anti-stack behavior
- attacker recoil pose
- per-character accent effects

Current design target:

- blocked hits feel absorbed
- normal hits feel sharp
- heavy hits feel cinematic
- KO hits feel like payoffs

## Risk Areas

- `hitPlayer()` is one of the densest functions in the file
- combat feedback is now a major source of both polish and code size growth
- future work should replace weak branches, not keep stacking new ones
