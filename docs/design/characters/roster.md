# Initial Roster

## General Direction

The roster should be inspired by `Smash Bros` archetypes, but implemented as original, minimal fighters for `Pixel Brawl`.

The target is not deep character complexity. The target is:

- instant readability
- clear role per fighter
- low code cost
- one shared base kit
- one unique special per character

## Shared Base Rules

All characters share:

- same movement speed
- same jump
- same gravity response
- same lives
- same basic attack
- same dash
- same base stamina rules

Only these elements change:

- special attack
- shape silhouette
- color identity
- slight special area / knockback profile

This keeps the code compact and the game easier to balance.

## Character 1: Pulse

### Role

Beginner-friendly space control.

### Identity

Pulse is the most stable and reliable fighter. The character controls nearby space and is strongest near the edge.

### Special

`Shockwave`

Pulse generates a circular burst around the body that pushes nearby opponents away.

### Intended Use

- stop close pressure
- create space
- force edge kills
- punish opponents who overcommit at close range

### Recommended Values

- cooldown: `2200 ms`
- effective radius: `60 px`
- knockback force: `1.0`
- stamina damage: `12`

### Risk

It has poor reach. If the opponent is outside the radius, the move does nothing.

### Visual

- wide rectangular body
- circular head
- main color: neon cyan
- accent: white

## Character 2: Volt

### Role

Technical anti-air and vertical punishment.

### Identity

Volt is the clean vertical punish character. It is strongest when the opponent jumps too much or lands unsafely.

### Special

`Uppercut`

Volt throws a rising vertical strike in front of the body.

### Intended Use

- catch jumps
- punish landing routes
- launch opponents upward
- control central platform space

### Recommended Values

- cooldown: `2000 ms`
- hitbox width: `34 px`
- hitbox height: `68 px`
- vertical force: `1.2`
- horizontal force: `0.55`
- stamina damage: `14`

### Risk

It is harder to land than `Shockwave`. Bad timing leaves the move wasted.

### Visual

- medium rectangular body
- small square head
- main color: electric yellow
- accent: orange

## Character 3: Crush

### Role

Aggressive aerial pressure and falling threat.

### Identity

Crush is strongest when attacking from above. It creates danger around platforms and punishes opponents who stay under it.

### Special

`Ground Slam`

Crush accelerates downward and creates an impact burst on landing.

### Intended Use

- aggressive aerial entry
- platform pressure
- landing trap
- strong close-range impact around the landing point

### Recommended Values

- cooldown: `2400 ms`
- landing impact radius: `65 px`
- knockback force: `1.15`
- stamina damage: `15`
- accelerated falling during activation

### Risk

If it misses, Crush is exposed when landing.

### Visual

- tall rectangular body
- small circular head
- main color: strong magenta
- accent: orange-red

## Roster Roles

### Pulse

- easiest to use
- best for beginners
- strongest near edges

### Volt

- more technical
- strongest against jumps
- rewards timing and reads

### Crush

- most aggressive
- strongest from above
- best for platform pressure

## Final Recommendation

Do not refine the roster further until these systems exist:

1. character select
2. one working arena
3. one full playable match loop

The current roster definition is already enough for implementation.
