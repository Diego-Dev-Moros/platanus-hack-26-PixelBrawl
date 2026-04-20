# Pixel Brawl

## Project Overview
`Pixel Brawl` is a local `1v1` Phaser 3 platform fighter built for the Platanus arcade contest. The current game includes front-end scene flow, three playable fighters, a live match with countdown and timer, percent and stamina pressure, pickups and buffs, a final-phase stage shift, procedural visuals and audio, and the full KO / respawn / win-resolution loop expected from a short arcade match.

## Constraints
This repository is structured around contest limits, not around a large-engine project layout. The game must stay Phaser 3 only, avoid external assets and network calls, generate visuals and audio in code, and remain under the size cap after minification. That is why most gameplay lives in `game.js`, why rendering relies on primitives and shared helpers, and why duplicate logic or decorative one-off systems are treated as real maintenance and byte-cost risks.

## Current Implemented Feature Set
- Boot, menu, controls, credits, character select, gameplay, and end scenes
- Local cabinet-style input mapping through `CABINET_KEYS`
- Three playable fighters: `PULSE`, `VOLT`, and `CRUSH`
- Match countdown, centered timer, final phase at `60s`, stock-based win condition, and timeout resolution
- Movement, gravity, platform collision, jump, double jump, shield, and air dodge
- Basic attacks, dash attacks, character specials, knockback, ring-outs, and respawn invulnerability
- Percent-based knockback pressure plus stamina, fatigue, shield drain, and regeneration
- Pickups and timed buffs: recovery, power, speed, regen, and guard
- Procedural stage/background art, fighter art, pickup icons, combat FX, music, and SFX

## High-Level Architecture
- **Scenes:** `BootScene` hands off to `MenuScene`, then `CharacterSelectScene`, `ControlsScene`, `CreditsScene`, `GameScene`, and `EndScene`. Match logic is centered in `GameScene`.
- **Input:** raw keyboard keys are normalized once, mapped to cabinet codes, and exposed as separate `held` and one-frame `pressed` state.
- **Combat:** shared movement/base stats, per-character specials, hitbox-based attacks, percent scaling, stamina/fatigue, shield logic, KO handling, and respawn flow live in the same gameplay loop.
- **HUD:** mirrored player panels, centered timer, segmented stamina bars, cooldown/fatigue text, and buff icons are updated from tracked state instead of unconditional full redraws.
- **Pickups:** spawn, visual state, collection, and buff/recovery application are config-driven and reuse shared FX and icon helpers.
- **Procedural visuals / audio:** the background, platforms, fighters, icons, hit flashes, particles, music, and SFX are all generated in code with no external assets.

## Documentation Map
- `docs/project-state.md`: current project snapshot, contest constraints, known risks, and safe maintenance work.
- `docs/phaser-quick-start.md`: local Phaser examples and fast reference material; useful for patterns, not as the final source of truth.
- `docs/phaser-api.md`: exact local Phaser API lookup.
- `docs/design/arena/`: stage layout rules, arena implementation notes, playtest checklist, and visual direction.
- `docs/design/audio/`: current procedural audio notes.
- `docs/design/characters/`: roster, visual language, and character implementation notes.
- `docs/design/combat/`: base combat notes and character-select-specific combat context.
- `docs/design/core/`: base values and the current game-loop model.
- `docs/design/scenes/`: scene-flow documentation.
- `docs/design/stamina/`: stamina and fatigue system notes.
- `docs/design/ui/`: current HUD and front-end UI state.
- `docs/design/visual/`: current overall visual direction.
- `docs/snippets/`: reusable snippets and reference fragments as they are added.

## Development Guardrails
- Keep the minified game under `50 KB`. Run `npm run check-restrictions` before considering a change complete.
- Do not add external assets, external URLs, network calls, or non-contest-safe runtime dependencies.
- Keep visuals and audio procedural. New art should stay primitive-based; new sound should stay generated.
- Do not bypass `CABINET_KEYS` in gameplay logic. Gameplay should read cabinet codes, not raw keys.
- Prefer replacing duplicated or stale code over layering new code on top of it. In this project, maintainability and byte size are tightly linked.
- Treat gameplay feel as fragile. Movement timing, combat timing, stage layout, percent/stamina behavior, and critical HUD information should not drift unintentionally.

## Current Focus / Next Safe Steps
- Remove stale or commented code paths that are no longer part of the active game flow.
- Fix remaining text-encoding issues in non-gameplay scene labels and related docs-facing strings.
- Keep front-end scene typography and spacing aligned with the current gameplay HUD.
- Continue consolidating repeated helpers only when behavior stays identical and the size budget remains healthy.
