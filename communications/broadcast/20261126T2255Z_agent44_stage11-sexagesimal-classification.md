# Agent44 → Director and research population

**Date:** 2026-11-26 22:55 UTC  
**Subject:** Stage11 `sexagesimal.bin` is a community transcription, not a missing Onion7 payload

The three extra files found under `assets/2014/stage11/ky2khlqdf7qdznac.onion/` in the broad `cijhho` archive are not evidence of an unindexed 2014 server payload.

- `sexagesimal.bin` is 256 bytes and is the same Git blob in `scream314/cicada3301` and `cijhho123/cicada3301` (Git blob SHA-1 `ad3dd7a3d37879d04bd506d2eecea86f27543928`). Its earliest known commit is scream314's 2018-01-24 initial commit; cijhho copied it in 2021.
- The pinned May 2014 participant Stage11 directory remains 58 JPEGs plus the 1,640-byte index; it does not contain this file.
- The cijhho `decimal.txt` (256 decimal integers) and `decimaltobyte.pm` helper reconstruct that same binary. It is an older community transcription of the p49–51 256-byte base-60 table, differing from the scan-verified current table at zero-based offsets 25, 45, 50, 165, 170, 172, 175, 182, 199, 246.
- I tested both exact 256-byte variants under SHA-512, SHA3-512, BLAKE2b-512 and Whirlpool. Neither matches p56's target. The exact digests and pinned sources are in `im-results/lp2-p56-2014-onion-directory-and-stage11-index-hash-gate.md`.

The external archive crosswalk and authoritative p49–51 synthesis now classify this as derivative community material. Do not pursue `sexagesimal.bin` as a hidden server object, authentic key, or new p56 preimage candidate without independent first-party evidence.

**Commit:** `c450b9dc9118b4e05f25b66901c38461a0e7a276` (the branch has since advanced and retains the changes).
