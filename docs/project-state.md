# Pixel Brawl Project State

## Project Overview

`Pixel Brawl` is a local `1v1` platform fighter built for the Platanus arcade contest.
It runs as a compact Phaser 3 game centered around ring-outs, short exchanges, and readable arcade feedback.

Current gameplay loop:

1. menu
2. character select
3. match countdown
4. live match with platforms, attacks, pickups, and timer
5. final phase at `60s`
6. KO / respawn loop until stocks run out or time expires
7. end screen with winner celebration

Current design direction:

- compact arcade platform fighter
- Smash-inspired risk through launch and ring-out
- primitive-only art
- strong gameplay readability over decorative detail
- contest-safe procedural visuals and sound

## Contest Constraints

- Phaser 3 only
- no external images
- no spritesheets
- no external sound files
- no network calls
- no external URLs
- code-generated visuals and audio only
- target: under `50 KB` after minification

Implications for future work:

- new art must be primitive-based: `Graphics`, `rectangle`, `circle`, text, particles
- sound must remain oscillator/procedural
- every new visual helper must justify its byte cost
- duplicated drawing logic is expensive even if runtime cost is small
- large per-character art blocks and per-hit VFX are the fastest way to exceed the size budget

Current status:

- `npm run check-restrictions` passes
- current minified size is under `50 KB`
- raw source is much larger than the minified target, so growth headroom is limited

## Current Features

- menu scene with play / controls / credits / exit
- character select with lock-in flow for both players
- gameplay scene with shared base movement
- jump, double-jump behavior, gravity, platform collisions
- local cabinet input mapping via `CABINET_KEYS`
- basic attack, dash, air dodge, and character special
- `PULSE` shockwave
- `VOLT` uppercut
- `CRUSH` ground slam
- stamina, fatigue, shield, and partial regeneration logic
- percent accumulation used for knockback scaling
- pickups and timed buffs
- procedural music loop and hit / UI / KO tones
- moving platforms with horizontal motion and final-phase vertical motion
- final minute trigger with main-platform split
- KO by ring-out and timed respawn with invulnerability
- stock-based win condition plus timeout resolution
- end scene with winner animation and announcement

## UI / Visual State

### Current HUD Logic

- built in `GameScene.makeHud()`
- updated through `hudDirty` and `refreshHud()`
- player panels are mirrored left/right
- percent is large and color-escalated
- timer is centered and framed
- stamina is segmented and secondary
- buffs are represented by compact graphic icons
- special cooldown and fatigue state are shown in a small text line

### Current Menu / Select / End Quality

- menu flow is complete and readable
- character select is functional, but text encoding artifacts still appear in some labels
- controls and credits are serviceable, not premium
- end scene has a stronger celebration than the original version, but still relies on text + tween choreography rather than a dedicated presentation layer

### Current Stage Art Direction

- desert sunset palette with parallax clouds, skyline silhouettes, ruins, dunes, dust, and wind streaks
- stage now points toward a buried temple / ruined city direction instead of a flat neon grid-only arena
- gameplay stage and background are visually separate, but the platform art and background fiction are still not fully unified

### Current Pickup Icon Approach

- pickups are drawn in `drawPickupIcon()`
- each pickup is a small code-built icon inside a reusable container
- glow + outline + highlight support readability
- shield / speed / power / recovery / regen are all distinct in intent, but tiny size still limits instant recognition under action

### Current Character Art Approach

- all fighters are built in `buildFighter()` from rectangles only
- silhouettes now target karateka / boxer / sumo
- identity is stronger than the earliest abstract versions, but animation bandwidth is limited by the primitive-only compact build

## Character Design System

### PULSE

Role:

- space-control all-rounder

Silhouette goals:

- karateka
- cleaner torso
- gi-like outfit
- disciplined stance

Attack fantasy:

- sharp martial strikes
- clean circular shockwave special

Movement fantasy:

- balanced and composed
- controlled rather than explosive

VFX identity:

- thin white / cyan strike trails
- clean circular pulse rings

### VOLT

Role:

- punch-first anti-air launcher

Silhouette goals:

- boxer
- high guard
- visible gloves
- stronger upper-body emphasis

Attack fantasy:

- compact punches
- fast uppercut punish

Movement fantasy:

- direct
- reactive
- tight pressure windows

VFX identity:

- yellow / orange punch flashes
- electric-feeling sharp sparks

### CRUSH

Role:

- heavy platform bully and slam threat

Silhouette goals:

- sumo
- large torso mass
- lower center of gravity
- mawashi-like cue

Attack fantasy:

- body-weight impact
- slam pressure
- high-contact hits

Movement fantasy:

- committed and forceful
- less elegant, more weighty

VFX identity:

- dust
- wider ground impact
- heavier impact rings and bursts

## Art Direction Rules

- primitive-only rendering
- strong silhouette first
- readable low-detail forms
- avoid noisy micro-detail
- background depth should not reduce player readability
- pickups must be recognizable at gameplay scale
- HUD must prioritize status readability over decoration
- percent must remain the dominant danger indicator
- stamina must remain secondary in the hierarchy
- effects should reinforce attack identity, not obscure player position

## Performance / Size Rules

Future contributors must avoid:

- large repeated `Graphics` drawing blocks without reuse
- adding separate helpers for tiny one-off VFX that could reuse existing primitives
- expanding icon maps into large hardcoded pixel arrays
- adding many concurrent long-lived tweens per hit
- overgrowing `buildFighter()` and `createDesertBackground()` with decorative detail that does not improve readability
- duplicating whole HUD methods or old implementations in the file
- large menu / scene text rewrites that add bytes without changing play quality

High-risk growth areas:

- background art layers
- fighter construction blocks
- per-character VFX in `hitPlayer()`
- duplicated HUD code
- extra scene-specific presentation logic

## Known Issues / Open Improvements

Major visual debt:

- scene-level typography and alignment still vary between menu, select, gameplay, and end screen
- some labels still show encoding artifacts
- background direction is improved but not yet iconic

UI debt:

- HUD logic currently exists twice in `GameScene`, which is a maintenance and size risk
- menu and character select still feel closer to debug utility screens than a polished arcade front-end
- cooldown / buff readability is improved in gameplay but not matched elsewhere

Character readability debt:

- silhouettes are clearer than before, but still constrained by tiny body scale and rectangle-only construction
- attack poses are mostly implied by FX rather than by body deformation

Pickup readability debt:

- icons are improved, but shield / power / speed still compete with match chaos at distance
- no pickup has enough dedicated screen time to rely on detail; silhouette must stay extremely simple

Size / bloat risks:

- gameplay source is already large in raw bytes
- duplicated or stale implementations should be removed before adding more visual systems
- future polish should prefer replacing weak code, not layering new code on top of it

## Safe Next Steps

1. remove duplicated / stale HUD implementation and encoding-corrupted text with no gameplay changes
2. tighten menu, controls, credits, and character-select typography/layout for visual consistency
3. simplify pickup silhouettes further toward stronger single-shape reads
4. unify stage platform art with the ruined-desert background fiction
5. compress repeated VFX logic where possible before adding new visual features
