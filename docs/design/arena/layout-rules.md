# Arena Layout Rules

## Goal

Document the structural rules the arena should follow so future tuning stays consistent.

## Rule 1: Keep The Stage Symmetrical

The main arena should be horizontally symmetrical.

Why:

- fair for both players
- easier to read
- easier to tune
- lower implementation complexity

## Rule 2: One Main Floor

The match needs one reliable central platform where players can always reset interaction.

That main floor should:

- be large enough for neutral play
- be narrow enough that edges matter

## Rule 3: Limit Platform Count

Do not exceed `4` total platforms in the base stage.

Too many platforms will:

- slow the match
- reduce readability
- make the arena feel busy
- increase implementation and tuning time

## Rule 4: Give Each Special A Natural Use Case

The stage should always support:

- horizontal edge play for `Shockwave`
- anti-air spaces for `Uppercut`
- aerial descent routes for `Ground Slam`

If the layout removes one of those use cases, the stage is wrong for the current roster.

## Rule 5: Preserve Edge Threat

The main floor should not be so wide that edge pressure disappears.

Edge play is critical because the win condition is based on ring-outs, not health depletion.

## Rule 6: Avoid Tiny Gaps

Do not create micro-gaps or tight collision shapes that feel inconsistent.

The arena should be readable at a glance.

Use clean rectangles.

## Rule 7: Build For One-Screen Play

The arena should fit cleanly on one screen with no scrolling camera.

Why:

- better for local multiplayer
- easier to read on an arcade setup
- cheaper to implement
- fewer camera edge cases

## Rule 8: Start Simple, Tune Later

Do not design multiple arenas before the first one plays well.

The jam version only needs one strong arena first.
