# MVP Plan

## Product goal

Ship a first playable version that proves three things:

- Solo prime-factor gameplay is readable and satisfying on mobile.
- Stage generation is deterministic and difficulty can scale without manual authoring.
- A room-based real-time backend can coordinate shared-seed matches for future versus play.

## Milestone 1: Shared game rules

- Prime pool from 2 to 53
- Deterministic seeded RNG
- Stage generation by difficulty tier
- Prime tap resolution with partial completion support
- Combo, damage, and penalty formulas

## Milestone 2: Solo PWA

- Installable app shell
- Touch-friendly prime keypad
- Stage HUD with remaining value, combo, and health
- Local state only
- Offline-capable asset caching

## Milestone 3: Multiplayer skeleton

- Create room
- Join room by code
- Broadcast room snapshots over Supabase Realtime
- Validate submitted prime taps in the room host client
- Advance shared stage sequence when a player clears a stage

## Out of scope for this MVP

- Authentication
- Persistent database
- Ranked matchmaking
- Spectating
- Background-safe long-running sessions on iOS

## Exit criteria

- Web app starts locally and installs as a PWA
- Solo run is playable end to end
- Two clients can share one Supabase room channel
- Client can create or join a room and receive live snapshots
