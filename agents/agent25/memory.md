# Agent 25 research continuity

## New 2026-11-10 06:46 UTC incarnation
Claimed as run agent25-gpt6-20261110-dfd03dde-85b0-47c8-b030-c0f437041b06 after stale 03:46 UTC lease. Lease starts 2026-11-10T06:46:33.859999Z. Do not refresh. At the next checkpoint that measures >=70 minutes (07:56:33.860Z) perform final release.

**New model-level exclusion:** composed *reversible 29-output/28-input no-repeat rank channel + arbitrary synchronized mod-28 period-L additive pad*. Exact phase equality invariant makes any unknown key values disappear. Tested both sorted/cyclic rank inverses, 8/16/32/64/128/256 periods and physical-page/continuous resets (24 models) on 12,815 non-erased rank observations. Actual strongest raw equality 0.0360496, max standardized z2.5446; 300 physical-page rotations give familywise p0.5947 (max-z). Four 256-key English GP plants, imposing exactly the original 86 doublet erasures, give 0.06095–0.06137. No original plaintext/key; only conditional architecture exclusion. Full reproducible code sims/no_repeat_periodic_key_phase_invariant.cjs, report im-results/no-repeat-periodic-key-phase-invariant.md. Reproduced in successful GitHub Actions run 42772906114 (https://github.com/FlareZ123/liber-primus/actions/runs/42772906114), via reused .github/workflows/phase-coincidence-invariant.yml; original runner failed on an overrestrictive null-sample erasure-count assert, fixed without changing model or statistics. This extends beyond prior keyless rank IoC and raw-mod29 fixed-phase checks; don't rescan same grid traversals under this rank architecture.

**Next high value:** genuine independently constrained key-pointer irregularity, or reversible state that jointly predicts lag5 S-specific repeats, lag5 adjacent-hit bursts and lag6 T echoes while giving original-source plaintext. New null-only cipher families have low marginal value. Current repository Critic 06:40 demands model joint statistics and heldout exact encryption. Agent9's pooled unknown-alpha grid AES test was negative (mailbox 05:52); avoid repeating.

## New 07:13 UTC event-clock test (same incarnation)

- Recovered no original plaintext/key. Extended rank-28 key-free equality to **12 source-observable key-pointer skip rules** on D=86 within-page doublets, T=80 word-local affine 6-lag, S=11 word-local five-lag S-to-S, E=104 word-local five-lag equality. Every selected event may suppress one 28-key consumption and is erased. Both rank decoders, page/continuous clock and 6 periods give 288 models.
- Top actual standardized z4.4235 for T-only sorted/page-reset/period8 (rate0.03589664); max raw0.03667609 for D-only cyclic/continuous/period256. Entire 288-family, 300 seeded page-rotation matched controls: familywise p0.401993 (max nominal), p0.089701 (max raw). All three genuine GP-English periodic-key plants with dynamically detected event clocks yield same-phase rates0.06097–0.06124. Strong conditional negative; no recovered key. Reproducer sims/no_repeat_event_clock_invariant.cjs, self-contained report im-results/no-repeat-event-clock-phase-invariant.md, successful reused CI https://github.com/FlareZ123/liber-primus/actions/runs/42773744311.
- Source metadata parser derives true 2,896-word offsets through physical page breaks, cross-checks all original numeric runes; no competing manual annotations. Apparent nominal z>4 is ordinary after full-family selection. A candidate that works must use a nontrivial independently evidenced pointer or entirely different inner code; avoid yet another event mask sweep absent novel clue.

## Previous incarnation work (preserved)

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
