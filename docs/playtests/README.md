# Playtests

This folder stores structured playtest logs.

## Purpose
- record what was tested in a specific session
- capture observations before they get rewritten as assumptions
- document issues found and decisions taken from testing

## Structure
- `playtest-template.md`: reusable playtest entry
- playtest entries named by date and focus

## Naming
- `2026-04-20-match-flow.md`
- `2026-04-20-combat-readability.md`

## Required Sections
- date
- build version
- what was tested
- observations
- issues found
- decisions taken

## Rules
- one file per session or tightly related session block
- write observations as facts from the session, not as design conclusions
- move resulting implementation changes to `docs/revisions/`
- move longer external investigation triggered by a playtest to `docs/research/`
