# Core Game Loop

## Current Match Loop

1. players enter through the menu
2. both players choose a fighter
3. match begins with countdown
4. players move, jump, fight, shield, and contest platforms
5. percent and stamina rise/fall through combat
6. pickups spawn and can alter the tempo of the round
7. at `60s`, final phase starts and the stage mutates
8. players continue until:
   - one player loses all stocks
   - or time runs out
9. winner is resolved and shown in `EndScene`

## Current Win Conditions

- default: first player to lose all `3` lives loses
- timeout: resolve by lives, then stamina, then lower percent

## Match Identity

The current game is no longer just “minimal movement plus knockback.”
It is a full jam-scale arcade fighter with:

- stocks
- ring-outs
- percent pressure
- stamina/fatigue pressure
- pickup momentum swings
- final-minute escalation

## Current Gameplay Priorities

- readable platform fighting
- short local matches
- clear knockback and ring-out payoff
- enough combat layering to create replay value without introducing deep system sprawl
