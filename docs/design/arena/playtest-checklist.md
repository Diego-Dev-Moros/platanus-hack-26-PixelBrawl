# Arena Playtest Checklist

## Overview
This document is the reusable checklist for validating stage changes and catching arena regressions.

## Scope
This document owns:

- what to verify when the stage changes
- the order of arena-focused checks
- the questions that determine whether a layout change is safe

This document does not own:

- the live stage spec in `docs/design/arena/main-stage.md`
- actual playtest notes, which belong in `docs/project-state.md`

## Current Implementation
Use this checklist against the live arena with its moving platforms, final-phase mutation, edge pressure, and ring-out rules.

Core checks:
- movement routes still feel readable
- top and side platforms still support clean landings
- edge pressure still creates real ring-out threat
- final phase still reads as escalation, not confusion
- fighters and pickups remain readable against the background

## Design Intent
- Catch layout regressions before “small” arena tweaks spread into combat or match-flow problems.
- Keep stage testing focused on gameplay space, not only on visual preference.

## Rules / Constraints
- A stage change is not safe until movement, combat, pace, and readability have all been checked.
- Arena testing must include pre-final-phase and post-final-phase play.
- Observations should distinguish between layout issues, motion issues, and visibility issues.

## Technical Notes
Suggested pass order:
1. movement and landing checks
2. combat route checks
3. final-phase checks
4. readability checks

Specific prompts:
- Can both players recover center stage reliably?
- Do moving platforms create useful routes instead of random drops?
- Does final phase increase pressure without creating unreadable collisions?
- Are platform edges still clear over the background?

## Known Issues
- The live arena already has motion and mutation, so regressions can come from timing as well as layout.
- Arena readability can be weakened by both geometry changes and purely visual changes.

## Safe Iteration Guidelines
- Record actual findings in `docs/project-state.md`, not in this file.
- Keep this checklist evergreen and domain-specific.
- If a repeated failure shows up in testing, promote it into `layout-rules.md` or `main-stage.md` as a live rule.
