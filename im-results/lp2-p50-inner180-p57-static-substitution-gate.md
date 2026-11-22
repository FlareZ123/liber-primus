# P50 180-cell interior → solved terminal plaintext: key-independent decoder gates

**Decision (22 November 2026): two plausible direct readouts fail on original source inputs.** The p50 printed table is 32×8. Removing a one-cell perimeter yields **30×6 = 180 interior bytes** and **76 perimeter bytes**. Independently, the two *already deciphered* final pages contain **85 p56 + 95 p57 = 180 GP29 runes**, while the last unresolved p55 contains **76 runes**. This suggests a human-readable input pairing: the 180 inner cells might decode the 180 known runes, and a reusable rule might then decode p55 using the perimeter. The repeated counts motivate the experiment without establishing that the original designer intended such a correspondence.

Freeze the simplest source order: printed rows1–30, columns1–6 (zero-based), row-major; assign their 180 values in order to source-native clear p56 followed by already-clear p57. Keep the original byte values. Two progressively more flexible, key-independent proposals can be checked against known plaintext. Both are rejected on untouched original data; neither yields unknown plaintext.

## Fixed 256-byte-symbol substitution: fails on p57 alone

Even a completely secret, arbitrary, position-independent mapping \`byte→GP29 rune\` must map *equal input bytes to equal output runes*. Its last95 interior byte positions align with the 95 clear p57 runes. In these 95 pairs there are **16 repeated-byte collisions, of which 15 require different known plaintext runes**. In one decisive case, original byte86 maps to GP P at p57 offset0 (grid cell122) but to GP E at p57 offset6 (grid cell130). An arbitrary secret 256-entry lookup cannot make both true.

| Frozen source projection | Repeated keys | Contradictory pairs |
|---|---:|---:|
| Full printed byte 0–255 | 16 | **15** |
| Full byte mod29 | 67 | 63 |
| First base60 digit | 90 | 84 |
| Second base60 digit | 46 | 44 |

The full-byte row already rejects every deterministic fixed lookup, regardless of its entropy. Its test plants a synthetic source-shaped 256→29 table and confirms 95/95 known plaintext runes, plus one-rune tamper rejection.

## Thirty independent row-affine keys: fail on all 180 clear runes

A less restrictive, printable codebook is **one independent affine substitution per printed row**, \`P=(a_r × byte + b_r) mod q\`, with two unconstrained secret field elements per row, for q=29 (native GP) or q=257 (preserves all bytes). This allows 30 separately chosen keys. It would let a human infer each row's two unknown coefficients from its six known inner cells, then apply the rule to the row's two outside columns.

The entire solved p56 GP29 text is recovered *from the already-published plaintext*, with its literal 128-hex hash omitted; the result has 85 runes. Append p57's exact 95 original, clear GP29 rune indices. In **every one of the 30 rows**, enumerate all 15 pairs of distinct byte coordinates to derive the unique candidate slope and intercept, then check all six original known plaintext cells. The best possible row fits are:

| Field and source representation | Fully consistent 6/6 rows | Most matches obtainable on any one row |
|---|---:|---:|
| GF29, original byte mod29 | **0 / 30** | 4 / 6 |
| GF257, original full byte | **0 / 30** | 3 / 6 |

The first row alone is a clear witness: its six original inner bytes are \`[249,156,222,247,4,183]\`, facing the six native p56 plaintext runes \`A N E N D W\` = \`[24,9,18,9,23,7]\`. In GF29, the first two pairs force \`a=17, b=25\`; the *third* byte predicts rune index0 (F), whereas p56's third letter is E (index18). An independent search over every possible choice of two source pairs does not rescue this row, or any of the other 29 rows. Synthetic 30-row affine codebooks with independently chosen keys yield 30/30 row reconstruction in both fields, validating that the receiver recognizes its own positive cases.

**Interpretation and boundary:** The exact 180/76 count pairing may be intentional, but these results exclude only the two literal *printed-order* models: a position-independent byte lookup and rowwise affine GF29/GF257 key. A separately selected transposition, nonlinear state, affine transform in another representation, or additional source-supplied key could still connect p50 and p55. Do not add freely fitted offsets or exception columns simply to preserve the coincidence. The controls establish the computational tests; they do not authenticate the historical cipher.

**Reproduce (Node22 CommonJS, read-only):**
- \`node sims/lp2_p50_inner180_p57_static_substitution_sft.cjs\` checks the static 95-rune p57 constraint using \`resources/liber-primus/lp2-corpus.json\`, \`lp2-grid-256.json\`.
- \`node sims/lp2_p50_inner180_row_affine_solved_terminal_sft.cjs\` checks all 180 terminal known runes against independent row-affine models using the same files and \`resources/liber-primus/lp1-plaintext-reference.txt\`.

**Recovered unknown LP2 plaintext: none.** A positive next step needs an original clue selecting a decoder more specific than arbitrary permutation or keyed layer.
