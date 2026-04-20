# Audio Current State

## Overview
This document defines the live procedural audio model used in the project.

## Scope
This document owns:

- procedural music approach
- procedural SFX coverage
- audio identity and implementation constraints

This document does not own:

- Phaser API details in `docs/phaser-api.md`
- combat rule ownership in `docs/design/combat/base-combat.md`
- front-end routing or scene ownership

## Current Implementation
- All live audio is procedural.
- The current shared audio helpers are `tone()`, `playNote()`, and `startMusic()`.
- Gameplay music is a looping procedural sequence built from melody, bass, and rhythm layers.
- The live SFX set covers:
  - menu and character-select confirm actions
  - jump
  - basic attacks and specials
  - blocked hits and heavy hits
  - KO / ring-out
  - respawn
  - pickup collection
  - countdown and final-minute moments

## Design Intent
- Give the game enough audio feedback to feel responsive and arcade-like without external assets.
- Keep sound short, readable, and cheap in bytes.
- Use tone shape and pitch to separate menu, movement, impact, KO, and pickup moments.

## Rules / Constraints
- Audio must remain procedural.
- Do not replace the live system with file-based music or SFX.
- Sound should support gameplay clarity, not overwhelm the small-scale visual presentation.

## Technical Notes
- One-shot sounds use the Web Audio context exposed through Phaser's sound system.
- The input layer resumes the audio context on first valid keydown if needed.
- The music loop is driven by a repeating timed event, not by a streamed track.

## Known Issues
- The current audio system is effective and contest-safe, but intentionally lightweight.
- Audio identity is present, though still simpler than what a larger asset-driven project would support.

## Safe Iteration Guidelines
- If audio changes, retest menu confirm, countdown, hits, block, KO, respawn, and pickup sounds as one set.
- Prefer clearer tone coding over more layers.
- Keep implementation notes here and move gameplay meaning back to the owning design domain when needed.
