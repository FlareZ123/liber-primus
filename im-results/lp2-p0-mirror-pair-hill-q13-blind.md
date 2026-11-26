# Opening p0–2 mirrored-pair GF29 Hill plus shared q13: calibrated blind inverse

**Decision, Agent18, 26 November 2026:** a direct blind receiver recovered both unknown inverse-matrix rows and all 26 shifts in three independent literary plants but produced incoherent output on original p0–2. No unknown plaintext or authentic key. This is a predictive search negative for the specified receiver, not an exhaustive all-key exclusion.

## Source motivation and scope

The original p0–2 pages repeat two three-bar crosses in exact opposite orientations. Previous [mirror-pad work](lp2-p0-three-cross-symmetric-key-native-gp-gate.md) considered equal/opposite symmetric additive shifts; [physical art analysis](p0-rotated-cross-source-readorder-gate.md) confirms the image reuse. A separate interpretation treats two opposing rune streams as inputs to a shared invertible 2×2 mixing operation rather than imposing equal or opposite pads. The 13-rune red opening title and adjacent 13-dot mark suggest, but do not prove, a period-13 clock. The physical page sizes are 262,266,201; use full pages including red heading for the fixed outside-in pairing. This is an independently motivated hypothesis, not an authenticated algorithm or a claim about all possible cross meanings.

For pair index i from each page end, j=n−1−i, the inverse is

    [P_i,P_j]^T = A [C_i,C_j]^T + [kL[i mod 13], kR[i mod 13]]^T mod 29

A is a shared nonsingular GF29 matrix, both 13-shift vectors are unknown, each page resets pair phase to zero, and one odd middle glyph passes unchanged. Encryption applies A inverse after removing the shift vector. The model uses ordinary consuming arithmetic without literal-F holds; those would require a separately specified coupled emission law. It ignores printed word boundaries.

## Receiver and calibration

Train a smoothed rune bigram model on the nine native solved records and the first 400 lines of the pinned Emerson source (excluding the first 1000 normalized runes). Apply deterministic greedy GP conversion to literary controls (V→U, K→C, Z→S, QU→CW; longest native rune tokens within words). Infer the left and right matrix rows separately because each produces a contiguous language rail. Enumerate all 840 nonzero GF29 row vectors. For each phase, take the eight strongest unigram shifts, then optimize the complete cyclic bigram objective by exact dynamic programming within those candidates. Refine the top 24 rows using all 29 shifts and exact cyclic DP; take the highest-scoring linearly independent pair. The right rail's bigram direction is reversed relative to outside-in traversal. No p2 glyph enters row or key selection.

All three controls were partitioned into the exact physical-page lengths and fitted using only the first two pages. They use independent seeded hidden matrices and shift vectors and two nonoverlapping Gibran spans plus a Shakespeare span, none in the language-model training data.

| Control | Hidden matrix | All 26 shifts | Held-out match | Holdout gain, nats/rune vs uniform |
| --- | --- | --- | --- | ---: |
| Gibran A | exact | exact | 201/201 | +0.707473 |
| Gibran B | exact | exact | 201/201 | +0.697664 |
| Shakespeare | exact | exact | 201/201 | +0.649388 |
| Original p0–2 | not authenticated | not authenticated | no readable text | −1.970250 |

The controls predict 600/600 key-dependent held-out runes plus 3 unchanged central fringe runes. All controls and original fitted output replay exactly. On the original, training gain is −0.382218 nats/rune and held-out p2 gain is −1.970250. The returned inverse rows are [11,8] and [4,28], and the opening begins D S O F F C C T J S C E S AE S R. The held-out p2 starts P AE T AE NG TH AE W NG EO H J T J P AE. Neither is readable. Exact round-trip is an implementation invariant shared by all valid matrices and shifts, not an authentication test.

## Reproduction and next decision

Run `node sims/lp2_p0_mirror_pair_hill_q13_blind_sft.cjs`. The actual experiment executed in connected V8 with the pinned inputs; no Windows CI run is claimed. See [compact captured output](lp2-p0-mirror-pair-hill-q13-blind-output.json) for exact matrix and key candidates. The staged shortlist is heuristic across rows; the 29-shift cyclic DP is exact only for rows that reach refinement. Three successful plants do not certify universal recovery. Retire the specified shared page-mirror, q13 ordinary-consuming predictive receiver unless independent source evidence changes the model. No claim about arbitrary mirror-state laws, unknown period, F-hold, noncanonical register, or other pair framing.
