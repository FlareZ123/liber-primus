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

## Authentic literal-title F-hold composition: exact all-matrix obstruction

A distinct, source-fixed version treats the original red13 as the **public key**, excludes it from the p0 receiver, and uses lengths 249/266/201. For each page, both outside-in plaintext rails independently start native Vigenère at phase 0. A plaintext F emits Z=0 and holds the phase; a non-F emits Z=P+K mod29 and advances. The paired ciphertext is then the inverse linear matrix applied to the two intermediate Z values. The odd central rune, if present, passes through unchanged. This preserves authentic F-bypass without requiring a guess about whether mixed ciphertext zero denotes F.

The fixed key is exactly [15,8,18,3,6,19,27,0,15,26,18,21,5], the source GP ordinals in reading order. All 840 nonzero projection rows are tested by an exact phase/previous-plaintext DP. Fit p0 body and p1, freeze the best linearly independent row pair, then decode p2. Three hidden-matrix controls using the same Gibran and Shakespeare donors but independent seeds recover all three matrices and 603/603 heldout runes (600 keyed + 3 fringe), with gains +0.683200/+0.664184/+0.658231 nats/rune. They replay exactly.

The original p0 body and p1 admit only 12 individual rows and 128 ordered invertible row pairs. The best training matrix is [[15,10],[17,23]], with score −2498.634353; its left p2 rail becomes mathematically impossible at outside-in pair index29 (zero-based), not merely linguistically weak. Then exhaust all 12 remaining projection rows on p2 **without any language score**. Only [6,3] and [17,23] survive. The latter is 27 times the former modulo29, hence their determinant is zero. There are **zero nonsingular 2×2 matrices** compatible with the complete original p0 body/p1/p2 under this model.

This is a language-independent exact exclusion of every shared invertible matrix for the specified literal key, inward rail clocks, phase-zero page resets, ordinary canonical GP29 and fixed physical-body framing. It does not exclude other keys, phase origins, continuous cross-page clocks, or alternate source maps. The ordinary unknown-key branch above remains a separate calibrated predictive negative, not an all-key theorem.

Reproducer: `node sims/lp2_p0_mirror_pair_literal_title_fhold_sft.cjs`. Both the hidden-matrix inverse and the independent phase-bitmask feasibility calculation were actually executed in connected V8; the combined source integrates the latter certificate via the full exact state DP. [Captured output](lp2-p0-mirror-pair-literal-title-fhold-output.json).
