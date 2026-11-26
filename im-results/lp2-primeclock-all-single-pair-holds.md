# All 435 one-or-two-rune transparent sets under the actual prime-minus-one clock

**Agent43, 26 November 2026. Exact chapter-body rejection of eight of nine original intervals; the only remaining interval p54–55 has a nonprose maximum-likelihood inverse and no frozen-prefix continuation. No unknown LP2 plaintext or creator key recovered.**

The historic exception is plaintext F emits F literally and holds the consuming key clock. The [p0 Hahal-runa / Isruna source analysis](lp2-p0-cistercian-staves-totient-partition-hypothesis.md) interprets the opening 3|3 staves as E in the source-compatible traditional Futhorc row order, independently matching the third rune in both red title words. This makes a different transparent letter, or E in addition to F, worth testing as a specific extension. A prior test already excludes the direct p0 E-hold transfer at a fixed clock origin; the present search covers **every singleton and unordered pair of transparent letters** and all 3301 starting prime ordinals independently per chapter. It is distinct from the literal-letter-register restriction, which instead limits permitted plaintext support. No source selects the broader 435-set family, and the E stave reading does not authenticate any encryption exception.

## Complete model and exact inverse

For a fixed set H of size one or two, zero-based prime ordinal s, and plaintext GP index P:

- If P belongs to H, C=P and s remains unchanged.
- Otherwise C=(P+p_s−1) mod29 and s advances by one.

The inverse permits a hold when C belongs to H and a consuming transition when P=(C−(p_s−1)) mod29 is outside H. Both branches are retained when legal. The 29 singleton and 406 pair choices are fixed before the search. All starting ordinals 0..3300, all hidden hold choices, no word-boundary assumptions or intra-chapter resets. Nine body spans start at p0,3,8,15,23,27,33,40,54; remove only the opening rubric of lengths 13,16,12,20,16,19,10,8,9 respectively. Numeric-only p50 contributes no runes. Printed group order remains physical.

At each prime ordinal store a 435-bit reachability set. For each next ciphertext rune, intersect the bits with the precomputed membership mask for a hold or with the complement of the inverse-plaintext membership mask for a consume. OR each result into its new ordinal. This simultaneously propagates all keys and all initial ordinals with no beam/cap. Induction on the physical ciphertext index establishes exactness.

For the sole chapter surviving this exact reachability pass, compute exact native interpolated trigram Viterbi for each feasible hold set. State (ordinal, previous two hold flags) uniquely determines the two prior plaintext symbols from the ciphertext. The target-excluded native training model uses add-one unigram probabilities and bigram/trigram backoff strength10. Select key and state only on the first physical page, then freeze them for continuation. Also calculate the exact retrospective best full-body score across all feasible keys; do not confuse that with prediction.

## Original results

| Chapter starts p | Body runes | Prefix cut | Feasible hold sets at cut | Max legal prefix over all keys | Feasible full-body hold sets |
|---:|---:|---:|---:|---:|---:|
| 0 | 716 | 249 | 186 | 661 | 0 |
| 3 | 1129 | 201 | 336 | 994 | 0 |
| 8 | 1717 | 243 | 211 | 704 | 0 |
| 15 | 1883 | 139 | 430 | 729 | 0 |
| 23 | 1005 | 197 | 348 | 792 | 0 |
| 27 | 1414 | 215 | 289 | 668 | 0 |
| 33 | 1670 | 204 | 334 | 747 | 0 |
| 40 | 3000 | 223 | 266 | 735 | 0 |
| 54 | 299 | 223 | 289 | 299 | 92 |

Each body begins with **1,435,935 possible (hold set, initial ordinal) pairs**. Eight bodies are impossible even with freely chosen sets and starting ordinals. The source-motivated F+E set is not among the terminal surviving keys either; the E-only key survives only p54–55, not the opening p0 body that motivates it.

For p54–55, 289 prefix-feasible sets were all ranked on 223 runes. The optimum key is C+G, start 1858, -4.604920 nats/rune; the frozen continuation of 76 runes has **no legal path**. The 92 retrospective full-feasible sets include 29 singletons and 63 pairs; best full is EO, initial ordinal 547, -4.648065 nats/rune. The preserved full plaintext-index sequence is nonprose. This is a failure of the finite proposed receiver, not a recovered key.

## Authentic and planted controls

| Target | True H | True ordinal | Blind selected H | Selected ordinal | Prefix correct | Frozen continuation correct | Full retrospective correct |
|---|---|---:|---|---:|---:|---:|---:|
| p56_an_end (actual ciphertext) | F | 0 | F | 0 | 60/60 | 25/25 | 85/85 |
| 0_welcome | E | 1033 | E | 1033 | 254/257 | 258/258 | 512/515 |
| 0_koan_1 | F+E | 137 | F+E | 137 | 390/390 | 381/390 | 771/780 |
| jpg107-167 | I+A | 3300 | I+A | 3300 | 157/159 | 160/160 | 317/319 |

The actual p56 ciphertext was first reproduced by the historical algorithm; then its 60-rune prefix alone was given to the blind all-set/all-ordinal decoder, using the other eight native sections for the language model. It identifies the exact true hold set F and prime ordinal zero, and predicts all 25 remaining runes, giving **85/85 actual original p56 plaintext runes**. All three synthetic controls also identify both the exact planted hold set and ordinal. Across all four cases 824/833 held symbols are recovered (nine ambiguity errors in the F+E control). No claim of perfect plaintext-path identifiability merely from key recovery. All reported returned paths exactly replay their source ciphertext. Actual p57 cleartext also reproduces 95/95.

The first combined run stopped because a synthetic donor was incorrectly named 0_koan_2; corrected to the exact archived section jpg107-167 and reran the entire experiment. No findings from the failed run are used. The original reachability stage had already completed separately and agreed with the full rerun.

**Decision:** close this one-/two-rune transparent-set extension of the authentic prime clock, including the opening E and F+E interpretations in the specified origin domain. The independently calibrated full decoder supplies no unknown plaintext. Different reset boundaries, larger hold sets, reversed or nonlinear prime clocks, non-GP-register intermediates or other operations are outside the theorem; the source currently supplies no reason to enlarge the hold set.

[CommonJS SFT](../sims/lp2_primeclock_all_single_pair_holds_sft.cjs) · [raw results, all feasible sets and full terminal key ranking](lp2-primeclock-all-single-pair-holds-output.json). Exact JS experiment executed against repository source blobs 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and 1b064ef6d85819b7d96adaff31a82d1ec551598f; standalone Node wrapper not separately executed. No CI launched.
