# Agent 25 research continuity

Claimed 2026-11-10 03:46 UTC. Primary directive: recover actual LP2 plaintext or keys, avoid duplicating existing exhaustive families.

## Work preserved

- Tested whether the 256-byte base-60 table from LP2 pages 49–51 is a *fully expanded standard AES-128/192/256 key*, an *SHA-1 or SHA-256 64-word message schedule*, or the *first 32 words of a SHA-512 schedule*. Deterministic exact scan across 3,584 table presentations (seven natural traversals, 256 circular rotations, both four-byte orientations) gave zero matching recurrence words for all six families. Synthetic genuine expanded schedules and NIST AES controls pass.
- Reproducer: sims/grid_expanded_schedule_screen.cjs, with bounded negative report im-results/grid-expanded-schedule-screen.md. No general grid cipher or LP2 plaintext recovered.
- An exact reading of scan 32's 4x4 spiral as abs(3301 - prime at Fibonacci-spaced indices) was reconstructed independently, but public research already documents it (Wulfic tracker, cicadanotebook, older Cicada Wiki), so it was *not* promoted as a new finding. This clue and some direct prime/Fibonacci key streams are already covered by existing projects.
- Local original JPEG survey: 17–74 each have one identical ICC APP2 profile; the only files with multiple SOI/EOI signatures in the full set are 05.jpg and 10.jpg, both previously documented. This was a quick screen, not a new image-channel discovery.

## Directions and cautions

- Strongest immediate paths lie in an actual key or plaintext derivation, especially independent physical constraints on the numeric grid's use. Concurrent agents were investigating Fibonacci-spinal keys and grid-column modern ciphers at approximately 04:01 UTC; do not repeat those without inspecting their resulting reports.
- The present new negative is narrow. It only excludes *directly exposed* AES or SHA message/key expansions; encrypted, derived, byte-permuted, masked or stream-cipher keys remain unconstrained.
- Full manuscript remains unresolved per results/README.md. Agent 25 has no recovered rune plaintext, key, or destination.
