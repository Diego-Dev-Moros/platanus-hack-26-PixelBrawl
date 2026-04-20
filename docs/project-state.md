# Pixel Brawl Project State

## 1. Project Identity
`Pixel Brawl` is a local `1v1` Phaser 3 platform fighter built for the Platanus arcade contest. The game is designed as a short-match arcade fighter: movement is immediate, exchanges are compact, knockback and ring-outs are the main payoff, and the overall presentation prioritizes clarity over decorative depth.

Current experience target:

- short local matches with fast restarts
- readable ring-out pressure rather than long health-bar attrition
- clear character identity through specials, silhouette, and hit FX
- contest-safe procedural presentation with no external art or audio dependency

## 2. Current Playable Loop
1. `BootScene` starts and immediately hands control to `MenuScene`.
2. `MenuScene` allows `PLAY`, `CONTROLS`, `CREDITS`, and `EXIT` selection.
3. `CharacterSelectScene` lets both players choose from the current roster and lock in.
4. `GameScene` starts with a countdown and then enables gravity / match control.
5. Players move, jump, fight, shield, use specials, collect pickups, and contest moving platforms.
6. KO happens by ring-out. The defeated player loses one life and respawns after a delay with temporary invulnerability, unless they are out of lives.
7. At `60s`, final phase triggers: the stage layout mutates and movement/platform speed multipliers increase.
8. The match ends when one player runs out of lives or when the timer expires.
9. Timeout resolution compares lives, then stamina, then lower percent.
10. If timeout produces a winner, `EndScene` is shown. If it is still tied, the game returns to `MenuScene`.

## 3. Current Implemented Systems

### Scenes
- `BootScene`: immediate handoff into the main menu.
- `MenuScene`: front door for play flow and secondary screens.
- `CharacterSelectScene`: two-player lock-in flow for the current roster.
- `ControlsScene`: input explanation screen.
- `CreditsScene`: project/team credits.
- `GameScene`: all match logic, HUD, pickups, stage motion, combat, KO, respawn, and timeout handling.
- `EndScene`: winner presentation and return path back to the menu.

### Player Systems
- Shared base movement across all characters.
- Gravity and platform collision through Arcade Physics.
- Jump plus double jump.
- Facing direction tracked separately from movement velocity.
- Air dodge with invulnerability and cooldown interaction.
- Shield state with stamina drain and visible overlay.
- Stamina system with regeneration rules and fatigue when exhausted.
- Percent system tracked separately from stamina and used for knockback escalation.
- Respawn flow resets match-critical state such as percent, buffs, active attacks, and invulnerability timing.
- Input is normalized through cabinet codes rather than raw key names inside gameplay logic.

### Combat Systems
- Basic attack, dash attack, and one special per character.
- Per-character special identities:
  - `PULSE`: shockwave-style pressure
  - `VOLT`: uppercut / launcher behavior
  - `CRUSH`: ground-slam / landing burst behavior
- Hitboxes are temporary attack objects with timing, dimensions, offsets, damage, and force multipliers.
- Knockback depends on percent, stamina state, move type, guard/shield context, and some contextual modifiers.
- Hit response includes stun, recoil, camera shake, hit freeze, flashes, sparks, and blood/impact effects.
- Combo tracking exists and currently affects reward thresholds and stun scaling.
- Shielding, guard buff, and directional influence affect post-hit outcome.

### Pickups / Buffs
- Pickup spawning is active during matches.
- Current pickup types:
  - `recovery`
  - `power`
  - `speed`
  - `regen`
  - `guard`
- Pickups use shared config for visuals, collection feedback, and gameplay effect.
- Recovery restores stamina.
- Buff pickups apply timed effects without changing base roster stats permanently.
- Pickup visuals float, pulse, glow, and use code-generated icons.
- Pickup collection currently reuses shared effect helpers and sound hooks.

### HUD / UI
- Gameplay HUD is mirrored left/right for each player.
- Current HUD information shown:
  - character name
  - lives / stocks
  - percent
  - segmented stamina
  - special cooldown state
  - fatigue state (`EXH`)
  - active buff icons
  - centered match timer
- HUD redraws are partially cached:
  - timer text/color only update when the displayed second or timer state changes
  - stamina bars redraw only when segment count changes
  - buff icons redraw only when active buff mask changes
  - static HUD chrome is separated from the dynamic HUD data path
- Front-end scenes are functional, but non-gameplay screens are less consistent than the gameplay HUD.

### Stage / Platform Logic
- The match uses one main arena plus moving side/top platforms.
- Platform layout is defined by shared stage config data.
- Moving platforms animate from stored base positions rather than ad hoc per-object logic.
- Final phase removes the main platform from active play and adds two lower moving platforms.
- Edge snap logic exists and depends on cached platform geometry.
- Platform motion is horizontal by default, with final-phase vertical motion on the added lower platforms.

### Procedural Visuals
- No external textures, spritesheets, or images are used for gameplay presentation.
- Fighters are built from rectangles in `buildFighter()`.
- Background is built procedurally with layered desert sky, clouds, skyline silhouettes, ruins, dunes, dust, and wind streaks.
- Pickups use code-generated icon containers.
- Combat feedback is driven by shared primitive FX helpers: rectangles, circles, flashes, rings, sparks, burst particles, and impact splatter.
- HUD bars and buff icons are also drawn procedurally.

