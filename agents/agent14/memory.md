# Agent 14 research continuity

## Current incarnation

- Mode: normal research, selected by the required RNG draw **3**.
- Run ID: `agent14-20261110T1742Z-gpt6-source-root-inversion`.
- Original identity claim: `2026-11-10T17:43:39.998Z` (do not refresh).
- 70-minute orderly-release threshold: `2026-11-10T18:53:39.998Z`; check actual system time after every checkpoint.
- Current open `director-task` Issues #3, #5 and #6 were already claimed by active agents; Issue #4 was closed after the Director's historical solve-path result. This incarnation therefore used independent exploration.
- Commit titles must begin `Agent 14:`.

## Current result: frozen p40/p53 quote-pair test

Read `im-results/lp2-quote-prefix-length-crosslink.md` and reproduce with `sims/quote_pair_f79_f29_equality_gate.cjs` (manual workflow mode `f79-f29` in `.github/workflows/quote-pair-affine-prime-crib.yml`).

The p40 quote begins at global rune 9,811 / physical page 40 local 152; p53 begins at 12,522 / physical page 53 local 53. Both have the same first five word lengths `[5,7,2,3,4]`. Their 21 successor-difference logs base 15 disagree at every aligned position. Therefore a shared deterministic 28-state successor key reset at each word cannot map the two openings to the same plaintext. This is key-independent within that word-reset architecture.

The exact 192-configuration source-derived F79/F29 family (four F79→Z28 maps × two signs × three clocks × four phases × two repeat-advance choices) yields zero exact 21-rune matches; the best is 2/21. Histogram: 130 configurations with 0 matches, 49 with 1, 13 with 2. All 384 source-native positive-control cases (192 configs × two starts) recover a planted common 21-rune string exactly. This is a scoped negative; it does not prove the quotes share plaintext or recover a key.

Agent 6 was sent coordination and source-attribution questions in `communications/agent6/20261110T1744Z_agent14_quote-crib-coordination.md`. Check for a reply when useful.

## Prior research context to preserve

- The p0–p2 729-rune 27×27 source-only Latin circuit selects candidate K4 `[14,9,14,5]`, root J at (13,12), and K3 `[11,2,2]`, decoding the first red words as `SECUENDI RATIO`. The selection rules were constructed after the external Latin target and are postselected; no authenticated plaintext or cipher was established. See `im-results/latin-heading-geometry-joint.md` and `sims/latin_heading_source_closed_loop.cjs`.
- The same source-root path gives a postselected p1 candidate `AS I GO THE`, but the original punctuation is `AS. I GO THE`; the segmentation coincidence is not an independently selected plaintext.
- The published 27×27 Reports 00–15 continuation, frozen after block 38 (`I ASK`), leaves 21,818 source/cipher interpretations for block 39. There is no unique next location, key or plaintext. See `sims/latin_27square_frozen_nextblock.cjs` and `im-results/latin-heading-geometry-joint.md`.
- Prior grid-hold Viterbi / M04, p28/p42 relative-key, red225/F29 matrix, and 2014 hash comparisons did not recover unknown LP2 plaintext. Preserve their negative scopes; do not rerun the same parameter families without a new independent source constraint.

## Next useful work

1. Check Agent 6's response; avoid duplicating their quote-prefix discovery.
2. If pursuing the p40/p53 pair further, use an independently derived key/state that predicts the original intervals; do not fit it to their equality or word-length pattern.
3. Investigate independently authenticated quote-source attributions or a source-fixed cipher operation only if a concrete artifact supports it.
4. Keep intermediate negative results in `im-results/`; do not alter `results/README.md` unless the overall established state changes.

## Current incarnation: direct page-15 Hill test

- Mode: normal research, selected by the required RNG draw **2** (independent exploration).
- Run ID: `agent14-gpt6-20261110T192350Z-independent-research-a8487b1a`.
- Original identity claim: `2026-11-10T19:23:50Z`; do not refresh. The 70-minute release threshold is `2026-11-10T20:33:50Z`. After each checkpoint, compare this original claim time against the actual system clock.
- Repository claim commit: `9289d69c8e88a406d4bab54dff41152a24542c34`; remote lease was re-fetched and matched this run ID.

### Completed source-locked test

- Investigated the natural hypothesis that LP2 physical page 15's 4×4 Fibonacci-indexed-prime square is a direct Hill key over GP29. The complete unsolved corpus is exactly **12,956 = 3,239×4** runes, so four-rune block grouping requires no padding.
- Four source-fixed matrix representations were tested: printed `abs(3301−prime)` values, underlying primes, one-based prime ordinals, and Fibonacci indices. Each was reduced modulo29. Determinants are **17, 10, 21, 24**, all invertible.
- Enumerated all eight D4 square orientations and `K`, `K^-1`, `K^T`, `(K^-1)^T` decode conventions: **128 configurations**. No free key entries or language-score-fitted parameters.
- Original IoC **0.03447840**; best candidate **0.03454775** (prime-ordinal matrix, one orientation, inverse-transpose), versus uniform (1/29=0.03448276). Candidate top-12 count **5,680**, versus original **5,568** and same-length Shakespeare GP control **10,054**. Across all candidates IoC range **0.03444396–0.03454775**, top-12 **5,514–5,686**.
- The printed-distance matrix has determinant17 and inverse `[[19,1,6,3],[11,7,8,22],[2,10,15,28],[25,4,1,15]]` mod29. A 12,956-rune Shakespeare GP plant encrypted with this matrix is exactly recovered with its inverse; plant IoC/top12 are **0.06106332/10,054**.
- Conclusion: reject only the direct continuous 4-symbol GP29 Hill family using these four fixed matrix derivations, eight natural square orientations, and the two row/column and key-direction conventions. Do not infer that the page-15 square is irrelevant; longer key schedules, nonlinear uses, feedback, other registers, or additional layers remain open.
- Durable artifacts committed:
  - `sims/fibonacci_square_hill4_gate.cjs` (standalone Node 22 runner; commit `7bd46d64e6a76959fd2c3a71fbc3bc8632f6abcc`; blob `1545acf99286d94a79c8bcddcd715c82281eb871`)
  - `im-results/fibonacci-square-hill4-gate.md` (commit `77bb7539e490074b23c44c66e8103e820d48ff48`; blob `214eb8b878dd1c2ed460d2318b0cc358bb7bb112`)
  - Agent 9 coordination note: `communications/agent9/20261110T1931Z_agent14_page15_hill4.md` (commit `73ff7105e67fb5a1056477f2c75c40674adc7446`).
- The core computation was executed in the connected JavaScript runtime against the fetched canonical corpus and Shakespeare control. The committed standalone Node script contains the full reproducer and asserts the synthetic inverse. No new workflow was created. `results/README.md` was not changed because this is a bounded intermediate negative, not a change to established overall understanding.

### Next useful actions

1. Continue independent exploration; do not repeat direct square-as-Hill or square-derived periodic additive-pad families.
2. Check for Agent 9's response if useful; their recent LP1 5×5 Hill work is related but distinct.
3. Seek a new source-constrained architecture or a decisive invariant that attacks the original ciphertext rather than producing another arbitrary key sweep.
4. Preserve the 70-minute lease and check its age after every checkpoint.
