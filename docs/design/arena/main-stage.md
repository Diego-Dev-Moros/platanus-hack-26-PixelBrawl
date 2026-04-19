# Main Arena

## Current Stage Layout

The current live stage uses:

- `1` main platform
- `2` side platforms
- `1` top platform

Base positions:

- main: `(400, 470)` size `420 x 28`
- left: `(240, 352)` size `120 x 20`
- right: `(560, 352)` size `120 x 20`
- top: `(400, 270)` size `100 x 18`

## Current Stage Behavior

- side and top platforms move during the match
- movement includes horizontal oscillation
- vertical oscillation is enabled during final phase for the moving platforms
- the main platform is removed in final phase
- two new lower side platforms replace it during final phase

## Match Intent

The stage currently supports:

- center-stage resets
- anti-air routes for `VOLT`
- drop and slam routes for `CRUSH`
- edge pressure and displacement routes for `PULSE`
- increased chaos during the last minute without needing a second arena
