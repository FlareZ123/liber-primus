# Spacing-free GP-prime predecessor autokey: exact p54 reachability exclusion

**Agent16, 24 November 2026 — Director task #2611.** No unknown LP2 plaintext or key recovered.

## Decision

Retire the exact spacing-free rule

\[
C_i = P_i + \operatorname{prime}(P_{i-1}) - 1 \pmod{29}
\]

for consuming plaintext runes, with literal plaintext F emitted unchanged and not advancing the predecessor state. The previous state is the previous *consuming* plaintext rune. All 29 possible initial GP29 predecessor states become impossible on original p54, by zero-based rune offset 75 at the latest. The original p54 contains 232 runes; p55 contains 76, including its incoming carried rune. There is therefore no legal p54 boundary distribution from which to predict p55.

This is an exact reachability exclusion, not a language-score rejection. The original was not scored or tuned after the reachability failure.

## Why this operation was tested

The GP29 chart supplies a printed prime value for each of its 29 runes. The solved p56 cipher uses the prime-minus-one shift with a literal-F non-consuming hold. Those are recognizable, human-visible ingredients for a compact predecessor-feedback hypothesis. They do **not** authenticate the additional choice that the preceding consuming plaintext rune supplies the next shift. The test was a bounded way to evaluate that specific, simple candidate rather than an unconstrained nonlinear-function search.

The operation is distinct from #841's previous-*ciphertext-word* prime sum and from the earlier plaintext-word self-prime/fifth-back model. It is also distinct from the all-function q1 intact-group CSP: this test removes printed spaces and uses a fixed source-derived predecessor function.

## Frozen inverse and exact scope

For state \(s=P_{i-1}\), a consuming rune must satisfy

\[
P_i = C_i - \operatorname{prime}(s) + 1 \pmod{29},
\qquad s \leftarrow P_i,
\]

and the recovered \(P_i\) must be nonzero. A literal plaintext F is possible only when \(C_i=0\); it emits zero and leaves \(s\) unchanged. Thus every ciphertext zero has exactly two possible branches:

1. hold literal F and preserve the previous consuming state; or
2. consume the rune using the formula above, provided the result is nonzero.

Every nonzero ciphertext rune must consume. There are no word boundaries, no fitted lookup table, no sign/multiplier/prime variants, and no reset at the p54→p55 page turn. The initial state is exhaustively enumerated over all 29 GP29 rune indices.

The source-bound inputs are:

- resources/liber-primus/lp2-corpus.json, Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165;
- resources/liber-primus/lp2-transcription.txt, Git blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7;
- resources/external/relikd-solved-gp29-native-v1.json, Git blob 1b064ef6d85819b7d96adaff31a82d1ec551598f.

The SFT asserts that transcription segments 53 and 54 reproduce canonical physical p54 and p55 respectively. It concatenates their rune tapes without a page reset, preserving p55's incoming carry.

## Native-control calibration

Before inspecting original p54, seven independent native plaintext sections were encrypted with the frozen rule using seven distinct effective initial-shift classes. A rune trigram model was trained on the other eight solved sections for each control; the entire target section, including its holdout, was excluded. The frozen score used unigram add-0.15 smoothing, a bigram prior of 4 and a trigram prior of 5. The first 75% of each generated ciphertext selected the initial effective shift among all 24 distinct residues of the 29 prime-minus-one states.

| Native control | Runes | Fit | Planted state / shift | Effective shift rank | Held-out exact |
|---|---:|---:|---:|---:|---:|
| WELCOME | 515 | 386 | 11 / 7 | 1 | 128/129 |
| KOAN1 | 780 | 585 | 18 / 8 | 1 | 195/195 |
| LOSS OF DIVINITY | 755 | 566 | 24 / 9 | 1 | 189/189 |
| jpg107–167 | 319 | 239 | 3 / 6 | 1 | 80/80 |
| WARNING | 184 | 138 | 7 / 18 | 1 | 46/46 |
| WISDOM | 157 | 117 | 22 / 24 | 1 | 40/40 |
| jpg229 | 89 | 66 | 26 / 15 | 1 | 23/23 |

All seven planted effective shifts ranked first; six controls predicted every held-out rune, and WELCOME missed one. Wrong initial-shift controls often converge to the same later state and predict the same suffix. Therefore the native controls calibrate prefix selection, but a p55 suffix alone would not authenticate the initial predecessor state. The prime-minus-one map has 24 distinct residues for 29 rune states, so exact initial rune identity is intrinsically ambiguous inside its five collision classes.

## Original p54: exact impossibility

Original p54 has 232 runes and exactly three ciphertext F/zero positions: offsets 41, 65 and 195. At a zero, both legal branches were retained. A state-only reachability DP exhausts every path because the next transition depends only on the previous consuming plaintext rune. An independent brute-force enumeration of all 29 × 2^3 = 232 initial-state/zero-hold-mask combinations confirms the DP: **zero valid complete p54 paths**.

Every initial state dies before p54 ends. At the first impossible offset, the reachable previous state is a singleton and the required consuming inverse gives plaintext F even though the ciphertext is nonzero. The literal-F hold branch is unavailable there.

| First impossible p54 offset (0-based) | Ciphertext rune | Previous state index → printed prime | Initial states eliminated |
|---:|---|---:|---|
| 0 | A | 22 → 83 | 22 |
| 3 | D | 15 → 53 | 7 |
| 5 | TH | 17 → 61 | 8 |
| 8 | M | 27 → 107 | 3 |
| 13 | U | 10 → 31 | 1, 6, 17 |
| 24 | S | 26 → 103 | 26 |
| 26 | I | 4 → 11 | 5, 9, 11, 12, 14, 15, 19 |
| 46 | TH | 17 → 61 | 0, 10, 20, 23 |
| 63 | B | 14 → 47 | 24, 27, 28 |
| 75 | L | 21 → 79 | 2, 4, 13, 16, 18, 21, 25 |

At each listed failure, the ciphertext index equals \((\operatorname{prime}(s)-1)\bmod29\), so the only algebraic consuming inverse is \(P_i=0\). Since the ciphertext rune is nonzero, this contradicts the literal-F rule. The maximum number of simultaneously reachable predecessor states at any point was two.

Because no initial state survives the first 76 p54 runes, no p54 score, p55 prediction, or full-page reencryption claim is appropriate. The task's continuation gate is closed at the exact p54 reachability stage.

## Scope and next decision

This retires only the frozen GP-chart prime-minus-one previous-consuming-plaintext predecessor rule, with 29 initial states, literal-F holds, continuous spacing-free traversal, and no page reset. It does not exclude other predecessor functions, a separately source-selected state law, other ciphers, or lost historical companion material. The GP prime table and p56 prime-minus-one rule motivate the test but do not themselves select this receiver.

**No unknown LP2 plaintext, authentic key, complete mechanism, or continuation destination was recovered.**

## Reproduction

Run from the repository root:

node sims/lp2_gp_prime_predecessor_fhold_sft.cjs

The standalone Node.js SFT asserts the original transcription/corpus alignment, all seven target-excluded native controls, all 29 initial states, the exact first-failure offsets, and the independent 232-case F-mask enumeration. It uses only built-in Node.js modules.
