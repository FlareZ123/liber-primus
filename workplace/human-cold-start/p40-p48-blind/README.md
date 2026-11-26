# p40–p48 blind human cold-start

**Status: PREPARED — WAITING for a maintainer-approved independent human.** No participant has been contacted, no session has been conducted, and no human result is claimed. An agent or language model is not an acceptable substitute.

## Delivery

- [Participant folder on sealed branch](https://github.com/FlareZ123/liber-primus/tree/human-packet-20261126-3091/participant)
- [Complete sealed branch archive](https://github.com/FlareZ123/liber-primus/archive/refs/heads/human-packet-20261126-3091.zip)
- Frozen branch commit: `b9e37a1931cfe9b5e5729bfaca66ffef2181978f`
- Local participant ZIP: `p40-p48-human-cold-start-participant.zip`
- Local ZIP SHA-256: `ade20bf97895cfffe00462d83c471544fd0a5f5f23615cda3b6b14fca1c31834`
- Local ZIP size: 35,376,961 bytes

The sealed branch tree contains only `participant/`: 58 original 2400×3600 JPEG blobs in release order, neutral sequence filenames, a neutral prompt, a period-source index, and per-image SHA-256 checksums. The branch images reference the canonical `resources/liber-primus` blobs directly; no image is recompressed, cropped, resized or annotated.

## Organizer-only target mapping

The complete 58-image sequence is provided to avoid exposing the target segment. The p40–p48 target region maps as follows:

| Physical page | Participant file | Canonical original |
|---:|---|---|
| 40 | `images/041.jpg` | `resources/liber-primus/57.jpg` |
| 41 | `images/042.jpg` | `resources/liber-primus/58.jpg` |
| 42 | `images/043.jpg` | `resources/liber-primus/59.jpg` |
| 43 | `images/044.jpg` | `resources/liber-primus/60.jpg` |
| 44 | `images/045.jpg` | `resources/liber-primus/61.jpg` |
| 45 | `images/046.jpg` | `resources/liber-primus/62.jpg` |
| 46 | `images/047.jpg` | `resources/liber-primus/63.jpg` |
| 47 | `images/048.jpg` | `resources/liber-primus/64.jpg` |
| 48 | `images/049.jpg` | `resources/liber-primus/65.jpg` |

The target-segment SHA-256 values match the uploaded original-image ZIP and the canonical repository checksum file. The participant branch contains no page mapping, transcriptions, modern hypotheses, cipher reports, candidate keys, or suspected plaintext.

## Session protocol

1. The maintainer selects a genuinely independent solver who has not read this repository's research, current Issues, modern page identifications or hypotheses.
2. Send only the participant ZIP or the `participant/` folder. Do not send this README, the issue or any organizer material.
3. Preserve the solver's unedited reasoning, tools, timestamps, observations, dead ends and the point at which an operation first becomes determined.
4. Require a visible source clue, the operation it selects, the source of each operand/parameter, a typed prediction on untouched material, and a falsifier.
5. Do not reveal additional pages, reports or candidate interpretations after the solver starts. If the solver requests a missing input, record exactly what was requested and why.
6. If no approved human is available, leave the task waiting. Do not substitute an agent or model.

## Reproduction

`build_packet.py` deterministically creates the local ZIP from the original 75-JPEG archive. Pass the repository's `resources/liber-primus/SHA256SUMS.txt` as `--reference-sums` to check all 58 source images against the canonical image hashes before delivery.
