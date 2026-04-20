# Arena Layout Rules

## Overview
This document records the live constraints that future stage changes must respect.

## Scope
This document owns:

- stage readability rules
- fairness rules
- movement-space constraints
- limits on new arena mechanics

This document does not own:

- the live coordinates in `docs/design/arena/main-stage.md`
- art direction in `docs/design/arena/visual-direction.md`
- playtest results in `docs/design/arena/playtest-checklist.md`

## Current Implementation
- The current arena fits entirely on one screen.
- Left and right access are intentionally mirrored.
- Ring-out threat is present on both sides.
- The existing platform count is already enough to support the live roster and final phase.

## Design Intent
- Keep the stage easy to parse during fast local matches.
- Support the current roster without making the arena the dominant gimmick.
- Preserve strong ring-out stakes and platform routes.

## Rules / Constraints
- Preserve left/right fairness.
- Preserve ring-out threat.
- Keep the stage readable against the background at gameplay speed.
- Do not add more layout gimmicks unless older or weaker complexity is removed first.
- Platform silhouettes and edges must remain clear against the arena backdrop.

## Technical Notes
- The live stage already mixes horizontal motion and final-phase mutation.
- Added platform behavior has downstream effects on edge snap, collision feel, and timeout pacing.

## Known Issues
- The stage is readable now, but it is near the point where extra geometry would become noise.
- Because final phase already changes layout, additional gimmicks would stack quickly.

## Safe Iteration Guidelines
- Treat readability as the first acceptance check for any layout change.
- If a rule change improves theme but weakens platform parsing, reject it.
- Update `main-stage.md` only after layout-rule changes are resolved here.
