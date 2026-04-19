# Audio Current State

## Current Audio Strategy

All audio is procedural.

The game currently uses oscillator-based tones through shared helpers:

- `tone()`
- `playNote()`
- `startMusic()`

## Current Music

Gameplay music is a looping procedural sequence built from:

- melody line
- bass line
- rhythm accents

It is lightweight, contest-safe, and good enough for a local arcade build.

## Current SFX Coverage

The game currently has procedural feedback for:

- menu/select confirm actions
- jump
- attacks
- specials
- blocked hits
- heavy hits
- KO / ring out
- respawn
- pickup collection
- countdown / final minute moments

## Current Identity

- blocked hits: softer metallic triangle feel
- heavy hits: lower, harsher tones
- KO moments: layered low-frequency emphasis
- pickups: short type-coded stings

## Audio Rule

Future audio work must remain procedural and byte-efficient.
Do not replace the current system with file-based audio.