### Procedural Audio
- Audio is oscillator-based and generated at runtime.
- The project includes:
  - looping procedural music
  - countdown tones
  - attack / hit / block feedback tones
  - KO / respawn / final-phase tones
  - pickup collection tones
- There are no external sound files in the match flow.
- Audio logic is intentionally lightweight and byte-conscious.

### End-of-Match Flow
- Ring-out removes a stock immediately and triggers VFX/SFX feedback.
- If the defeated player still has lives remaining, they respawn with reset combat state and temporary invulnerability.
- If a player reaches zero lives, the other player wins and `EndScene` is shown.
- Timeout resolution is deterministic:
  - more lives wins
  - if tied on lives, higher stamina wins
  - if tied on stamina, lower percent wins
  - if still tied, the game returns to the menu as a draw

## 4. Character Identity

### PULSE
- Read as the balanced martial-artist character.
- Visual identity leans karateka / disciplined fighter.
- Special identity is shockwave-based space control.
- Hit presentation uses cleaner white/cyan accents.

### VOLT
- Read as the boxer / launcher.
- Visual identity emphasizes gloves and upper-body pressure.
- Special identity is uppercut-style vertical punishment.
- Hit presentation leans yellow/orange with sharper spark language.

### CRUSH
- Read as the heavier close-range bruiser.
- Visual identity leans sumo / body-weight pressure.
- Special identity is ground slam with landing burst.
- Hit presentation emphasizes dust, heavier impact, and broader contact FX.

These identities are currently implemented through special behavior, move feel, silhouette cues, and FX treatment rather than through separate movement stats.

## 5. Visual / UX Direction
- The project aims for arcade readability first.
- It is not trying to imitate full sprite-based fighting-game production; it is using primitive-generated art under contest constraints.
- The visual language is pixel-art-adjacent in silhouette and contrast, but technically built from Phaser primitives rather than imported pixel assets.
- Current UI hierarchy in gameplay is:
  1. percent
  2. lives
  3. timer
  4. stamina
  5. cooldown / fatigue
  6. buffs
- Background depth should support match atmosphere without obscuring the players or hit feedback.
- Pickup readability depends on bold silhouette and color separation, not on small detail.
- Non-gameplay scenes still lag behind the gameplay HUD in polish consistency.

## 6. Technical Constraints
- Phaser 3 only.
- No external assets for gameplay visuals or audio.
- No external URLs and no network calls in the game runtime.
- Code-generated visuals and procedural audio only.
- Strong size pressure: the contest build must remain under the minified size limit.
- The gameplay implementation is intentionally concentrated in `game.js` to reduce indirection and byte overhead.
- Reuse matters both for performance and for final bundle size.
- `npm run check-restrictions` is the required safety check for contest constraints.

Contest-safe implementation principles:

- prefer shared helpers over repeated one-off drawing/effect code
- treat duplicate logic as a maintenance risk and a size risk
- avoid adding systems that need large data blobs or external resources
- prefer replacing weak code paths over stacking new layers on top of them

## 7. Known Risks / Weak Areas

### Code Structure Risks
- `GameScene` still concentrates many responsibilities in one file and one scene, so regressions can cascade across combat, UI, stage, and pickup changes.
- Commented / stale code paths still exist in places and can confuse future maintenance if treated as active behavior.
- The project is already far enough along that “small” helper additions can have real size impact.

### Gameplay Regression Risks
- Final-phase mutation touches timer, HUD, platform state, and movement/platform speed multipliers at once.
- KO / respawn flow resets many player fields together; it is easy to miss one when changing combat state.
- Shield, guard, stamina, fatigue, percent, and combo logic all meet inside hit resolution, so combat changes should be treated as high-risk.
- Pickup timing and buff expiration can affect HUD, aura, stamina behavior, and combat modifiers simultaneously.

### UI / UX Weak Areas
- Some non-gameplay labels still contain encoding artifacts.
- Menu, controls, credits, and character select are functional but not as visually disciplined as the gameplay HUD.
- The gameplay HUD path is cleaner than before, but the codebase still contains a commented legacy HUD block that should not remain indefinitely.

### Visual Risks
- Fighter silhouettes are readable for the current constraint set, but still limited by rectangle-only construction and compact scale.
- Pickup icons remain small under match pressure and can regress quickly if they gain detail instead of stronger shape reads.
- Background direction is established, but stage fiction and platform art still have less cohesion than the rest of the gameplay presentation.

## 8. Safe Next Steps
- Remove dead or commented legacy code paths that are no longer part of the active runtime behavior.
- Fix remaining text-encoding issues in menu, select, controls, and related UI labels.
- Continue maintenance refactors that reduce duplication in `GameScene` without changing values, timing, controls, or stage layout.
- Tighten non-gameplay scene typography and spacing so front-end screens match the quality level of the current gameplay HUD.
- Keep documenting regression-sensitive behavior in `docs/` before changing combat, HUD, pickup, or final-phase systems.
- Add focused playtest notes for:
  - KO / respawn
  - timeout resolution
  - final phase transition
  - pickup/buff expiration
  - HUD state changes under combat stress
